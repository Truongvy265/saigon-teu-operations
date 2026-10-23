import { badRequest } from "./utils/errors";

export const isProduction = process.env.NODE_ENV === "production";
export const authMode =
  process.env.AUTH_MODE || (isProduction ? "firebase" : "development");

if (isProduction && authMode !== "firebase") {
  throw new Error("Production requires AUTH_MODE=firebase");
}

export const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

if (isProduction && (!process.env.CORS_ORIGINS || corsOrigins.includes("*"))) {
  throw new Error("Production requires explicit CORS_ORIGINS without wildcard");
}

if (isProduction && !process.env.FIREBASE_PROJECT_ID) {
  throw new Error("Production requires FIREBASE_PROJECT_ID");
}

if (
  isProduction &&
  !process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 &&
  !process.env.GOOGLE_APPLICATION_CREDENTIALS
) {
  throw new Error(
    "Production requires FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 or GOOGLE_APPLICATION_CREDENTIALS",
  );
}

export const assertConfiguredOrigin = (origin?: string) => {
  if (!origin) return true; // CLI, health monitors and same-origin requests.
  if (corsOrigins.includes(origin.replace(/\/$/, ""))) return true;
  throw badRequest("Origin is not allowed");
};
