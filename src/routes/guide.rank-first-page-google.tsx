import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "How to Rank on the First Page of Google | Branchly";
const DESCRIPTION =
  "Learn how to rank on the first page of Google with local SEO, review management and competitor benchmarking. Practical 2026 guide from Branchly.";
const URL = "https://branchly.com.br/guide/rank-first-page-google";

export const Route = createFileRoute("/guide/rank-first-page-google")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "how to rank on first page of google, local seo, rank in google maps, google ranking, first page google, google map pack ranking, local search ranking",
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
              name: "How do I get my business on the first page of Google?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ranking on Google's first page comes down to three pillars: (1) technical SEO — fast, mobile-friendly, well-structured site; (2) content SEO — pages that answer the exact search intent; (3) local SEO and authority — optimized Google Business Profile, fresh high-rated reviews, and links from trusted sites. Branchly handles the third pillar, which is decisive for local businesses.",
              },
            },
            {
              "@type": "Question",
              name: "Do Google reviews help my ranking?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Review quantity, recency and average rating are official ranking factors for Google Maps and the local pack. Businesses with 4.5+ stars and a steady flow of reviews appear higher in results.",
              },
            },
            {
              "@type": "Question",
              name: "How long does it take to reach the first page?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For low-competition local terms, 60 to 120 days of consistent work. For nationally competitive terms, 6 to 12 months. Fresh reviews accelerate local results significantly.",
              },
            },
            {
              "@type": "Question",
              name: "How does Branchly help my site rank on Google?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Branchly tracks your reviews, drafts AI replies, compares you to the competitors ranking above you and shows exactly what to improve to climb the local pack.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: GuideRankFirstPage,
});

function GuideRankFirstPage() {
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
            Local SEO
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            How to rank on the first page of Google
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The 5-step method local businesses use to climb the map pack and
            dominate search results in their city.
          </p>
        </header>

        <section className="prose prose-invert max-w-none space-y-6 text-base leading-relaxed">
          <p>
            Showing up on Google's first page isn't luck — it's the result of
            three pillars working together: <strong>authority</strong>,{" "}
            <strong>relevance</strong> and
            <strong> reputation</strong>. For local businesses, reputation is
            the heaviest pillar.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            1. Optimize Google Business Profile
          </h2>
          <p>
            Verified profile, correct primary category, consistent NAP (Name,
            Address, Phone) across directories, fresh photos, and weekly posts.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            2. Build a steady flow of recent reviews
          </h2>
          <p>
            Reviews are the fuel of local ranking. Google rewards businesses
            with a constant stream of reviews and ratings above 4.5. Every new
            review is a relevance signal.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            3. Reply to every single review
          </h2>
          <p>
            Replies show activity and improve perception for the next visitor.
            <Link to="/" className="text-primary underline">
              {" "}
              Branchly's
            </Link>{" "}
            AI handles this at scale across all your locations.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            4. Study the competitors already ranking
          </h2>
          <p>
            Businesses ranking above you share three things: more reviews,
            higher rating, more photos. Branchly's benchmark shows the exact gap
            and how to close it.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            5. Fast site and local content
          </h2>
          <p>
            Pages with the city name in the title, real testimonials, structured
            FAQ and sub-2s load time. These technical signals complete the
            package.
          </p>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h3 className="text-2xl font-semibold">
              See how far you are from page 1
            </h3>
            <p className="mt-2 text-muted-foreground">
              Branchly shows your local score, compares it to competitors and
              recommends next steps.
            </p>
            <Link
              to="/sign-up/$"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Analyze my business free
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
