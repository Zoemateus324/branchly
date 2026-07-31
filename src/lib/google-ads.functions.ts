import { createServerFn } from "@tanstack/react-start";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import { getBestCampaigns } from "./google-ads.server";

/** Returns the best-performing Google Ads campaigns from the last 30 days. */
export const getTopGoogleAdsCampaigns = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async () => {
    const campaigns = await getBestCampaigns();
    return { campaigns };
  });
