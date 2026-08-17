# Admin MFA runbook

This runbook is for the OPR project owner. Do not add authenticator secrets or
one-time codes to this file, GitHub, support tickets, analytics, or logs.

## Normal setup

1. Sign in at `/admin` with the authorised OPR team email.
2. Choose **Set it up now** or **Security**.
3. Add the QR code to an authenticator app and verify a six-digit code.
4. Sign out, sign in again, complete the MFA challenge, and confirm the recipe
   inbox and Founding Table export load.
5. Add a second authenticator from **Security** as a backup when practical.

Only verified TOTP factors unlock admin data. The Supabase project allows a
maximum of two factors per user.

## Lost-device recovery

Use this only when no enrolled authenticator remains available:

1. Sign in to the Supabase dashboard as a project owner.
2. Open Authentication, locate the authorised admin user, and use
   **Remove MFA factors**.
3. Return to `/admin`, use a fresh magic link, and enrol a new authenticator
   immediately.
4. Confirm the new factor works by signing out and completing a fresh sign-in.

Removing factors temporarily reduces the account to email-only authentication,
so complete recovery promptly and review account activity afterward.
