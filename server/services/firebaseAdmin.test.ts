import assert from "node:assert/strict";
import test from "node:test";
import { decodeServiceAccountBase64 } from "./firebaseAdmin.js";

const validShape = {
  project_id: "example-project",
  client_email: "firebase-admin@example-project.iam.gserviceaccount.com",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nnot-a-real-key\n-----END PRIVATE KEY-----\n",
};

test("decodes a Base64 Firebase service-account JSON without exposing it", () => {
  const encoded = Buffer.from(JSON.stringify(validShape)).toString("base64");
  const decoded = decodeServiceAccountBase64(encoded);
  assert.equal(decoded.projectId, validShape.project_id);
  assert.equal(decoded.clientEmail, validShape.client_email);
});

test("rejects malformed Base64 Firebase credentials", () => {
  assert.throws(
    () => decodeServiceAccountBase64("not valid base64!"),
    /not valid Base64/,
  );
});

test("rejects JSON without required service-account fields", () => {
  const encoded = Buffer.from(
    JSON.stringify({ project_id: "only-one-field" }),
  ).toString("base64");
  assert.throws(
    () => decodeServiceAccountBase64(encoded),
    /not a valid Firebase service account/,
  );
});
