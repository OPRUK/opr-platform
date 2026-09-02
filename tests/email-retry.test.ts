import assert from "node:assert/strict";
import test from "node:test";

import { sendEmail } from "../lib/email.ts";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.RESEND_API_KEY;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalApiKey;
});

test("retries a rate-limited idempotent email and succeeds", async () => {
  process.env.RESEND_API_KEY = "test-key";
  let requests = 0;
  globalThis.fetch = async () => {
    requests += 1;
    if (requests === 1) {
      return new Response(
        JSON.stringify({ name: "rate_limit_exceeded", message: "Too many requests." }),
        { status: 429, headers: { "retry-after": "0" } },
      );
    }
    return new Response(JSON.stringify({ id: "email-id" }), { status: 200 });
  };

  const result = await sendEmail({
    to: "reader@example.com",
    subject: "Newsletter",
    html: "<p>Hello</p>",
    idempotencyKey: "newsletter-reader",
    retry: { maxAttempts: 3, minimumDelayMs: 0 },
  });

  assert.equal(requests, 2);
  assert.equal(result.sent, true);
  assert.equal(result.attempts, 2);
});

test("does not retry a permanent provider rejection", async () => {
  process.env.RESEND_API_KEY = "test-key";
  let requests = 0;
  globalThis.fetch = async () => {
    requests += 1;
    return new Response(
      JSON.stringify({ name: "validation_error", message: "The address is invalid." }),
      { status: 400 },
    );
  };

  const result = await sendEmail({
    to: "invalid@example.com",
    subject: "Newsletter",
    html: "<p>Hello</p>",
    idempotencyKey: "newsletter-invalid",
    retry: { maxAttempts: 3, minimumDelayMs: 0 },
  });

  assert.equal(requests, 1);
  assert.equal(result.sent, false);
  assert.equal(result.status, 400);
  assert.equal(result.errorCode, "validation_error");
  assert.equal(result.errorMessage, "The address is invalid.");
});

test("never retries without an idempotency key", async () => {
  process.env.RESEND_API_KEY = "test-key";
  let requests = 0;
  globalThis.fetch = async () => {
    requests += 1;
    return new Response(
      JSON.stringify({ name: "rate_limit_exceeded", message: "Too many requests." }),
      { status: 429, headers: { "retry-after": "0" } },
    );
  };

  const result = await sendEmail({
    to: "reader@example.com",
    subject: "Newsletter",
    html: "<p>Hello</p>",
    retry: { maxAttempts: 3, minimumDelayMs: 0 },
  });

  assert.equal(requests, 1);
  assert.equal(result.sent, false);
  assert.equal(result.attempts, 1);
});
