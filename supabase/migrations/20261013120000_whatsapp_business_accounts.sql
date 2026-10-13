-- WhatsApp Embedded Signup: lets each Branchly account connect its OWN
-- WhatsApp Business Account (WABA) and phone number through Meta's
-- Embedded Signup flow, instead of every owner sharing a single number
-- configured via the WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID env vars.
--
-- One row per owner (v1 simplification, same pattern as meta_connections
-- for Facebook Pages): if an owner completes Embedded Signup again, the
-- row is replaced rather than accumulating history.

CREATE TABLE IF NOT EXISTS public.whatsapp_business_accounts (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              TEXT        NOT NULL UNIQUE,
  waba_id               TEXT        NOT NULL,
  phone_number_id       TEXT        NOT NULL UNIQUE,
  display_phone_number  TEXT,
  verified_name         TEXT,
  -- The 6-digit PIN used to register this number for Cloud API (two-step
  -- verification). Meta may ask for it again later (e.g. re-registering
  -- after the number is deregistered), so we keep it rather than
  -- generating a new one blindly, which would fail if the number still
  -- expects the original PIN.
  register_pin          TEXT        NOT NULL,
  connected_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.whatsapp_business_accounts TO service_role;

ALTER TABLE public.whatsapp_business_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.whatsapp_business_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wa_business_accounts_phone
  ON public.whatsapp_business_accounts(phone_number_id);
