import { createServerFn } from "@tanstack/react-start";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import { getBestCampaigns } from "./google-ads.server";

/**
 * Returns the best-performing Google Ads campaigns from the last 30 days
 * for the CURRENT OWNER's connected Google Ads account. Each Branchly
 * customer connects their own account (see google-ads-signup.functions.ts
 * / ConnectGoogleAdsButton) — this intentionally never falls back to a
 * shared/env-configured account, since that would leak one customer's ad
 * data into another customer's dashboard.
 */
export const getTopGoogleAdsCampaigns = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data: account, error } = await supabaseAdmin
      .from("google_ads_accounts")
      .select("customer_id, refresh_token, login_customer_id")
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (error) {
      console.error("[google-ads.getTopCampaigns]", error);
      throw new Error("Não foi possível carregar a conexão com o Google Ads.");
    }
    if (!account) {
      throw new Error("NOT_CONNECTED");
    }

    const campaigns = await getBestCampaigns({
      customerId: account.customer_id,
      refreshToken: account.refresh_token,
      loginCustomerId: account.login_customer_id,
    });
    return { campaigns };
  });
