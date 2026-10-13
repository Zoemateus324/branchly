// Server-only helpers for WhatsApp Embedded Signup (Meta's flow for Tech
// Providers / ISVs to let END CUSTOMERS connect their own WhatsApp
// Business Account, instead of the customer handing you a manually
// generated System User token).
//
// SETUP REQUIRED (on top of whatsapp.server.ts's own setup):
//   1. In your Meta App, add the "Facebook Login for Business" product.
//   2. Under WhatsApp > Configuration > Embedded Signup, create a signup
//      configuration (this is what hands you the numeric Configuration ID).
//   3. Set these environment variables:
//        VITE_META_APP_ID                      — your Meta App ID (public —
//          App IDs are not secrets, they're visible in every OAuth URL)
//        VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID — the Configuration ID above
//      Both are VITE_-prefixed because the Facebook JS SDK runs in the
//      browser (see ConnectWhatsAppButton.tsx) and needs them client-side.
//      META_APP_ID / META_APP_SECRET (server-only, already used by the
//      Facebook Page integration) are reused here for the code exchange.
//   4. WHATSAPP_TOKEN (already configured — see whatsapp.server.ts) must
//      belong to a System User with whatsapp_business_management on your
//      Business. Embedded Signup shares each customer's WABA with your
//      Business as a managed client asset, so that one token is then able
//      to send/receive for every WABA customers connect this way — no
//      per-customer token is needed.
//
// HOW THE PIECES FIT TOGETHER (see ConnectWhatsAppButton.tsx for the
// client half):
//   1. Customer clicks "Conectar WhatsApp" → FB.login() opens Meta's
//      embedded popup with the Configuration ID above.
//   2. Meta posts a `window.postMessage` event carrying `waba_id` and
//      `phone_number_id` once the customer finishes picking/creating
//      their WABA and phone number.
//   3. FB.login's own callback separately hands back a short-lived
//      authorization `code`.
//   4. The client sends { code, wabaId, phoneNumberId } to
//      completeWhatsAppEmbeddedSignup (whatsapp-signup.functions.ts),
//      which calls the three functions below and stores the connection.

const GRAPH_VERSION = "v23.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function getEmbeddedSignupAppConfig() {
  // Reuse the same Meta App credentials as the Facebook Page integration
  // (meta.server.ts) — Embedded Signup is configured on the same Meta App.
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    const missing = [
      ...(!appId ? ["META_APP_ID"] : []),
      ...(!appSecret ? ["META_APP_SECRET"] : []),
    ];
    throw new Error(
      `WhatsApp Embedded Signup is not configured. Missing: ${missing.join(", ")}.`,
    );
  }
  return { appId, appSecret };
}

function getSystemUserToken(): string {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) {
    throw new Error(
      "WhatsApp Embedded Signup is not configured. Missing: WHATSAPP_TOKEN.",
    );
  }
  return token;
}

/**
 * Exchanges the short-lived authorization code from FB.login for an
 * access token. This mainly serves as a server-side check that the
 * signup actually completed against YOUR app (code exchange fails if the
 * code is forged or stale) — the resulting token itself isn't normally
 * needed afterward, since WHATSAPP_TOKEN already has access to the
 * customer's WABA once it's shared with your Business (step below).
 */
export async function exchangeEmbeddedSignupCode(code: string): Promise<void> {
  const { appId, appSecret } = getEmbeddedSignupAppConfig();

  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("code", code);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Falha ao validar o código de autorização do WhatsApp (${res.status}): ${body}`,
    );
  }
}

/**
 * Registers a phone number for Cloud API use (required once per number
 * before it can send/receive). `pin` is a 6-digit string the number will
 * expect again if it's ever re-registered later — callers should
 * generate and persist it rather than inventing a new one each time.
 */
export async function registerPhoneNumber(
  phoneNumberId: string,
  pin: string,
): Promise<void> {
  const token = getSystemUserToken();

  const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", pin }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Falha ao registrar o número do WhatsApp (${res.status}): ${body}`,
    );
  }
}

/**
 * Subscribes this app to receive webhook events (messages, status
 * updates) for the given WhatsApp Business Account. Without this call,
 * the shared webhook endpoint never receives anything for that WABA even
 * though it's connected.
 */
export async function subscribeAppToWaba(wabaId: string): Promise<void> {
  const token = getSystemUserToken();

  const res = await fetch(`${GRAPH_BASE}/${wabaId}/subscribed_apps`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Falha ao inscrever o app nos eventos do WhatsApp (${res.status}): ${body}`,
    );
  }
}

/** Generates a random 6-digit PIN for phone number registration. */
export function generateRegistrationPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
