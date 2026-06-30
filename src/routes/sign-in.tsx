import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "./sign-in.$";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — Branchly" },
      { name: "description", content: "Sign in to your Branchly workspace to monitor reviews, benchmark locations and act on AI insights." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Sign in — Branchly" },
      { property: "og:url", content: "/sign-in" },
    ],
    links: [{ rel: "canonical", href: "/sign-in" }],
  }),
  component: SignInPage,
});
