import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
      preset: (process.env.NITRO_PRESET ??
        (process.env.VERCEL ? "vercel" : "cloudflare")) as never,
    },
  },
});
