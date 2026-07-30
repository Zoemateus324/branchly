import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://branchly.com.br";
const LASTMOD = "2026-07-30";

interface SitemapEntry {
  path: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
  alternates?: Array<{ hreflang: string; href: string }>;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const guideEnImprove = "/guide/improve-google-reputation";
        const guidePtImprove = "/guia/melhorar-reputacao-no-google";
        const guideEnRank = "/guide/rank-first-page-google";
        const guidePtRank = "/guia/aparecer-nas-primeiras-paginas-do-google";

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          {
            path: "/branchly-vs-tintim",
            changefreq: "monthly",
            priority: "0.9",
          },
          {
            path: guideEnImprove,
            changefreq: "monthly",
            priority: "0.9",
            alternates: [
              { hreflang: "en", href: `${BASE_URL}${guideEnImprove}` },
              { hreflang: "pt-BR", href: `${BASE_URL}${guidePtImprove}` },
              { hreflang: "x-default", href: `${BASE_URL}${guideEnImprove}` },
            ],
          },
          {
            path: guidePtImprove,
            changefreq: "monthly",
            priority: "0.9",
            alternates: [
              { hreflang: "en", href: `${BASE_URL}${guideEnImprove}` },
              { hreflang: "pt-BR", href: `${BASE_URL}${guidePtImprove}` },
              { hreflang: "x-default", href: `${BASE_URL}${guideEnImprove}` },
            ],
          },
          {
            path: guideEnRank,
            changefreq: "monthly",
            priority: "0.9",
            alternates: [
              { hreflang: "en", href: `${BASE_URL}${guideEnRank}` },
              { hreflang: "pt-BR", href: `${BASE_URL}${guidePtRank}` },
              { hreflang: "x-default", href: `${BASE_URL}${guideEnRank}` },
            ],
          },
          {
            path: guidePtRank,
            changefreq: "monthly",
            priority: "0.9",
            alternates: [
              { hreflang: "en", href: `${BASE_URL}${guideEnRank}` },
              { hreflang: "pt-BR", href: `${BASE_URL}${guidePtRank}` },
              { hreflang: "x-default", href: `${BASE_URL}${guideEnRank}` },
            ],
          },
        ];

        const urls = entries.map((e) => {
          const alternateTags = (e.alternates ?? [])
            .map(
              (a) =>
                `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`,
            )
            .join("\n");
          return [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            `    <lastmod>${LASTMOD}</lastmod>`,
            e.changefreq
              ? `    <changefreq>${e.changefreq}</changefreq>`
              : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            alternateTags || null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
          `        xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
