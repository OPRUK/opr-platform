import { createHmac, timingSafeEqual } from "node:crypto";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://otherpeoplesrecipes.co.uk";

function secret() {
  return process.env.UNSUBSCRIBE_SECRET || "";
}

function signatureFor(email: string) {
  const signingSecret = secret();
  if (!signingSecret) return "";

  return createHmac("sha256", signingSecret)
    .update(`opr-marketing-unsubscribe:${email.toLowerCase().trim()}`)
    .digest("base64url");
}

export function createUnsubscribeLink(email: string) {
  const normalisedEmail = email.toLowerCase().trim();
  const token = signatureFor(normalisedEmail);
  if (!token) return null;

  const url = new URL("/unsubscribe", siteUrl);
  url.searchParams.set("email", normalisedEmail);
  url.searchParams.set("token", token);
  return url.toString();
}

export function hasValidUnsubscribeToken(email: string, token: string) {
  const expected = signatureFor(email);
  if (!expected || !token) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(token);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
