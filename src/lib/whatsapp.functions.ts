import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import {
  sendWhatsAppText,
  sendWhatsAppTemplate,
  getPhoneNumberInfo,
} from "./whatsapp.server";

/** Returns info about the connected WhatsApp Business number. */
export const getWhatsAppInfo = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async () => {
    const info = await getPhoneNumberInfo();
    return { info };
  });

/** Sends a review-request message via WhatsApp to a single customer. */
export const sendReviewRequest = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        phone: z.string().min(8).max(20),
        customerName: z.string().min(1).max(100).optional(),
        reviewLink: z.string().url().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const name = data.customerName ?? "cliente";
    const link = data.reviewLink ?? "https://g.page/r/review";
    const text =
      `Olá, ${name}! 👋\n\n` +
      `Ficamos felizes em ter atendido você. Poderia levar 1 minuto para deixar sua avaliação? Sua opinião faz toda a diferença para a gente! 🌟\n\n` +
      `👉 ${link}\n\n` +
      `Obrigado!`;

    const { messageId } = await sendWhatsAppText(data.phone, text);

    const { error } = await supabaseAdmin.from("whatsapp_messages").insert({
      owner_id: context.userId,
      to_phone: data.phone,
      template_name: null,
      body_text: text,
      wa_message_id: messageId,
      status: "sent",
      metadata: {
        customer_name: data.customerName ?? null,
        review_link: data.reviewLink ?? null,
      },
    });
    if (error) {
      console.error(
        "[whatsapp.sendReviewRequest] failed to log message",
        error,
      );
    }

    return { messageId, phone: data.phone };
  });

/** Sends an approved WhatsApp template message. */
export const sendTemplateMessage = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        phone: z.string().min(8).max(20),
        templateName: z.string().min(1).max(100),
        languageCode: z.string().min(2).max(10).default("pt_BR"),
        components: z.array(z.record(z.unknown())).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { messageId } = await sendWhatsAppTemplate(
      data.phone,
      data.templateName,
      data.languageCode,
      data.components as object[] | undefined,
    );

    const { error } = await supabaseAdmin.from("whatsapp_messages").insert({
      owner_id: context.userId,
      to_phone: data.phone,
      template_name: data.templateName,
      body_text: null,
      wa_message_id: messageId,
      status: "sent",
      metadata: { language_code: data.languageCode },
    });
    if (error) {
      console.error("[whatsapp.sendTemplate] failed to log message", error);
    }

    return { messageId, phone: data.phone };
  });

/** Lists recent WhatsApp messages sent by this owner, optionally for a single phone thread. */
export const listWhatsAppMessages = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z.object({ phone: z.string().min(8).max(20).optional() }).parse(i ?? {}),
  )
  .handler(async ({ data: input, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin
      .from("whatsapp_messages")
      .select(
        "id, to_phone, contact_name, template_name, body_text, status, direction, sent_at, delivered_at, read_at, failed_at, metadata",
      )
      .eq("owner_id", context.userId);
    if (input.phone) query = query.eq("to_phone", input.phone);
    const { data, error } = await query
      .order("sent_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Não foi possível listar as mensagens.");
    return { messages: data ?? [] };
  });

/** Lists WhatsApp conversations grouped by phone, most recently active first. */
export const listWhatsAppConversations = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("whatsapp_messages")
      .select(
        "to_phone, contact_name, body_text, template_name, status, direction, lead_source, sent_at",
      )
      .eq("owner_id", context.userId)
      .order("sent_at", { ascending: true })
      .limit(500);
    if (error) throw new Error("Não foi possível listar as conversas.");

    type Conversation = {
      phone: string;
      contactName: string | null;
      lastMessage: string;
      lastDirection: string;
      lastAt: string;
      unread: number;
      leadSource: string | null;
      awaitingReply: boolean;
    };
    const byPhone = new Map<string, Conversation>();
    // Iterate oldest-first so leadSource captures the ORIGIN (earliest
    // inbound message) while last* fields end up reflecting the latest one.
    for (const m of data ?? []) {
      const existing = byPhone.get(m.to_phone);
      if (!existing) {
        byPhone.set(m.to_phone, {
          phone: m.to_phone,
          contactName: m.contact_name,
          lastMessage: m.body_text ?? m.template_name ?? "—",
          lastDirection: m.direction,
          lastAt: m.sent_at,
          unread: m.direction === "inbound" ? 1 : 0,
          leadSource: m.direction === "inbound" ? m.lead_source : null,
          awaitingReply: m.direction === "inbound",
        });
      } else {
        if (!existing.contactName && m.contact_name)
          existing.contactName = m.contact_name;
        if (existing.leadSource === null && m.direction === "inbound")
          existing.leadSource = m.lead_source;
        existing.lastMessage = m.body_text ?? m.template_name ?? "—";
        existing.lastDirection = m.direction;
        existing.lastAt = m.sent_at;
        existing.awaitingReply = m.direction === "inbound";
        if (m.direction === "inbound") existing.unread += 1;
        else existing.unread = 0;
      }
    }
    const conversations = Array.from(byPhone.values()).sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    );
    return { conversations };
  });

