import { Hono } from "hono";
import {
  signUpUserDBSchema,
  usersDBTable,
  usersOtpVerifyDBTable,
} from "../../db/schema.js";
import {
  errorResponse,
  MESSAGES,
  successResponse,
} from "../../utils/responseHelper.js";
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import envVariables from "../../utils/env.js";
import {
  compareHashPassword,
  createHashPassword,
} from "../../utils/passwordManager.js";
import z from "zod";
import { sendEmail } from "../../utils/emailManager.js";
import { generateOTP } from "../../utils/index.js";

const authRoutes = new Hono();

// Sign-up
authRoutes.post("/sign-up", async (c) => {
  const requestData = await c.req.json();

  // Validate
  const payload = signUpUserDBSchema.parse(requestData);

  // Check exist user
  const checkUser = await db
    .select()
    .from(usersDBTable)
    .where(eq(usersDBTable.email, payload.email));
  if (checkUser?.[0]?.id) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 404,
      error: {
        message: "User Already exist with this email",
      },
    });
  }

  // Encrypt user password
  const password = await createHashPassword(payload.password);

  // Create user
  const user = await db
    .insert(usersDBTable)
    .values({
      name: payload.name,
      age: payload.age,
      email: payload.email,
      password: password,
    })
    .returning();
  if (!user?.[0]?.id) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 404,
      error: {
        message: "User not created",
      },
    });
  }

  // Create user token
  const tokenPayload = {
    id: user?.[0]?.id,
    name: payload.name,
    age: payload.age,
    email: payload.email,
  };
  const token = await sign(tokenPayload, envVariables.JWT_SECRET!);

  // Send otp to user
  return successResponse({
    c,
    message: MESSAGES.CREATED,
    data: {
      user: tokenPayload,
      token,
    },
    statusCode: 201,
  });
});

// Sign-in
authRoutes.post("/sign-in", async (c) => {
  const payload = await c.req.json();

  // Validate
  const payloadData = z
    .object({ email: z.string(), password: z.string() })
    .parse(payload);

  // Check exist user
  const checkUser = (
    await db
      .select()
      .from(usersDBTable)
      .where(eq(usersDBTable.email, payloadData.email))
  )?.[0];
  if (!checkUser) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 404,
      error: {
        message: "User not found",
      },
    });
  }

  // Match password
  const matchPassword = await compareHashPassword(
    payloadData.password,
    checkUser.password
  );
  if (!matchPassword) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 404,
      error: {
        message: "Invalid credentials",
      },
    });
  }

  // --
  return successResponse({
    c,
    message: MESSAGES.FETCHED,
    data: {
      id: checkUser.id,
      name: checkUser.name,
      age: checkUser.age,
      email: checkUser.email,
      isVerified: checkUser.isVerified,
    },
    statusCode: 200,
  });
});

// Send verify account otp
authRoutes.post("/send-verify-user-otp", async (c) => {
  const reqData = await c.req.json();
  // Validate
  const payload = z.object({ email: z.string() }).parse(reqData);

  // Check email
  const check = (
    await db
      .select()
      .from(usersDBTable)
      .where(eq(usersDBTable.email, payload.email))
  )?.[0];
  if (!check) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 404,
      error: {
        message: "User not found",
      },
    });
  }

  // Generate otp
  const otp = generateOTP();

  // Save otp to user otp table
  const checkOldOtp = (
    await db
      .select()
      .from(usersOtpVerifyDBTable)
      .where(eq(usersOtpVerifyDBTable.userId, check.id))
  )?.[0];
  if (checkOldOtp) {
    await db
      .update(usersOtpVerifyDBTable)
      .set({
        otp: otp.toString(),
        updatedAt: new Date(),
      })
      .where(eq(usersOtpVerifyDBTable.userId, check.id));
  } else {
    await db.insert(usersOtpVerifyDBTable).values({
      otp: otp.toString(),
      userId: check.id,
    });
  }

  // Send verify otp to mail
  await sendEmail({
    to: check.email,
    subject: "Your OTP Hono js backend",
    message: `<p>Your OTP is: <strong>${otp}</strong></p>`,
  });

  return successResponse({ c, message: MESSAGES.CREATED, statusCode: 200 });
});

// Verify account otp
authRoutes.post("/verify-user", async (c) => {
  const reqData = await c.req.json();
  // Validate
  const payload = z
    .object({ email: z.string(), otp: z.string() })
    .parse(reqData);

  // Check email
  const check = (
    await db
      .select()
      .from(usersDBTable)
      .where(eq(usersDBTable.email, payload.email))
  )?.[0];
  if (!check) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 404,
      error: {
        message: "User not found",
      },
    });
  }

  // Is already verified
  if (check.isVerified) {
    return successResponse({ c, message: MESSAGES.CREATED, statusCode: 200 });
  }

  // Get otp to user otp table
  const checkOldOtp = (
    await db
      .select()
      .from(usersOtpVerifyDBTable)
      .where(eq(usersOtpVerifyDBTable.userId, check.id))
  )?.[0];
  if (!checkOldOtp) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 404,
    });
  }

  // Verify otp
  const savedOtp = checkOldOtp.otp;
  const savedOtpLastTime = new Date(checkOldOtp.updatedAt);
  const currentTime = new Date();

  // Add 2 minutes to saved OTP time
  const otpExpiryTime = new Date(savedOtpLastTime.getTime() + 2 * 60 * 1000);

  if (currentTime > otpExpiryTime) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 404,
      error: {
        message: "Otp expired",
      },
    });
  }

  // Match otp
  if (savedOtp !== payload.otp) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 400,
      error: {
        message: "Wrong Otp",
      },
    });
  }

  // Verify user
  await db
    .update(usersDBTable)
    .set({
      isVerified: true,
    })
    .where(eq(usersDBTable.id, check.id));

  return successResponse({ c, message: MESSAGES.CREATED, statusCode: 200 });
});

export default authRoutes;
