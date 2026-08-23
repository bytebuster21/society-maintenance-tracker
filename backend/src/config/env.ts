import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  JWT_SECRET: process.env.JWT_SECRET || "society-jwt-secret-key-12345",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  DEFAULT_OVERDUE_DAYS: parseInt(process.env.DEFAULT_OVERDUE_DAYS || "3", 10),
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "Society Admin <no-reply@societyportal.com>",
};
