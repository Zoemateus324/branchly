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
        "to_phone, contact_name, body_text, template_name, status, direction, sent_at",
      )
      .eq("owner_id", context.userId)
      .order("sent_at", { ascending: false })
      .limit(500);
    if (error) throw new Error("Não foi possível listar as conversas.");

    type Conversation = {
      phone: string;
      contactName: string | null;
      lastMessage: string;
      lastDirection: string;
      lastAt: string;
      unread: number;
    };
    const byPhone = new Map<string, Conversation>();
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
        });
      } else {
        if (!existing.contactName && m.contact_name)
          existing.contactName = m.contact_name;
        if (m.direction === "inbound" && existing.lastDirection !== "outbound")
          existing.unread += 1;
      }
    }
    const conversations = Array.from(byPhone.values()).sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    );
    return { conversations };
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
