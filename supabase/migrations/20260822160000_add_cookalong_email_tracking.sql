-- Tracks which of the two pre-event emails (recipe list, then the Zoom
-- link) each signup has already received, so the cron routes that send
-- them can run idempotently — safe to re-trigger without double-emailing
-- anyone, and resumable if a run is interrupted partway through.
alter table public.cookalong_signups
  add column if not exists recipe_email_sent_at timestamptz,
  add column if not exists zoom_link_email_sent_at timestamptz;