const SOURCE_LABELS: Record<string, string> = {
  meta: "Meta (Facebook/Instagram)",
  google_ads: "Google Ads",
  site: "Site",
  pinterest: "Pinterest",
  bling: "Bling",
  other: "Outro",
  direct: "Direto / não rastreável",
};

/** Aggregate lead counts, pending replies and source breakdown. */
export const getWhatsAppLeadStats = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("whatsapp_messages")
      .select("to_phone, direction, lead_source, sent_at")
      .eq("owner_id", context.userId)
      .order("sent_at", { ascending: true })
      .limit(2000);
    if (error) throw new Error("Não foi possível calcular as estatísticas.");

    type Agg = { source: string | null; lastDirection: string };
    const byPhone = new Map<string, Agg>();
    let totalReceived = 0;
    for (const m of data ?? []) {
      if (m.direction === "inbound") totalReceived += 1;
      const existing = byPhone.get(m.to_phone);
      if (!existing) {
        byPhone.set(m.to_phone, {
          source: m.direction === "inbound" ? m.lead_source : null,
          lastDirection: m.direction,
        });
      } else {
        if (existing.source === null && m.direction === "inbound")
          existing.source = m.lead_source;
        existing.lastDirection = m.direction;
      }
    }

    const bySourceCounts = new Map<string, number>();
    let awaitingReply = 0;
    for (const agg of byPhone.values()) {
      if (agg.lastDirection === "inbound") awaitingReply += 1;
      const key = agg.source ?? "direct";
      bySourceCounts.set(key, (bySourceCounts.get(key) ?? 0) + 1);
    }
    const bySource = Array.from(bySourceCounts.entries())
      .map(([source, count]) => ({
        source,
        label: SOURCE_LABELS[source] ?? source,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLeads: byPhone.size,
      totalReceived,
      awaitingReply,
      bySource,
    };
  });

/** Generates a short tracking code for a new tracked wa.me link. */
function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/** Creates a tracked wa.me link for a channel that doesn't self-report attribution. */
export const createTrackedWhatsAppLink = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        label: z.string().trim().min(1).max(100),
        source: z.enum(["google_ads", "site", "pinterest", "bling", "other"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const info = await getPhoneNumberInfo();
    const code = generateTrackingCode();
    const text = `Olá! Cheguei através de ${data.label}. (cód: ${code})`;
    const digits = info.displayPhoneNumber.replace(/\D/g, "");
    const waLink = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;

    const { error, data: row } = await supabaseAdmin
      .from("whatsapp_tracked_links")
      .insert({
        owner_id: context.userId,
        label: data.label,
        source: data.source,
        tracking_code: code,
        wa_link: waLink,
      })
      .select("*")
      .single();
    if (error) throw new Error("Não foi possível criar o link rastreável.");
    return row;
  });

/** Lists tracked wa.me links created by this owner. */
export const listTrackedWhatsAppLinks = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("whatsapp_tracked_links")
      .select("*")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Não foi possível listar os links.");
    return { links: data ?? [] };
  });

/** Deletes a tracked wa.me link. */
export const deleteTrackedWhatsAppLink = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("whatsapp_tracked_links")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    return { ok: true };
  });

/** Sends a free-form reply within an existing WhatsApp conversation thread. */
export const sendWhatsAppReply = createServerFn({ method: "POST" })
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        phone: z.string().min(8).max(20),
        text: z.string().trim().min(1).max(4096),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { messageId } = await sendWhatsAppText(data.phone, data.text);

    const { error } = await supabaseAdmin.from("whatsapp_messages").insert({
      owner_id: context.userId,
      to_phone: data.phone,
      template_name: null,
      body_text: data.text,
      wa_message_id: messageId,
      status: "sent",
      direction: "outbound",
      metadata: {},
    });
    if (error) {
      console.error("[whatsapp.sendReply] failed to log message", error);
    }

    return { messageId, phone: data.phone };
  });
