/**
 * Google Maps Platform — Places API (New) helper.
 * Calls go through the Lovable connector gateway, never directly to Google.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export interface PlaceLookup {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  rating: number | null;
  userRatingCount: number | null;
  location: { latitude: number; longitude: number } | null;
  websiteUri: string | null;
  googleMapsUri: string | null;
  primaryType: string | null;
}

/**
 * Find the canonical Google Place for "{name} {city}". Returns null when
 * credentials are missing, the request fails, or no place matches.
 * Safe to call as an enrichment step — never throws.
 */
export async function findPlace(
  name: string,
  city: string,
): Promise<PlaceLookup | null> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!lovableKey || !mapsKey) return null;

  const query = `${name} ${city}`.trim().slice(0, 256);
  if (!query) return null;

  try {
    const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": mapsKey,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.websiteUri,places.googleMapsUri,places.primaryType",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
    });
    if (!res.ok) {
      console.error("[google-places] HTTP", res.status, await res.text().catch(() => ""));
      return null;
    }
    const json = (await res.json()) as {
      places?: Array<{
        id: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        rating?: number;
        userRatingCount?: number;
        location?: { latitude: number; longitude: number };
        websiteUri?: string;
        googleMapsUri?: string;
        primaryType?: string;
      }>;
    };
    const p = json.places?.[0];
    if (!p) return null;
    return {
      placeId: p.id,
      name: p.displayName?.text ?? name,
      formattedAddress: p.formattedAddress ?? null,
      rating: typeof p.rating === "number" ? p.rating : null,
      userRatingCount: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
      location: p.location ?? null,
      websiteUri: p.websiteUri ?? null,
      googleMapsUri: p.googleMapsUri ?? null,
      primaryType: p.primaryType ?? null,
    };
  } catch (e) {
    console.error("[google-places] request failed", e);
    return null;
  }
}