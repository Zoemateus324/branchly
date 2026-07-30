// Server-only helpers for the WhatsApp Business API (Meta Graph API).
//
// SETUP REQUIRED:
//   1. In your Meta App, add the "WhatsApp" product.
//   2. Generate a permanent System User access token with
//      whatsapp_business_messaging + whatsapp_business_management scopes.
//   3. Register a webhook URL:
//        https://branchly.com.br/api/whatsapp/webhook
//      Subscribe to the "messages" webhook field.
//   4. Set these server environment variables:
//        WHATSAPP_TOKEN            — permanent access token
//        WHATSAPP_PHONE_NUMBER_ID  — from WhatsApp > Getting Started
//        WHATSAPP_WEBHOOK_VERIFY_TOKEN — any random string you choose

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function getWhatsAppConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    const missing = [
      ...(!token ? ["WHATSAPP_TOKEN"] : []),
      ...(!phoneNumberId ? ["WHATSAPP_PHONE_NUMBER_ID"] : []),
    ];
    throw new Error(
      `WhatsApp integration is not configured. Missing: ${missing.join(", ")}.`,
    );
  }
  return { token, phoneNumberId };
}

export interface WhatsAppSendResult {
  messageId: string;
}

/**
 * Sends a free-form text message to a phone number.
 * The phone must have opted in (WhatsApp policy requires opt-in for
 * business-initiated messages outside a 24-hour customer-service window).
 */
export async function sendWhatsAppText(
  toPhone: string,
  text: string,
): Promise<WhatsAppSendResult> {
  const { token, phoneNumberId } = getWhatsAppConfig();

  const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizePhone(toPhone),
      type: "text",
      text: { preview_url: false, body: text },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp API error (${res.status}): ${body}`);
  }

  const json = (await res.json()) as {
    messages?: { id: string }[];
  };
  const messageId = json.messages?.[0]?.id;
  if (!messageId) throw new Error("WhatsApp API returned no message ID");
  return { messageId };
}

/**
 * Sends an approved template message.
 * `components` follows the WhatsApp template component spec:
 *   https://developers.facebook.com/docs/whatsapp/api/messages/message-templates
 */
export async function sendWhatsAppTemplate(
  toPhone: string,
  templateName: string,
  languageCode: string,
  components?: object[],
): Promise<WhatsAppSendResult> {
  const { token, phoneNumberId } = getWhatsAppConfig();

  const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizePhone(toPhone),
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components?.length ? { components } : {}),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp API error (${res.status}): ${body}`);
  }

  const json = (await res.json()) as {
    messages?: { id: string }[];
  };
  const messageId = json.messages?.[0]?.id;
  if (!messageId) throw new Error("WhatsApp API returned no message ID");
  return { messageId };
}

/** Returns info about the configured WhatsApp Business phone number. */
export async function getPhoneNumberInfo(): Promise<{
  id: string;
  displayPhoneNumber: string;
  verifiedName: string;
}> {
  const { token, phoneNumberId } = getWhatsAppConfig();

  const url = new URL(`${GRAPH_BASE}/${phoneNumberId}`);
  url.searchParams.set(
    "fields",
    "id,display_phone_number,verified_name",
  );
  url.searchParams.set("access_token", token);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp API error (${res.status}): ${body}`);
  }

  const json = (await res.json()) as {
    id: string;
    display_phone_number: string;
    verified_name: string;
  };
  return {
    id: json.id,
    displayPhoneNumber: json.display_phone_number,
    verifiedName: json.verified_name,
  };
}

/**
 * Verifies the webhook signature from Meta.
 * Returns true if the X-Hub-Signature-256 header matches.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const sigParts = signatureHeader.split("=");
  if (sigParts[0] !== "sha256" || !sigParts[1]) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hex === sigParts[1];
}

/** Normalizes a phone number to E.164 format (digits only, no +). */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
