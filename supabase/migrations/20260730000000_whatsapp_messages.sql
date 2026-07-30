-- whatsapp_messages: tracks every outbound WhatsApp message sent through
-- the WhatsApp Business API, with delivery/read status updated by webhook.

CREATE TABLE public.whatsapp_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        TEXT        NOT NULL,
  to_phone        TEXT        NOT NULL,
  template_name   TEXT,
  body_text       TEXT,
  wa_message_id   TEXT        UNIQUE,         -- Meta's wamid
  status          TEXT        NOT NULL DEFAULT 'sent'
                              CHECK (status IN ('sent','delivered','read','failed')),
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  failed_at       TIMESTAMPTZ,
  error_data      JSONB,
  metadata        JSONB       NOT NULL DEFAULT '{}'::jsonb
);

GRANT ALL ON public.whatsapp_messages TO service_role;

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.whatsapp_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_wa_messages_owner      ON public.whatsapp_messages(owner_id, sent_at DESC);
CREATE INDEX idx_wa_messages_wamid      ON public.whatsapp_messages(wa_message_id) WHERE wa_message_id IS NOT NULL;
CREATE INDEX idx_wa_messages_status     ON public.whatsapp_messages(status);
