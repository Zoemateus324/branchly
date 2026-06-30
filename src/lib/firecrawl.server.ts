const FIRECRAWL_SCRAPE_URL = "https://api.firecrawl.dev/v2/scrape";

export interface ScrapedBusiness {
  sourceUrl: string;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  address: string | null;
  category: string | null;
  recentReviews: { author?: string; rating?: number; text?: string; timeAgo?: string }[];
}

export async function scrapeGoogleBusiness(input: {
  name: string;
  city: string;
  category?: string;
}): Promise<ScrapedBusiness> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

  const query = [input.name, input.city, input.category].filter(Boolean).join(" ");
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

  const res = await fetch(FIRECRAWL_SCRAPE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      onlyMainContent: true,
      waitFor: 2500,
      formats: [
        {
          type: "json",
          prompt:
            "Extract the FIRST business listing visible on this Google Maps page. Return JSON with: name (string), rating (number 1-5 or null), reviewCount (integer or null), address (string or null), category (string or null), recentReviews (array of up to 5 objects: { author, rating 1-5, text, timeAgo }).",
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firecrawl scrape failed (${res.status}): ${body.slice(0, 240)}`);
  }

  const payload = (await res.json()) as Record<string, unknown>;
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const extracted = ((data.json as Record<string, unknown>) ?? {}) as {
    name?: string;
    rating?: number;
    reviewCount?: number;
    address?: string;
    category?: string;
    recentReviews?: { author?: string; rating?: number; text?: string; timeAgo?: string }[];
  };

  return {
    sourceUrl: url,
    name: extracted.name || input.name,
    rating: typeof extracted.rating === "number" ? extracted.rating : null,
    reviewCount: typeof extracted.reviewCount === "number" ? extracted.reviewCount : null,
    address: extracted.address || null,
    category: extracted.category || input.category || null,
    recentReviews: Array.isArray(extracted.recentReviews) ? extracted.recentReviews : [],
  };
}