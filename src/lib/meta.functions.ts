import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import {
  buildFacebookAuthUrl,
  exchangeCodeForPage,
  fetchFacebookRatings,
} from "./meta.server";

export const getFacebookAuthUrl = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    // The state param round-trips the owner's userId through Facebook's
    // redirect so the callback route (a public route, since Facebook
    // redirects the browser there directly) knows which account to
    // attach the connection to.
    const url = buildFacebookAuthUrl(context.userId);
    return { url };
  });

export const connectFacebookPage = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) => z.object({ code: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const page = await exchangeCodeForPage(data.code);

    const { error } = await supabaseAdmin.from("meta_connections").upsert(
      {
        owner_id: context.userId,
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,page_id" },
    );
    if (error) {
      console.error("[meta.connect] failed to save connection", error);
      throw new Error("Não foi possível salvar a conexão com o Facebook.");
    }
    return { pageId: page.id, pageName: page.name };
  });

export const getFacebookConnection = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("meta_connections")
      .select("page_id, page_name, last_synced_at, connected_at")
      .eq("owner_id", context.userId)
      .order("connected_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("[meta.getConnection]", error);
      throw new Error("Não foi possível carregar a conexão com o Facebook.");
    }
    return { connection: data ?? null };
  });

export const disconnectFacebook = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("meta_connections")
      .delete()
      .eq("owner_id", context.userId);
    if (error) {
      console.error("[meta.disconnect]", error);
      throw new Error("Não foi possível desconectar o Facebook.");
    }
    return { ok: true };
  });

export const captureFacebookReviews = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data: conn, error: connErr } = await supabaseAdmin
      .from("meta_connections")
      .select("page_id, page_name, page_access_token")
      .eq("owner_id", context.userId)
      .order("connected_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (connErr || !conn) {
      throw new Error("Nenhuma Página do Facebook conectada ainda.");
    }

    const ratings = await fetchFacebookRatings(
      conn.page_id,
      conn.page_access_token,
    );

    if (ratings.length > 0) {
      const rows = ratings.map((r) => {
        const rating = r.rating !== null ? Math.round(r.rating) : null;
        const sentiment =
          rating === null
            ? "neutral"
            : rating >= 4
              ? "positive"
              : rating <= 2
                ? "negative"
                : "neutral";
        return {
          owner_id: context.userId,
          author: r.reviewerName,
          rating,
          comment: r.reviewText,
          source: "Facebook",
          sentiment,
          posted_at: r.createdTime ?? new Date().toISOString(),
        };
      });
      // Facebook ratings don't carry a stable numeric id we already key
      // on elsewhere in this table, so — like the Google capture path —
      // we replace the prior Facebook batch for this owner rather than
      // trying to diff/dedupe individual reviews.
      await supabaseAdmin
        .from("reviews")
        .delete()
        .eq("owner_id", context.userId)
        .eq("source", "Facebook");
      await supabaseAdmin.from("reviews").insert(rows);
    }

    await supabaseAdmin
      .from("meta_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("owner_id", context.userId)
      .eq("page_id", conn.page_id);

    return { captured: ratings.length, pageName: conn.page_name };
  });
