import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import {
  buildGoogleAdsAuthUrl,
  exchangeGoogleAdsCode,
  listAccessibleCustomerIds,
  getCustomerDescriptiveName,
} from "./google-ads-signup.server";

export const getGoogleAdsAuthUrl = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    // state round-trips the owner's userId through Google's redirect —
    // not strictly needed to attach the connection (the callback page runs
    // in the same authenticated browser session and calls
    // completeGoogleAdsSignup with the normal Clerk/Supabase auth header),
    // but kept for parity with the Facebook flow and as a CSRF check.
    const url = buildGoogleAdsAuthUrl(context.userId);
    return { url };
  });

/**
 * Finishes the Google Ads OAuth flow for the current owner: exchanges the
 * authorization code, discovers which Google Ads account(s) that Google
 * login can access, and stores the connection (per-owner — this is a
 * multi-tenant SaaS, each customer connects their own Ads account).
 */
export const completeGoogleAdsSignup = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) => z.object({ code: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { accessToken, refreshToken } = await exchangeGoogleAdsCode(data.code);
    const customerIds = await listAccessibleCustomerIds(accessToken);
    const customerId = customerIds[0];
    if (!customerId) {
      throw new Error(
        "Essa conta Google não tem acesso a nenhuma conta do Google Ads. Confirme que você é usuário da conta de anúncios e tente novamente.",
      );
    }
    const descriptiveName = await getCustomerDescriptiveName(customerId, accessToken);

    const { error } = await supabaseAdmin.from("google_ads_accounts").upsert(
      {
        owner_id: context.userId,
        customer_id: customerId,
        descriptive_name: descriptiveName,
        refresh_token: refreshToken,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id" },
    );
    if (error) {
      console.error("[google-ads-signup.complete] failed to save connection", error);
      throw new Error("Não foi possível salvar a conexão com o Google Ads.");
    }

    return { customerId, descriptiveName };
  });

/** Returns the current owner's connected Google Ads account, if any. */
export const getGoogleAdsAccount = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("google_ads_accounts")
      .select("customer_id, descriptive_name, connected_at")
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (error) {
      console.error("[google-ads-signup.get]", error);
      throw new Error("Não foi possível carregar a conexão com o Google Ads.");
    }
    return { account: data ?? null };
  });

export const disconnectGoogleAdsAccount = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("google_ads_accounts")
      .delete()
      .eq("owner_id", context.userId);
    if (error) {
      console.error("[google-ads-signup.disconnect]", error);
      throw new Error("Não foi possível desconectar o Google Ads.");
    }
    return { ok: true };
  });
