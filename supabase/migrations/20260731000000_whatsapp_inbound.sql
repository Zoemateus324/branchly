-- Adds inbound message support to whatsapp_messages so the dashboard can
-- show full conversation threads, not just outbound delivery status.

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'outbound'
    CHECK (direction IN ('inbound', 'outbound'));

ALTER TABLE public.whatsapp_messages
  DROP CONSTRAINT IF EXISTS whatsapp_messages_status_check;

ALTER TABLE public.whatsapp_messages
  ADD CONSTRAINT whatsapp_messages_status_check
    CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'received'));

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS contact_name TEXT;

CREATE INDEX IF NOT EXISTS idx_wa_messages_owner_phone
  ON public.whatsapp_messages(owner_id, to_phone, sent_at DESC);
