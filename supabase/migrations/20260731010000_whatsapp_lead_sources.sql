-- Lead source attribution for inbound WhatsApp messages, plus a table
-- for owner-generated tracked wa.me links used to attribute channels
-- that don't carry attribution data natively (Google Ads, site, Pinterest,
-- Bling, etc). Meta (Facebook/Instagram) ads are attributed automatically
-- via WhatsApp's own "referral" object on click-to-WhatsApp ad messages.

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS lead_source TEXT;

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS referral_data JSONB;

CREATE TABLE IF NOT EXISTS public.whatsapp_tracked_links (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       TEXT        NOT NULL,
  label          TEXT        NOT NULL,
  source         TEXT        NOT NULL
                  CHECK (source IN ('google_ads', 'site', 'pinterest', 'bling', 'other')),
  tracking_code  TEXT        NOT NULL UNIQUE,
  wa_link        TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.whatsapp_tracked_links TO service_role;

ALTER TABLE public.whatsapp_tracked_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.whatsapp_tracked_links
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wa_tracked_links_owner
  ON public.whatsapp_tracked_links(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wa_messages_lead_source
  ON public.whatsapp_messages(owner_id, lead_source);
