export type PinterestOAuthCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

type PinterestEnvironment = Record<string, string | undefined>;

export function configuredPinterestAccessToken(
  environment: PinterestEnvironment = process.env,
): string | null {
  const token = environment.PINTEREST_ACCESS_TOKEN?.trim();
  return token || null;
}

export function configuredPinterestOAuthCredentials(
  refreshToken: string | null,
  environment: PinterestEnvironment = process.env,
): PinterestOAuthCredentials | null {
  const clientId = environment.PINTEREST_CLIENT_ID?.trim();
  const clientSecret = environment.PINTEREST_CLIENT_SECRET?.trim();
  const normalisedRefreshToken = refreshToken?.trim();

  if (!clientId || !clientSecret || !normalisedRefreshToken) return null;
  return { clientId, clientSecret, refreshToken: normalisedRefreshToken };
}
