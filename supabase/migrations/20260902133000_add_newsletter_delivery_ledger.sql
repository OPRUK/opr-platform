-- Durable, server-only record of newsletter delivery attempts. This prevents
-- duplicate sends after Resend's 24-hour idempotency window and lets the
-- MFA-protected admin page target only recipients who still need an email.
create table if not exists public.newsletter_deliveries (
  newsletter_id text not null,
  email text not null,
  name text,
  status text not null check (status in ('sending', 'sent', 'failed')),
  attempts integer not null default 0,
  provider_status integer,
  error_code text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (newsletter_id, email)
);

alter table public.newsletter_deliveries enable row level security;
revoke all on table public.newsletter_deliveries from anon, authenticated;

comment on table public.newsletter_deliveries is
  'Server-only delivery ledger for idempotent OPR newsletter sends.';
