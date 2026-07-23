// Server-only helpers for the Facebook integration (Meta Graph API).
//
// SETUP REQUIRED before this works in any environment:
//   1. Create a Meta App at developers.facebook.com (type: Business).
//   2. Add the "Facebook Login for Business" product.
//   3. Set a valid OAuth redirect URI matching META_REDIRECT_URI below
//      (e.g. https://branchly.com.br/integrations/facebook/callback).
//   4. Request the `pages_show_list`, `pages_read_engagement` and
//      `pages_read_user_content` permissions. Anything beyond the
//      Standard Access tier requires Meta's App Review — this can take
//      days to weeks and is NOT something this code can do for you.
//   5. Set META_APP_ID, META_APP_SECRET, META_REDIRECT_URI as server
//      environment variables.
//
// IMPORTANT — what this integration can and cannot do:
//   - CAN: read a connected Page's ratings/recommendations
//     (GET /{page-id}/ratings) and store them as reviews.
//   - CANNOT: publish a reply back to a Facebook Page rating the way
//     Google Business Profile supports owner replies. Meta's Graph API
//     does not expose a public "reply to page rating" edge for
//     Recommendations. The AI-drafted reply is still generated and
//     saved (see dashboard-actions.functions.ts), but for Facebook
//     reviews it must be copied and posted manually today. Don't
//     silently claim automatic publishing for this source — see the
//     `canAutoPublish` flag returned by getConnectionStatus below.
//
// v1 SIMPLIFICATION: one Facebook Page per account. If the connected
// Facebook user manages multiple Pages, this stores the FIRST page
// returned by /me/accounts. Reconnecting lets them pick a different one
// by disconnecting first. Multi-page support is a natural v2 addition
// (would mean listing all pages and letting the owner choose, plus a
// per-location mapping instead of one connection per owner).

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function getMetaConfig() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;
  if (!appId || !appSecret || !redirectUri) {
    const missing = [
      ...(!appId ? ["META_APP_ID"] : []),
      ...(!appSecret ? ["META_APP_SECRET"] : []),
      ...(!redirectUri ? ["META_REDIRECT_URI"] : []),
    ];
    throw new Error(
      `Facebook integration is not configured. Missing: ${missing.join(", ")}.`,
    );
  }
  return { appId, appSecret, redirectUri };
}

export function buildFacebookAuthUrl(state: string): string {
  const { appId, redirectUri } = getMetaConfig();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_read_user_content",
    ].join(","),
    response_type: "code",
  });
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

async function graphGet<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Facebook Graph API error (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Exchanges the OAuth `code` for a user access token, then resolves the
 * first Page the user manages (see v1 SIMPLIFICATION note above) and
 * returns its long-lived Page access token.
 */
export async function exchangeCodeForPage(code: string): Promise<FacebookPage> {
  const { appId, appSecret, redirectUri } = getMetaConfig();

  const tokenRes = await graphGet<{ access_token: string }>(
    "/oauth/access_token",
    {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    },
  );

  const pages = await graphGet<{ data: FacebookPage[] }>("/me/accounts", {
    access_token: tokenRes.access_token,
  });

  const page = pages.data?.[0];
  if (!page) {
    throw new Error(
      "Nenhuma Página do Facebook encontrada para essa conta. Confirme que você é administrador de ao menos uma Página.",
    );
  }
  return page;
}

export interface FacebookRating {
  reviewerName: string | null;
  rating: number | null;
  reviewText: string | null;
  createdTime: string | null;
}

/**
 * Fetches recent ratings/recommendations for a connected Page.
 * Requires the Page access token stored at connection time.
 */
export async function fetchFacebookRatings(
  pageId: string,
  pageAccessToken: string,
  limit = 50,
): Promise<FacebookRating[]> {
  const res = await graphGet<{
    data: {
      reviewer?: { name?: string };
      rating?: number;
      review_text?: string;
      created_time?: string;
    }[];
  }>(`/${pageId}/ratings`, {
    fields: "reviewer,rating,review_text,created_time",
    access_token: pageAccessToken,
    limit: String(limit),
  });

  return (res.data ?? []).map((r) => ({
    reviewerName: r.reviewer?.name ?? null,
    rating: typeof r.rating === "number" ? r.rating : null,
    reviewText: r.review_text ?? null,
    createdTime: r.created_time ?? null,
  }));
}

/** Whether replies for this source can be auto-published — see module docblock. */
export const canAutoPublishReply = {
  Facebook: false,
  Instagram: false,
  Google: false,
} as const;
