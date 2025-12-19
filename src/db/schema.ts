import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// -------------------- TABLES --------------------
// ---- Users ----
export const usersDBTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),

  name: text("name").notNull(),
  age: integer("age").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isVerified: boolean("is_verified").default(false),
});

// ---- User Otp Verify ----
// Will check updateAt for otp verify time
export const usersOtpVerifyDBTable = pgTable("users-otp-validate", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  userId: text("user_id").references(() => usersDBTable.id),
  otp: text("otp").notNull(),
});

// -------------------- RELATIONS --------------------

// -------------------- ZOD Schemas --------------------
export const signUpUserDBSchema = createInsertSchema(usersDBTable);

// -------------------- TYPE --------------------
export type SignUpUserDBEntity = typeof usersDBTable.$inferInsert;
