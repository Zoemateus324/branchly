import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireClerkAuth } from "@/integrations/clerk/auth-middleware";
import { getPhoneNumberInfo } from "./whatsapp.server";
import {
  exchangeEmbeddedSignupCode,
  registerPhoneNumber,
  subscribeAppToWaba,
  generateRegistrationPin,
} from "./whatsapp-signup.server";

/**
 * Finishes WhatsApp Embedded Signup for the current owner: validates the
 * authorization code, registers the phone number for Cloud API, subscribes
 * this app to the WABA's webhook events, and stores the connection.
 *
 * `wabaId` and `phoneNumberId` come from the `WA_EMBEDDED_SIGNUP` postMessage
 * event the client listens for during FB.login — see ConnectWhatsAppButton.
 */
export const completeWhatsAppEmbeddedSignup = createServerFn({
  method: "POST",
})
  .middleware([requireClerkAuth])
  .inputValidator((i) =>
    z
      .object({
        code: z.string().min(1),
        wabaId: z.string().min(1),
        phoneNumberId: z.string().min(1),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    await exchangeEmbeddedSignupCode(data.code);

    const pin = generateRegistrationPin();
    await registerPhoneNumber(data.phoneNumberId, pin);
    await subscribeAppToWaba(data.wabaId);

    const info = await getPhoneNumberInfo(data.phoneNumberId);

    const { error } = await supabaseAdmin
      .from("whatsapp_business_accounts")
      .upsert(
        {
          owner_id: context.userId,
          waba_id: data.wabaId,
          phone_number_id: data.phoneNumberId,
          display_phone_number: info.displayPhoneNumber,
          verified_name: info.verifiedName,
          register_pin: pin,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "owner_id" },
      );
    if (error) {
      console.error("[whatsapp-signup.complete] failed to save connection", error);
      throw new Error("Não foi possível salvar a conexão com o WhatsApp.");
    }

    return {
      phoneNumberId: data.phoneNumberId,
      displayPhoneNumber: info.displayPhoneNumber,
      verifiedName: info.verifiedName,
    };
  });

/** Returns the current owner's connected WhatsApp Business number, if any. */
export const getWhatsAppBusinessAccount = createServerFn({ method: "GET" })
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("whatsapp_business_accounts")
      .select("phone_number_id, display_phone_number, verified_name, connected_at")
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (error) {
      console.error("[whatsapp-signup.get]", error);
      throw new Error("Não foi possível carregar a conexão com o WhatsApp.");
    }
    return { account: data ?? null };
  });

/**
 * Removes the stored connection. Note: this does NOT revoke access on
 * Meta's side (there's no API to "unshare" a WABA) — it only stops
 * Branchly from sending/attributing messages for that number. The
 * customer would need to also remove Branchly's app from their WABA's
 * partners in Meta Business Settings to fully disconnect.
 */
export const disconnectWhatsAppBusinessAccount = createServerFn({
  method: "POST",
})
  .middleware([requireClerkAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("whatsapp_business_accounts")
      .delete()
      .eq("owner_id", context.userId);
    if (error) {
      console.error("[whatsapp-signup.disconnect]", error);
      throw new Error("Não foi possível desconectar o WhatsApp.");
    }
    return { ok: true };
  });
