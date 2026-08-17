import assert from "node:assert/strict";
import test from "node:test";
import { decodeAal, extractBearerToken } from "../lib/admin-auth-token.ts";

function tokenWith(payload: Record<string, unknown>) {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encode({ alg: "none" })}.${encode(payload)}.signature`;
}

test("extractBearerToken accepts a well-formed bearer header", () => {
  assert.equal(extractBearerToken("Bearer header.payload.signature"), "header.payload.signature");
  assert.equal(extractBearerToken("bearer header.payload.signature"), "header.payload.signature");
});

test("extractBearerToken rejects missing or malformed authorization", () => {
  assert.equal(extractBearerToken(null), null);
  assert.equal(extractBearerToken("Basic token"), null);
  assert.equal(extractBearerToken("prefix Bearer token"), null);
  assert.equal(extractBearerToken("Bearer"), null);
  assert.equal(extractBearerToken("Bearer token with-spaces"), null);
});

test("decodeAal returns only a string AAL claim", () => {
  assert.equal(decodeAal(tokenWith({ aal: "aal1" })), "aal1");
  assert.equal(decodeAal(tokenWith({ aal: "aal2" })), "aal2");
  assert.equal(decodeAal(tokenWith({ aal: 2 })), null);
  assert.equal(decodeAal(tokenWith({})), null);
});

test("decodeAal rejects malformed tokens", () => {
  assert.equal(decodeAal(""), null);
  assert.equal(decodeAal("not-a-jwt"), null);
  assert.equal(decodeAal("header.invalid-json.signature"), null);
});
