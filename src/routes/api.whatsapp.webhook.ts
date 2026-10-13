// WhatsApp Business API webhook handler.
//
// Meta sends two kinds of requests to this endpoint:
//   GET  — webhook verification challenge (during setup)
//   POST — real-time events (message status updates, inbound messages)
//
// Register this URL in your Meta App:
//   WhatsApp > Configuration > Webhook URL:
//     https://branchly.com.br/api/whatsapp/webhook
//   Webhook fields to subscribe: messages
//   Verify token: value of WHATSAPP_WEBHOOK_VERIFY_TOKEN env var

import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookSignature } from "@/lib/whatsapp.server";

// ------------------------------------------------------------------ types --

interface WebhookStatusUpdate {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  errors?: { code: number; title: string }[];
}

interface WebhookReferral {
  source_url?: string;
  source_type?: string;
  source_id?: string;
  headline?: string;
  body?: string;
  ctwa_clid?: string;
}

interface WebhookInboundMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  referral?: WebhookReferral;
}

// Matches the tracking code embedded in prefilled wa.me link text, e.g.
// "Olá! Cheguei através de Google Ads. (cód: A1B2C3)"
const TRACKING_CODE_RE = /\(c[oó]d:\s*([A-Z0-9]{6,10})\)/i;

interface WebhookContact {
  wa_id: string;
  profile?: { name?: string };
}

interface WebhookEntry {
  id: string;
  changes: {
    value: {
      statuses?: WebhookStatusUpdate[];
      messages?: WebhookInboundMessage[];
      contacts?: WebhookContact[];
    };
    field: string;
  }[];
}

interface WebhookBody {
  object: string;
  entry?: WebhookEntry[];
}

// ----------------------------------------------------------------- helpers --

function ok(): Response {
  return new Response("EVENT_RECEIVED", { status: 200 });
}

async function handleStatusUpdates(
  statuses: WebhookStatusUpdate[],
): Promise<void> {
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");

  for (const s of statuses) {
    const now = new Date(Number(s.timestamp) * 1000).toISOString();

    const patch: Record<string, string | object | null> = { status: s.status };
    if (s.status === "delivered") patch.delivered_at = now;
    if (s.status === "read") patch.read_at = now;
    if (s.status === "failed") {
      patch.failed_at = now;
      patch.error_data = s.errors ?? null;
    }

    const { error } = await supabaseAdmin
      .from("whatsapp_messages")
      .update(patch)
      .eq("wa_message_id", s.id);

    if (error) {
      console.error(
        `[whatsapp.webhook] failed to update status for ${s.id}`,
        error,
      );
    }
  }
}

async function handleInboundMessages(
  messages: WebhookInboundMessage[],
  contacts: WebhookContact[] | undefined,
): Promise<void> {
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");

  const nameByPhone = new Map<string, string>();
  for (const c of contacts ?? []) {
    if (c.profile?.name) nameByPhone.set(c.wa_id, c.profile.name);
  }

  for (const m of messages) {
    const phone = m.from;
    const body =
      m.type === "text" && m.text?.body
        ? m.text.body
        : `[mensagem recebida: ${m.type}]`;
    const sentAt = new Date(Number(m.timestamp) * 1000).toISOString();

    let ownerId: string | null = null;
    let leadSource: string | null = null;

    // 1. Tracked link: the prefilled wa.me message carries our own tracking
    // code, which resolves both the owner and the channel directly — this
    // works even for a lead's very first message, before any prior contact.
    const codeMatch = body.match(TRACKING_CODE_RE);
    if (codeMatch) {
      const { data: link } = await supabaseAdmin
        .from("whatsapp_tracked_links")
        .select("owner_id, source")
        .eq("tracking_code", codeMatch[1].toUpperCase())
        .maybeSingle();
      if (link) {
        ownerId = link.owner_id;
        leadSource = link.source;
      }
    }

    // 2. Meta's own referral object is attached when the lead came from a
    // click-to-WhatsApp ad on Facebook or Instagram.
    if (!leadSource && m.referral) leadSource = "meta";

    // 3. Fall back to the Branchly account that most recently messaged this
    // phone number — there's no per-tenant WABA number in this design, so
    // ownership can only be inferred this way once no tracked link matches.
    if (!ownerId) {
      const { data: prior } = await supabaseAdmin
        .from("whatsapp_messages")
        .select("owner_id")
        .eq("to_phone", phone)
        .eq("direction", "outbound")
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prior) ownerId = prior.owner_id;
    }

    if (!ownerId) {
      console.warn(
        `[whatsapp.webhook] inbound message from unattributed phone ${phone} — skipping`,
      );
      continue;
    }

    const { error } = await supabaseAdmin.from("whatsapp_messages").insert({
      owner_id: ownerId,
      to_phone: phone,
      template_name: null,
      body_text: body,
      wa_message_id: m.id,
      status: "received",
      direction: "inbound",
      contact_name: nameByPhone.get(phone) ?? null,
      lead_source: leadSource ?? "direct",
      referral_data: m.referral ?? null,
      sent_at: sentAt,
      metadata: { type: m.type },
    });
    if (error) {
      console.error(
        `[whatsapp.webhook] failed to store inbound message ${m.id}`,
        error,
      );
    }
  }
}

// ------------------------------------------------------------------ route --

export const Route = createFileRoute("/api/whatsapp/webhook")({
  server: {
    handlers: {
      // Meta calls GET to verify the webhook during initial setup.
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
        if (mode === "subscribe" && token === verifyToken && challenge) {
          return new Response(challenge, { status: 200 });
        }
        return new Response("Forbidden", { status: 403 });
      },

      // Meta sends POST for every webhook event.
      POST: async ({ request }) => {
        const rawBody = await request.text();

        const sigHeader = request.headers.get("x-hub-signature-256");
        const valid = await verifyWebhookSignature(rawBody, sigHeader);
        if (!valid) {
          console.warn("[whatsapp.webhook] invalid signature — ignoring");
          return new Response("Forbidden", { status: 403 });
        }

        let body: WebhookBody;
        try {
          body = JSON.parse(rawBody) as WebhookBody;
        } catch {
          return ok();
        }

        if (body.object !== "whatsapp_business_account") return ok();

        for (const entry of body.entry ?? []) {
          for (const change of entry.changes ?? []) {
            if (change.field !== "messages") continue;
            const statuses = change.value?.statuses;
            if (statuses?.length) {
              await handleStatusUpdates(statuses).catch((e) =>
                console.error("[whatsapp.webhook] handleStatusUpdates", e),
              );
            }
            const messages = change.value?.messages;
            if (messages?.length) {
              await handleInboundMessages(
                messages,
                change.value?.contacts,
              ).catch((e) =>
                console.error("[whatsapp.webhook] handleInboundMessages", e),
              );
            }
          }
        }

        return ok();
      },
    },
  },
});
