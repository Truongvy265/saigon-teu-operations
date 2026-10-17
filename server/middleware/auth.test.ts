import assert from "node:assert/strict";
import test from "node:test";
import { developmentIdentityAllowed, extractBearerToken } from "./auth.js";

test("extractBearerToken accepts a well-formed Bearer token", () => {
  assert.equal(extractBearerToken("Bearer firebase-token"), "firebase-token");
  assert.equal(extractBearerToken("bearer firebase-token"), "firebase-token");
});

test("extractBearerToken rejects missing or malformed authorization headers", () => {
  assert.equal(extractBearerToken(undefined), null);
  assert.equal(extractBearerToken("Basic credentials"), null);
  assert.equal(extractBearerToken("Bearer"), null);
  assert.equal(extractBearerToken("Bearer token extra"), null);
});

test("development identity is never allowed in production", () => {
  assert.equal(developmentIdentityAllowed("development", false), true);
  assert.equal(developmentIdentityAllowed("firebase", false), false);
  assert.equal(developmentIdentityAllowed("development", true), false);
  assert.equal(developmentIdentityAllowed("firebase", true), false);
});
