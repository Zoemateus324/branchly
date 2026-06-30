export const PLAN_MEMBER_LIMITS: Record<string, number> = {
  starter: 2,
  pro: 5,
  premium: 9999,
};

export const ROLE_LABELS: Record<"admin" | "financial" | "member", string> = {
  admin: "Administrativo",
  financial: "Financeiro",
  member: "Membro",
};

export type PlanTier = "free" | "starter" | "pro" | "premium";

export interface PlanLimits {
  locations: number;
  competitors: number;
  reports: number;
  aiReplies: number;
  capturePerDay: number;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free:    { locations: 1,  competitors: 0,    reports: 1,    aiReplies: 0,    capturePerDay: 1 },
  starter: { locations: 1,  competitors: 3,    reports: 10,   aiReplies: 50,   capturePerDay: 5 },
  pro:     { locations: 5,  competitors: 10,   reports: 9999, aiReplies: 9999, capturePerDay: 50 },
  premium: { locations: 15, competitors: 9999, reports: 9999, aiReplies: 9999, capturePerDay: 9999 },
};

export function planFromKey(key: string | null | undefined): PlanTier {
  if (key === "starter" || key === "pro" || key === "premium") return key;
  return "free";
}

export function minPlanFor(feature: keyof PlanLimits, needed = 1): PlanTier {
  const order: PlanTier[] = ["free", "starter", "pro", "premium"];
  for (const p of order) if (PLAN_LIMITS[p][feature] >= needed) return p;
  return "premium";
}