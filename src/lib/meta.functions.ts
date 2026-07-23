import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import {
  buildFacebookAuthUrl,
  exchangeCodeForPage,
  fetchFacebookRatings,
  resolveInstagramAccount,
  fetchInstagramComments,
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

    // An Instagram professional account (Business/Creator) linked to
    // this Page is optional — most Pages won't have one, and that's
    // fine, we just won't offer Instagram comment capture for them.
    let instagram: { id: string; username: string | null } | null = null;
    try {
      instagram = await resolveInstagramAccount(page.id, page.access_token);
    } catch (e) {
      console.error("[meta.connect] instagram lookup failed (non-fatal)", e);
    }

    const { error } = await supabaseAdmin.from("meta_connections").upsert(
      {
        owner_id: context.userId,
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
        instagram_business_account_id: instagram?.id ?? null,
        instagram_username: instagram?.username ?? null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,page_id" },
    );
    if (error) {
      console.error("[meta.connect] failed to save connection", error);
      throw new Error("Não foi possível salvar a conexão com o Facebook.");
    }
    return {
      pageId: page.id,
      pageName: page.name,
      instagramUsername: instagram?.username ?? null,
    };
  });

export const getFacebookConnection = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("meta_connections")
      .select(
        "page_id, page_name, last_synced_at, connected_at, instagram_username",
      )
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

/**
 * Classifies comment sentiment via the same Lovable AI gateway already
 * used for AI insights and AI reply drafting elsewhere in this app.
 * Falls back to "neutral" for any comment the model call fails on
 * rather than aborting the whole batch.
 */
async function classifySentiment(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return texts.map(() => "neutral");

  const numbered = texts.map((t, i) => `${i}: ${t.slice(0, 300)}`).join("\n");
  const prompt = `Classifique o sentimento de cada comentário do Instagram abaixo como "positive", "negative" ou "neutral". Responda APENAS com JSON válido no formato {"sentiments": ["positive", "negative", ...]}, na mesma ordem e quantidade dos comentários.\n\nComentários:\n${numbered}`;

  try {
    const res = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "Você responde apenas com JSON válido.",
            },
            { role: "user", content: prompt },
          ],
        }),
      },
    );
    if (!res.ok) throw new Error(`AI gateway ${res.status}`);
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no JSON in AI response");
    const parsed = JSON.parse(match[0]) as { sentiments?: string[] };
    const sentiments = parsed.sentiments ?? [];
    return texts.map((_, i) => sentiments[i] ?? "neutral");
  } catch (e) {
    console.error("[instagram] sentiment classification failed", e);
    return texts.map(() => "neutral");
  }
}

export const captureInstagramComments = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data: conn, error: connErr } = await supabaseAdmin
      .from("meta_connections")
      .select(
        "instagram_business_account_id, instagram_username, page_access_token",
      )
      .eq("owner_id", context.userId)
      .order("connected_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (connErr || !conn) {
      throw new Error("Nenhuma Página do Facebook conectada ainda.");
    }
    if (!conn.instagram_business_account_id) {
      throw new Error(
        "Nenhuma conta profissional do Instagram vinculada a essa Página.",
      );
    }

    const comments = await fetchInstagramComments(
      conn.instagram_business_account_id,
      conn.page_access_token,
    );

    if (comments.length > 0) {
      const sentiments = await classifySentiment(comments.map((c) => c.text));
      const rows = comments.map((c, i) => ({
        owner_id: context.userId,
        author: c.authorUsername,
        rating: null, // Instagram comments have no star rating — see module docblock
        comment: c.text,
        source: "Instagram",
        sentiment: sentiments[i] ?? "neutral",
        posted_at: c.createdTime ?? new Date().toISOString(),
      }));
      await supabaseAdmin
        .from("reviews")
        .delete()
        .eq("owner_id", context.userId)
        .eq("source", "Instagram");
      await supabaseAdmin.from("reviews").insert(rows);
    }

    await supabaseAdmin
      .from("meta_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("owner_id", context.userId);

    return { captured: comments.length, username: conn.instagram_username };
  });
