import dotenv from "dotenv";
dotenv.config();

const envVariables = {
  PORT: Number(process.env.PORT || 5002),
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  CURRENT_NODE_ENV: process.env.CURRENT_NODE_ENV,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_MAIL: process.env.SMTP_MAIL,
  SMTP_APP_PASS: process.env.SMTP_APP_PASS,
};
export default envVariables;
