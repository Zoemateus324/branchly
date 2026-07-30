import { createFileRoute } from "@tanstack/react-router";
import { buildPixelScript } from "@/lib/attribution/pixel-template";

const PIXEL_ID_RE = /^[0-9a-f]{8,64}$/i;

export const Route = createFileRoute("/api/pixel/$pixelId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { pixelId } = params;

        if (!PIXEL_ID_RE.test(pixelId)) {
          return new Response("Not Found", { status: 404 });
        }

        const baseUrl =
          process.env.BASE_URL?.replace(/\/$/, "") ?? "https://branchly.com.br";

        const script = buildPixelScript(pixelId, baseUrl);

        return new Response(script, {
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control":
              "public, max-age=3600, stale-while-revalidate=86400",
            "X-Content-Type-Options": "nosniff",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
