import nodemailer from "nodemailer";
import envVariables from "./env.js";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

export const sendEmail = async (options: {
  to: string;
  subject: string;
  message: any;
}) => {
  const transportOptions = {
    host: envVariables.SMTP_HOST,
    port: Number(envVariables.SMTP_PORT),
    secure: false,
    auth: {
      user: envVariables.SMTP_MAIL,
      pass: envVariables.SMTP_APP_PASS,
    },
    authMethod: "LOGIN",
  } as SMTPTransport.Options;
  const transporter = nodemailer.createTransport(transportOptions);
  const mailOptions = {
    from: envVariables.SMTP_MAIL || "",
    to: options.to,
    subject: options.subject,
    html: options.message,
  };
  await transporter.sendMail(mailOptions);
};
