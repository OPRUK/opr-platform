export function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;

  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
}

export function decodeAal(accessToken: string): string | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof decoded.aal === "string" ? decoded.aal : null;
  } catch {
    return null;
  }
}
