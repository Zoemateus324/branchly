export interface ScoreInput {
  rating: number | null;
  reviewCount: number | null;
  recentReviews?: { timeAgo?: string }[];
}

export interface ScoreBreakdown {
  rating: number;
  volume: number;
  recency: number;
  inputs: { rating: number; reviewCount: number; recentSample: number };
}

/**
 * 0-100 score:
 * - 50%: average rating normalized to 0-50
 * - 30%: review-volume on log scale (caps near 1k reviews)
 * - 20%: recency / freshness from sampled recent reviews
 */
export function calculateScore(input: ScoreInput): {
  score: number;
  breakdown: ScoreBreakdown;
} {
  const rating = input.rating ?? 0;
  const reviewCount = input.reviewCount ?? 0;
  const recent = input.recentReviews ?? [];

  const ratingScore = Math.max(0, Math.min(50, (rating / 5) * 50));
  const volumeScore = Math.max(
    0,
    Math.min(30, (Math.log10(Math.max(1, reviewCount)) / 3) * 30),
  );

  let recencyScore = 0;
  if (recent.length > 0) {
    const fresh = recent.filter((r) => {
      const t = (r.timeAgo || "").toLowerCase();
      if (/hour|day|week|hora|dia|semana/.test(t)) return true;
      const m = t.match(/(\d+)\s*month/);
      return m ? Number(m[1]) <= 2 : false;
    }).length;
    recencyScore = Math.min(20, (fresh / recent.length) * 20);
  } else if (reviewCount > 0) {
    recencyScore = 10;
  }

  const total = ratingScore + volumeScore + recencyScore;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    score: round1(total),
    breakdown: {
      rating: round1(ratingScore),
      volume: round1(volumeScore),
      recency: round1(recencyScore),
      inputs: { rating, reviewCount, recentSample: recent.length },
    },
  };
}
