// "Conectar Google Ads" button — full-page OAuth redirect flow so each
// Branchly customer connects their OWN Google Ads account (multi-tenant
// SaaS), instead of Branchly reading one shared account via env vars.
//
// Mirrors FacebookConnectionCard's connect flow (see DashboardShell.tsx):
//   1. getGoogleAdsAuthUrl() (authenticated) returns a Google consent URL.
//   2. window.location.href = url — full top-level redirect, since Google's
//      OAuth consent screen cannot run inside a popup/postMessage flow the
//      way Meta's Embedded Signup does.
//   3. Google redirects back to /integrations/google-ads/callback?code=...
//      (see that route), which calls completeGoogleAdsSignup({ code }).
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Megaphone, Unlink } from "lucide-react";
import {
  getGoogleAdsAuthUrl,
  getGoogleAdsAccount,
  disconnectGoogleAdsAccount,
} from "@/lib/google-ads-signup.functions";

export function ConnectGoogleAdsButton() {
  const queryClient = useQueryClient();
  const getAuthUrl = useServerFn(getGoogleAdsAuthUrl);
  const getAccountFn = useServerFn(getGoogleAdsAccount);
  const disconnectFn = useServerFn(disconnectGoogleAdsAccount);
  const [connecting, setConnecting] = useState(false);

  const { data } = useQuery({
    queryKey: ["google-ads-account"],
    queryFn: () => getAccountFn(),
  });
  const account = data?.account ?? null;

  const onConnect = async () => {
    setConnecting(true);
    try {
      const { url } = await getAuthUrl();
      window.location.href = url;
    } catch (e) {
      toast.error((e as Error).message);
      setConnecting(false);
    }
  };

  const onDisconnect = async () => {
    try {
      await disconnectFn();
      toast.success("Google Ads desconectado");
      queryClient.invalidateQueries({ queryKey: ["google-ads-account"] });
      queryClient.invalidateQueries({ queryKey: ["google-ads-campaigns"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Megaphone className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">
            {account ? (account.descriptive_name ?? `Conta ${account.customer_id}`) : "Google Ads"}
          </div>
          <div className="text-xs text-muted-foreground">
            {account
              ? `ID ${account.customer_id} · conectado`
              : "Conecte sua própria conta do Google Ads"}
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
            className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Megaphone className="h-3.5 w-3.5" />
            )}{" "}
            Conectar Google Ads
          </button>
        )}
      </div>
    </div>
  );
}
