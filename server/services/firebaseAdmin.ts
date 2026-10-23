import { readFileSync } from "node:fs";
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

type ServiceAccountJson = {
  project_id?: unknown;
  client_email?: unknown;
  private_key?: unknown;
};

let auth: Auth | null = null;

const toServiceAccount = (value: unknown, source: string): ServiceAccount => {
  if (!value || typeof value !== "object") {
    throw new Error(`${source} must contain a JSON object`);
  }
  const json = value as ServiceAccountJson;
  if (
    typeof json.project_id !== "string" ||
    typeof json.client_email !== "string" ||
    typeof json.private_key !== "string" ||
    !json.project_id ||
    !json.client_email ||
    !json.private_key.includes("BEGIN PRIVATE KEY")
  ) {
    throw new Error(`${source} is not a valid Firebase service account`);
  }
  return {
    projectId: json.project_id,
    clientEmail: json.client_email,
    privateKey: json.private_key,
  };
};

const parseJson = (text: string, source: string): ServiceAccount => {
  try {
    return toServiceAccount(JSON.parse(text), source);
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new Error(`${source} does not contain valid JSON`);
    throw error;
  }
};

export const decodeServiceAccountBase64 = (encoded: string) => {
  const normalized = encoded.replace(/\s/g, "");
  if (
    !normalized ||
    normalized.length % 4 === 1 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)
  ) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is not valid Base64");
  }
  const decoded = Buffer.from(normalized, "base64").toString("utf8");
  return parseJson(decoded, "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64");
};

const credentialFromEnvironment = () => {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  if (encoded) return cert(decodeServiceAccountBase64(encoded));

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const json = readFileSync(
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        "utf8",
      );
      return cert(parseJson(json, "GOOGLE_APPLICATION_CREDENTIALS"));
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("GOOGLE_"))
        throw error;
      throw new Error(
        "GOOGLE_APPLICATION_CREDENTIALS must point to a readable Firebase service-account JSON file",
      );
    }
  }

  throw new Error(
    "Firebase credentials are missing: set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 or GOOGLE_APPLICATION_CREDENTIALS",
  );
};

export const initializeFirebaseAuth = (): Auth => {
  if (auth) return auth;
  const source = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64
    ? "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64"
    : process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? "GOOGLE_APPLICATION_CREDENTIALS"
      : "Firebase credentials";
  try {
    const app =
      getApps()[0] ||
      initializeApp({
        credential: credentialFromEnvironment(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    auth = getAuth(app);
    return auth;
  } catch {
    throw new Error(
      `Firebase Admin initialization failed: ${source} is missing, unreadable, or invalid`,
    );
  }
};
