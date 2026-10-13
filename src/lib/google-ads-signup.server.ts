// Server-only helpers for Google Ads OAuth ("Conectar Google Ads"): lets
// each Branchly customer (this is a multi-tenant SaaS — see
// google-ads.server.ts) connect THEIR OWN Google Ads account, instead of
// Branchly reading a single shared account via static env vars.
//
// SETUP REQUIRED (done once, shared by every customer who connects):
//   1. In Google Cloud Console (console.cloud.google.com), create/select a
//      project and enable the "Google Ads API".
//   2. Configure the OAuth consent screen (app name, support email, and —
//      important for a SaaS — publish it to "In production" so any
//      customer's Google account can authorize it, not just test users
//      added by hand). The `adwords` scope is sensitive, so Google review
//      may be required before external users outside the 100-test-user cap
//      can complete this flow. This review is NOT something this code can
//      do for you.
//   3. Create an OAuth 2.0 Client ID (type: Web application) with an
//      authorized redirect URI matching GOOGLE_ADS_REDIRECT_URI below
//      (e.g. https://branchly.com.br/integrations/google-ads/callback).
//   4. Apply for a Google Ads API Developer Token under your own Google
//      Ads Manager (MCC) account:
//        https://developers.google.com/google-ads/api/docs/get-started/dev-token
//      This is a manual Google review and is the slowest step — start it
//      first. A token in "Test account" access level only works against
//      Google Ads test accounts, not real customer accounts; you need at
//      least "Basic access" for this SaaS flow to work against real data.
//   5. Set these server environment variables (shared — these describe
//      Branchly's own app, not any one customer):
//        GOOGLE_ADS_DEVELOPER_TOKEN
//        GOOGLE_ADS_CLIENT_ID
//        GOOGLE_ADS_CLIENT_SECRET
//        GOOGLE_ADS_REDIRECT_URI
//
// HOW THE PIECES FIT TOGETHER (see ConnectGoogleAdsButton.tsx for the
// client half, and integrations.google-ads.callback.tsx for the redirect
// landing page):
//   1. Customer clicks "Conectar Google Ads" → the client first calls
//      getGoogleAdsAuthUrl() (authenticated) to get a Google consent URL
//      with `state` set to their own owner id, then does a full-page
//      redirect to it.
//   2. Customer signs in with their OWN Google account (the one that
//      manages their Google Ads) and grants the `adwords` scope.
//   3. Google redirects the browser back to
//      /integrations/google-ads/callback?code=... — still the customer's
//      own browser session, so their Branchly login is still active.
//   4. That page calls completeGoogleAdsSignup({code}) (authenticated),
//      which exchanges the code, discovers which Google Ads customer
//      ID(s) that Google account can access, and stores the connection.

const API_VERSION = "v17";
const GOOGLE_ADS_BASE = `https://googleads.googleapis.com/${API_VERSION}`;

function getGoogleAdsAppConfig() {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_ADS_REDIRECT_URI;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const missing = [
    ...(!clientId ? ["GOOGLE_ADS_CLIENT_ID"] : []),
    ...(!clientSecret ? ["GOOGLE_ADS_CLIENT_SECRET"] : []),
    ...(!redirectUri ? ["GOOGLE_ADS_REDIRECT_URI"] : []),
    ...(!developerToken ? ["GOOGLE_ADS_DEVELOPER_TOKEN"] : []),
  ];
  if (missing.length) {
    throw new Error(
      `A integração com Google Ads ainda não foi configurada pela Branchly. Faltam: ${missing.join(", ")}.`,
    );
  }
  return { clientId: clientId!, clientSecret: clientSecret!, redirectUri: redirectUri!, developerToken: developerToken! };
}

/** Builds the Google OAuth consent URL. `state` should be the owner's userId. */
export function buildGoogleAdsAuthUrl(state: string): string {
  const { clientId, redirectUri } = getGoogleAdsAppConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/adwords",
    access_type: "offline",
    // Forces Google to hand back a refresh_token even if this customer
    // (or Google account) authorized this app once before.
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

/** Exchanges the OAuth authorization code for an access + refresh token. */
export async function exchangeGoogleAdsCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const { clientId, clientSecret, redirectUri } = getGoogleAdsAppConfig();

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Falha ao validar o código de autorização do Google (${res.status}): ${body}`);
  }
  const json = (await res.json()) as TokenResponse;
  if (!json.refresh_token) {
    throw new Error(
      "O Google não retornou um refresh token. Isso acontece se essa conta já havia autorizado o Branchly antes sem revogar o acesso — remova o acesso em myaccount.google.com/permissions e tente conectar de novo.",
    );
  }
  return { accessToken: json.access_token, refreshToken: json.refresh_token };
}

/**
 * Lists the Google Ads customer IDs the just-authenticated Google account
 * can access. v1 SIMPLIFICATION (mirrors the Facebook "first Page"
 * approach in meta.server.ts): returns the first accessible customer.
 * A Google account managing several Ads accounts would need to
 * disconnect/reconnect to pick a different one — multi-account picking is
 * a natural v2 addition.
 */
export async function listAccessibleCustomerIds(accessToken: string): Promise<string[]> {
  const { developerToken } = getGoogleAdsAppConfig();

  const res = await fetch(`${GOOGLE_ADS_BASE}/customers:listAccessibleCustomers`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": developerToken,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Falha ao listar contas do Google Ads (${res.status}): ${body}`);
  }
  const json = (await res.json()) as { resourceNames?: string[] };
  return (json.resourceNames ?? []).map((rn) => rn.replace("customers/", ""));
}

/** Best-effort lookup of a customer's descriptive (display) name. Non-fatal if it fails. */
export async function getCustomerDescriptiveName(
  customerId: string,
  accessToken: string,
): Promise<string | null> {
  try {
    const { developerToken } = getGoogleAdsAppConfig();
    const res = await fetch(
      `${GOOGLE_ADS_BASE}/customers/${customerId}/googleAds:search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": developerToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "SELECT customer.descriptive_name FROM customer LIMIT 1",
        }),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      results?: { customer?: { descriptiveName?: string } }[];
    };
    return json.results?.[0]?.customer?.descriptiveName ?? null;
  } catch {
    return null;
  }
}
