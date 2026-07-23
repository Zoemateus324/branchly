import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { connectFacebookPage } from "@/lib/meta.functions";

export const Route = createFileRoute("/integrations/facebook/callback")({
  component: FacebookCallback,
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
});

function FacebookCallback() {
  const { code, error: oauthError } = Route.useSearch();
  const navigate = useNavigate();
  const connect = useServerFn(connectFacebookPage);
  const [status, setStatus] = useState<"working" | "success" | "error">(
    "working",
  );
  const [message, setMessage] = useState("Conectando sua Página do Facebook…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // avoid double-run in React StrictMode / fast refresh
    ran.current = true;

    if (oauthError) {
      setStatus("error");
      setMessage("Você cancelou a conexão ou negou a permissão no Facebook.");
      return;
    }
    if (!code) {
      setStatus("error");
      setMessage("Código de autorização ausente. Tente conectar novamente.");
      return;
    }
    connect({ data: { code } })
      .then((res) => {
        setStatus("success");
        setMessage(`Página "${res.pageName}" conectada com sucesso.`);
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 1500);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Falha ao conectar com o Facebook.",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        {status === "working" && (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        )}
        {status === "success" && (
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
        )}
        {status === "error" && (
          <XCircle className="mx-auto h-8 w-8 text-rose-500" />
        )}
        <p className="mt-4 text-sm text-foreground">{message}</p>
        {status === "error" && (
          <Link
            to="/dashboard"
            className="mt-4 inline-block text-xs text-muted-foreground underline"
          >
            Voltar ao dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
