// Email addresses are not secret and this list is used from both server and
// client code (the admin sign-in form), so this file intentionally has no
// "server-only" guard.
export const ADMIN_EMAILS = [
  "chaten@otherpeoplesrecipes.co.uk",
  "david@oberoi-morris.com",
  "amandawilliams@legallyblondelawyers.com",
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalised = email.trim().toLowerCase();
  return (ADMIN_EMAILS as readonly string[]).includes(normalised);
}
