// "Conectar WhatsApp" button — runs Meta's WhatsApp Embedded Signup flow
// so each Branchly account can connect its OWN WhatsApp Business number,
// instead of sharing the single number configured via
// WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID.
//
// Needs two PUBLIC env vars (read client-side, so no VITE_ secrets here):
//   VITE_META_APP_ID                        — the Meta App ID
//   VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID — the Embedded Signup
//     Configuration ID from WhatsApp > Configuration > Embedded Signup
//
// Flow:
//   1. Load the Facebook JS SDK once, FB.init with the App ID.
//   2. Click → FB.login() opens Meta's popup with the Configuration ID.
//   3. While the popup is open, Meta posts window messages of type
//      "WA_EMBEDDED_SIGNUP" carrying waba_id/phone_number_id as the
//      customer finishes picking/creating their WABA and number.
//   4. FB.login's own callback separately returns an authorization code.
//   5. Once both are in hand, completeWhatsAppEmbeddedSignup (server)
//      validates the code, registers the number, subscribes the app to
//      the WABA's webhooks, and stores the connection.
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, MessageCircle, Unlink } from "lucide-react";
import {
  completeWhatsAppEmbeddedSignup,
  getWhatsAppBusinessAccount,
  disconnectWhatsAppBusinessAccount,
} from "@/lib/whatsapp-signup.functions";

declare global {
  interface Window {
    FB?: {
      init: (opts: {
        appId: string;
        autoLogAppEvents?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: { code?: string };
          status?: string;
        }) => void,
        opts: {
          config_id: string;
          response_type: string;
          override_default_response_type: boolean;
          extras?: Record<string, unknown>;
        },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const GRAPH_SDK_VERSION = "v23.0";

let sdkLoadPromise: Promise<void> | null = null;

function loadFacebookSdk(appId: string): Promise<void> {
  if (window.FB) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve) => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        autoLogAppEvents: true,
        xfbml: false,
        version: GRAPH_SDK_VERSION,
      });
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/pt_BR/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

interface EmbeddedSignupData {
  waba_id?: string;
  phone_number_id?: string;
}

export function ConnectWhatsAppButton() {
  const queryClient = useQueryClient();
  const completeFn = useServerFn(completeWhatsAppEmbeddedSignup);
  const getAccountFn = useServerFn(getWhatsAppBusinessAccount);
  const disconnectFn = useServerFn(disconnectWhatsAppBusinessAccount);
  const [connecting, setConnecting] = useState(false);
  const signupData = useRef<EmbeddedSignupData>({});

  const appId = import.meta.env.VITE_META_APP_ID as string | undefined;
  const configId = import.meta.env.VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID as
    | string
    | undefined;

  const { data } = useQuery({
    queryKey: ["whatsapp-business-account"],
    queryFn: () => getAccountFn(),
  });
  const account = data?.account ?? null;

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (
        !event.origin.endsWith("facebook.com") &&
        event.origin !== "https://www.facebook.com"
      ) {
        return;
      }
      try {
        const payload =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (payload?.type === "WA_EMBEDDED_SIGNUP" && payload.data) {
          signupData.current = {
            waba_id: payload.data.waba_id ?? signupData.current.waba_id,
            phone_number_id:
              payload.data.phone_number_id ?? signupData.current.phone_number_id,
          };
        }
      } catch {
        // Not a JSON message meant for us — ignore.
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const onConnect = async () => {
    if (!appId || !configId) {
      toast.error(
        "WhatsApp Embedded Signup não está configurado (faltam VITE_META_APP_ID / VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID).",
      );
      return;
    }
    setConnecting(true);
    signupData.current = {};
    try {
      await loadFacebookSdk(appId);
      window.FB?.login(
        async (response) => {
          const code = response.authResponse?.code;
          if (!code) {
            toast.error("Você cancelou a conexão com o WhatsApp.");
            setConnecting(false);
            return;
          }
          // The WA_EMBEDDED_SIGNUP message usually arrives before this
          // callback fires, but give it a brief moment in case it hasn't.
          await new Promise((r) => setTimeout(r, 300));
          const { waba_id, phone_number_id } = signupData.current;
          if (!waba_id || !phone_number_id) {
            toast.error(
              "Não foi possível identificar o número conectado. Tente novamente.",
            );
            setConnecting(false);
            return;
          }
          try {
            const res = await completeFn({
              data: { code, wabaId: waba_id, phoneNumberId: phone_number_id },
            });
            toast.success(
              `WhatsApp conectado: ${res.verifiedName} (${res.displayPhoneNumber})`,
            );
            queryClient.invalidateQueries({
              queryKey: ["whatsapp-business-account"],
            });
            queryClient.invalidateQueries({ queryKey: ["whatsapp-info"] });
          } catch (e) {
            toast.error((e as Error).message);
          } finally {
            setConnecting(false);
          }
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
        },
      );
    } catch {
      toast.error("Não foi possível carregar o SDK do Facebook.");
      setConnecting(false);
    }
  };

  const onDisconnect = async () => {
    try {
      await disconnectFn();
      toast.success("WhatsApp desconectado");
      queryClient.invalidateQueries({ queryKey: ["whatsapp-business-account"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-info"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
          <MessageCircle className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">
            {account ? account.verified_name : "WhatsApp Business"}
          </div>
          <div className="text-xs text-muted-foreground">
            {account
              ? `${account.display_phone_number} · conectado`
              : "Conecte seu próprio número do WhatsApp Business"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {account ? (
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:text-rose-500"
            title="Desconectar"
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MessageCircle className="h-3.5 w-3.5" />
            )}{" "}
            Conectar WhatsApp
          </button>
        )}
      </div>
    </div>
  );
}
