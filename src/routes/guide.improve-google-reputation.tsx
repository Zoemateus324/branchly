import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "How to Improve Your Google Reputation in 2026 | Branchly";
const DESCRIPTION =
  "Step-by-step guide to improve your business reputation on Google: monitor reviews, reply with AI, benchmark competitors and grow your local ranking with Branchly.";
const URL = "https://branchly.com.br/guide/improve-google-reputation";

export const Route = createFileRoute("/guide/improve-google-reputation")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "how to improve google reputation, improve google reviews, online reputation management, respond to google reviews, google business profile, local seo, google review management",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:type", content: "article" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          inLanguage: "en-US",
          author: { "@type": "Organization", name: "Branchly" },
          publisher: {
            "@type": "Organization",
            name: "Branchly",
            logo: {
              "@type": "ImageObject",
              url: "https://branchly.com.br/favicon.ico",
            },
          },
          mainEntityOfPage: URL,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: "en-US",
          mainEntity: [
            {
              "@type": "Question",
              name: "How do I improve my business reputation on Google?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "To improve your Google reputation: (1) claim and optimize your Google Business Profile, (2) ask happy customers for reviews consistently, (3) reply to 100% of reviews within 24 hours — including negative ones, (4) monitor local competitors in your category and (5) track your average rating weekly. Branchly automates monitoring, AI replies and competitive benchmarking in one dashboard.",
              },
            },
            {
              "@type": "Question",
              name: "How long does it take to improve a Google rating?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "With a consistent review collection and response routine, most businesses see their average rating rise within 30 to 90 days. Speed depends on review volume and your reply rate.",
              },
            },
            {
              "@type": "Question",
              name: "How should I respond to negative Google reviews?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Reply with empathy, apologize for the experience, move the conversation to a private channel and explain the resolution. Branchly's AI drafts professional, on-brand responses in seconds.",
              },
            },
            {
              "@type": "Question",
              name: "Does Branchly work for multi-location brands?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Branchly is built for chains, franchises and multi-unit operators — you track each location's reputation, benchmark it against local competitors and get AI insights per location.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: GuideImproveReputation,
});

function GuideImproveReputation() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Branchly
          </Link>
          <span className="mx-2">/</span>
          <span>Guide</span>
        </nav>
        <header className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
            Complete guide
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            How to improve your Google reputation in 2026
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The playbook franchises and local businesses use to go from 3.8 to
            4.7 stars — without relying on luck or manual asks.
          </p>
        </header>

        <section className="prose prose-invert max-w-none space-y-6 text-base leading-relaxed">
          <p>
            Your Google reputation is the #1 driver of local buying decisions.
            Over 87% of consumers check reviews before visiting a business.
            Moving from 3.8 to 4.5 stars can
            <strong> double</strong> your profile clicks.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            1. Claim and optimize Google Business Profile
          </h2>
          <p>
            Make sure your profile is verified with the correct primary
            category, accurate hours, fresh photos and a description featuring
            your city and service keywords.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            2. Ask for reviews systematically
          </h2>
          <p>
            Build a routine: every served customer gets a short review link.
            Recency matters — fresh reviews carry more weight in Google's
            algorithm.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            3. Reply to 100% of reviews within 24h
          </h2>
          <p>
            Replying signals an active profile to Google and shows customers you
            care.
            <Link to="/" className="text-primary underline">
              {" "}
              Branchly's
            </Link>{" "}
            AI generates professional responses in seconds, on-brand.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            4. Monitor your local competitors
          </h2>
          <p>
            Knowing the average rating of your 5 nearest competitors is what
            separates winners from laggards. Branchly benchmarks automatically
            by category and city.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            5. Track 4 metrics weekly
          </h2>
          <p>
            Average rating, new review volume, response rate and sentiment.
            These four numbers tell the whole story of your reputation.
          </p>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h3 className="text-2xl font-semibold">Start free with Branchly</h3>
            <p className="mt-2 text-muted-foreground">
              Monitor reviews, reply with AI and see how you stack up against
              competitors.
            </p>
            <Link
              to="/sign-up/$"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create free account
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
