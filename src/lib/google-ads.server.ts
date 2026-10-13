// Server-only helpers for the Google Ads API.
//
// This is a multi-tenant SaaS: each Branchly customer connects their OWN
// Google Ads account via OAuth (see google-ads-signup.server.ts /
// ConnectGoogleAdsButton.tsx). GOOGLE_ADS_CUSTOMER_ID / an env-configured
// refresh token are NOT used for customer data — they exist only as an
// optional fallback for a single default/demo account (e.g. for Branchly's
// own internal testing), and getBestCampaigns always prefers the
// `customerId`/`refreshToken` overrides passed in by the caller, which
// come from that specific owner's row in `google_ads_accounts`.
//
// SETUP REQUIRED (shared across every customer who connects — see
// google-ads-signup.server.ts for the full walkthrough):
//   1. Apply for a Google Ads API developer token:
//        https://developers.google.com/google-ads/api/docs/get-started/dev-token
//   2. Create an OAuth 2.0 Client ID (type: Web application) in Google Cloud
//      Console with redirect URI GOOGLE_ADS_REDIRECT_URI.
//   3. Set these server environment variables:
//        GOOGLE_ADS_DEVELOPER_TOKEN
//        GOOGLE_ADS_CLIENT_ID
//        GOOGLE_ADS_CLIENT_SECRET
//        GOOGLE_ADS_REDIRECT_URI
//   Optional, single-account fallback only (not used for connected
//   customers — see note above):
//        GOOGLE_ADS_REFRESH_TOKEN
//        GOOGLE_ADS_CUSTOMER_ID
//        GOOGLE_ADS_LOGIN_CUSTOMER_ID

const API_VERSION = "v17";

interface GoogleAdsOverrides {
  customerId: string;
  refreshToken: string;
  loginCustomerId?: string | null;
}

function getGoogleAdsConfig(overrides?: GoogleAdsOverrides) {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = overrides?.refreshToken ?? process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const customerId = overrides?.customerId ?? process.env.GOOGLE_ADS_CUSTOMER_ID;
  const loginCustomerId =
    overrides?.loginCustomerId ?? process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  const missing = [
    ...(!developerToken ? ["GOOGLE_ADS_DEVELOPER_TOKEN"] : []),
    ...(!clientId ? ["GOOGLE_ADS_CLIENT_ID"] : []),
    ...(!clientSecret ? ["GOOGLE_ADS_CLIENT_SECRET"] : []),
    ...(!refreshToken ? ["GOOGLE_ADS_REFRESH_TOKEN"] : []),
    ...(!customerId ? ["GOOGLE_ADS_CUSTOMER_ID"] : []),
  ];
  if (missing.length) {
    throw new Error(
      `Google Ads integration is not configured. Missing: ${missing.join(", ")}.`,
    );
  }
  return {
    developerToken: developerToken!,
    clientId: clientId!,
    clientSecret: clientSecret!,
    refreshToken: refreshToken!,
    customerId: customerId!.replace(/-/g, ""),
    loginCustomerId: loginCustomerId?.replace(/-/g, ""),
  };
}

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google OAuth error (${res.status}): ${body}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token)
    throw new Error("Google OAuth returned no access token");
  return json.access_token;
}

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  clicks: number;
  impressions: number;
  costMicros: number;
  conversions: number;
  ctr: number;
}

/**
 * Fetches the best-performing campaigns (by conversions) from the last 30
 * days for the given customer. Pass `overrides` with a specific owner's
 * connected `customerId`/`refreshToken` (from google_ads_accounts) — the
 * env-var fallback is for a single default/demo account only, never for
 * customer data.
 */
export async function getBestCampaigns(
  overrides?: GoogleAdsOverrides,
): Promise<GoogleAdsCampaign[]> {
  const config = getGoogleAdsConfig(overrides);
  const accessToken = await getAccessToken(
    config.clientId,
    config.clientSecret,
    config.refreshToken,
  );

  const query = `
    SELECT campaign.id, campaign.name, campaign.status,
           metrics.clicks, metrics.impressions, metrics.cost_micros,
           metrics.conversions, metrics.ctr
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.conversions DESC
    LIMIT 10
  `.trim();

  const res = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${config.customerId}/googleAds:search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": config.developerToken,
        ...(config.loginCustomerId
          ? { "login-customer-id": config.loginCustomerId }
          : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Ads API error (${res.status}): ${body}`);
  }

  const json = (await res.json()) as {
    results?: {
      campaign: { id: string; name: string; status: string };
      metrics: {
        clicks: string;
        impressions: string;
        costMicros: string;
        conversions: number;
        ctr: number;
      };
    }[];
  };

  return (json.results ?? []).map((r) => ({
    id: r.campaign.id,
    name: r.campaign.name,
    status: r.campaign.status,
    clicks: Number(r.metrics.clicks ?? 0),
    impressions: Number(r.metrics.impressions ?? 0),
    costMicros: Number(r.metrics.costMicros ?? 0),
    conversions: Number(r.metrics.conversions ?? 0),
    ctr: Number(r.metrics.ctr ?? 0),
  }));
}
