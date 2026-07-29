import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";

export const createPixelSite = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        name: z.string().min(1).max(100).trim(),
        domain: z.string().min(1).max(200).trim(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: site, error } = await supabaseAdmin
      .from("pixel_sites")
      .insert({ owner_id: context.userId, name: data.name, domain: data.domain })
      .select()
      .single();
    if (error) throw new Error("Não foi possível criar o pixel.");
    return { site };
  });

export const listPixelSites = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("pixel_sites")
      .select("*")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Não foi possível listar os pixels.");
    return { sites: data ?? [] };
  });

export const deletePixelSite = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) => z.object({ siteId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("pixel_sites")
      .delete()
      .eq("id", data.siteId)
      .eq("owner_id", context.userId);
    if (error) throw new Error("Não foi possível remover o pixel.");
    return { ok: true };
  });

export const getAttributionStats = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        siteId: z.string().uuid(),
        days: z.union([z.literal(7), z.literal(15), z.literal(30)]).default(7),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: site } = await supabaseAdmin
      .from("pixel_sites")
      .select("id")
      .eq("id", data.siteId)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (!site) throw new Error("Site não encontrado.");

    const since = new Date(Date.now() - data.days * 86_400_000).toISOString();

    const [sessionsRes, eventsRes] = await Promise.all([
      supabaseAdmin
        .from("sessions")
        .select(
          "id, visitor_id, utm_source, utm_medium, utm_campaign, device_type, converted, first_seen_at",
        )
        .eq("site_id", data.siteId)
        .gte("first_seen_at", since)
        .order("first_seen_at", { ascending: false })
        .limit(1000),
      supabaseAdmin
        .from("events")
        .select("event_type, utm_source, utm_campaign, created_at")
        .eq("site_id", data.siteId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

    const sessions = sessionsRes.data ?? [];
    const events = eventsRes.data ?? [];

    const bySource: Record<
      string,
      { sessions: number; pageviews: number; whatsapp: number; forms: number }
    > = {};

    for (const s of sessions) {
      const src = s.utm_source || s.utm_medium || "Direto / Orgânico";
      bySource[src] ??= { sessions: 0, pageviews: 0, whatsapp: 0, forms: 0 };
      bySource[src].sessions++;
    }
    for (const e of events) {
      const src = e.utm_source || "Direto / Orgânico";
      bySource[src] ??= { sessions: 0, pageviews: 0, whatsapp: 0, forms: 0 };
      if (e.event_type === "pageview") bySource[src].pageviews++;
      if (e.event_type === "whatsapp_click") bySource[src].whatsapp++;
      if (e.event_type === "form_submit") bySource[src].forms++;
    }

    const byDevice: Record<string, number> = {};
    for (const s of sessions) {
      const d = s.device_type || "unknown";
      byDevice[d] = (byDevice[d] ?? 0) + 1;
    }

    return {
      totalSessions: sessions.length,
      uniqueVisitors: new Set(sessions.map((s) => s.visitor_id)).size,
      totalPageviews: events.filter((e) => e.event_type === "pageview").length,
      whatsappClicks: events.filter((e) => e.event_type === "whatsapp_click")
        .length,
      formSubmits: events.filter((e) => e.event_type === "form_submit").length,
      phoneClicks: events.filter((e) => e.event_type === "phone_click").length,
      bySource: Object.entries(bySource)
        .sort((a, b) => b[1].sessions - a[1].sessions)
        .slice(0, 20)
        .map(([source, stats]) => ({ source, ...stats })),
      byDevice: Object.entries(byDevice)
        .sort((a, b) => b[1] - a[1])
        .map(([device, count]) => ({ device, count })),
      recentSessions: sessions.slice(0, 15).map((s) => ({
        id: s.id,
        source: s.utm_source || s.utm_medium || "Direto",
        campaign: s.utm_campaign,
        device: s.device_type,
        converted: s.converted,
        at: s.first_seen_at,
      })),
    };
  });
