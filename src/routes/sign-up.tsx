import { createFileRoute } from "@tanstack/react-router";
import { SignUpPage } from "./sign-up.$";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Start free — Branchly reputation management software" },
      { name: "description", content: "Start a free Branchly account. Monitor Google reviews, benchmark locations against competitors and grow ratings with AI. 14-day Pro trial. No credit card." },
      { property: "og:title", content: "Start free — Branchly" },
      { property: "og:description", content: "Free reputation management for local and multi-location businesses. 14-day Pro trial included." },
      { property: "og:url", content: "/sign-up" },
    ],
    links: [{ rel: "canonical", href: "/sign-up" }],
  }),
  component: SignUpPage,
});
