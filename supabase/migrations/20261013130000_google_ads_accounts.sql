-- google_ads_accounts: each Branchly customer's own connected Google Ads
-- account, linked via OAuth. Branchly is a multi-tenant SaaS — this
-- mirrors whatsapp_business_accounts: one row per owner, never a single
-- shared account for everyone.

CREATE TABLE public.google_ads_accounts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           TEXT        NOT NULL UNIQUE,
  customer_id        TEXT        NOT NULL,        -- Google Ads customer ID (digits only)
  login_customer_id  TEXT,                        -- optional: set only if accessed under a manager (MCC) account
  descriptive_name   TEXT,                        -- best-effort display name from the Google Ads account
  refresh_token      TEXT        NOT NULL,        -- OAuth refresh token for this owner's Google account
  connected_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.google_ads_accounts TO service_role;

ALTER TABLE public.google_ads_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.google_ads_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_google_ads_accounts_owner ON public.google_ads_accounts(owner_id);
