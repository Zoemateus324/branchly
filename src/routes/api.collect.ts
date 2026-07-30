import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function str(v: unknown, max = 500): string | null {
  return typeof v === "string" && v.length > 0 ? v.substring(0, max) : null;
}
function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const Route = createFileRoute("/api/collect")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),

      POST: async ({ request }) => {
        const ok = () => new Response(null, { status: 204, headers: CORS });

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return ok();
        }

        const pixelId = str(body.pixel_id, 64);
        const sessionId = str(body.session_id, 64);
        const visitorId = str(body.visitor_id, 64);
        const eventType = str(body.event_type, 64) ?? "unknown";

        if (!pixelId || !sessionId || !visitorId) return ok();

        try {
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          const { data: site } = await supabaseAdmin
            .from("pixel_sites")
            .select("id, owner_id")
            .eq("pixel_id", pixelId)
            .maybeSingle();

          if (!site) return ok();

          const scrollDepth =
            eventType === "scroll" || eventType === "session_end"
              ? num(body.scroll_depth ?? body.max_scroll)
              : null;

          await Promise.all([
            supabaseAdmin.rpc("upsert_pixel_session", {
              p_id: sessionId,
              p_site_id: site.id,
              p_owner_id: site.owner_id,
              p_visitor_id: visitorId,
              p_utm_source: str(body.utm_source),
              p_utm_medium: str(body.utm_medium),
              p_utm_campaign: str(body.utm_campaign),
              p_utm_content: str(body.utm_content),
              p_utm_term: str(body.utm_term),
              p_referrer: str(body.referrer),
              p_landing_page: str(body.page_url),
              p_device_type: str(body.device_type, 20),
              p_browser: str(body.browser),
              p_scroll_depth: scrollDepth,
            }),
            supabaseAdmin.from("events").insert({
              site_id: site.id,
              owner_id: site.owner_id,
              session_id: sessionId,
              visitor_id: visitorId,
              event_type: eventType,
              page_url: str(body.page_url),
              page_title: str(body.page_title),
              referrer: str(body.referrer),
              utm_source: str(body.utm_source),
              utm_medium: str(body.utm_medium),
              utm_campaign: str(body.utm_campaign),
              utm_content: str(body.utm_content),
              utm_term: str(body.utm_term),
              device_type: str(body.device_type, 20),
              browser: str(body.browser),
              scroll_depth: scrollDepth,
              properties: (() => {
                const p: Record<string, unknown> = {};
                for (const k of [
                  "text",
                  "phone",
                  "form_id",
                  "action",
                  "max_scroll",
                ]) {
                  if (body[k] != null) p[k] = body[k];
                }
                return p;
              })(),
            }),
          ]);
        } catch (err) {
          console.error("[collect]", err);
        }

        return ok();
      },
    },
  },
});
