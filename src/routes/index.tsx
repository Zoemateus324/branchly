import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import {
  Hero,
  Logos,
  Stats,
  Problems,
  Solution,
  Simulator,
  Pricing,
  CTA,
  Footer,
} from "@/components/site/Sections";

const TITLE = "Branchly — Multi-Location Reputation Intelligence";
const DESCRIPTION =
  "Reputation software for multi-location businesses. Monitor Google reviews, benchmark competitors and grow ratings with AI.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "reputation management software, multi location reputation management, review management platform, google review management, competitor benchmarking tool, reputation monitoring, local seo software, online reputation management",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Branchly",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: DESCRIPTION,
          offers: [
            {
              "@type": "Offer",
              name: "Free",
              price: "0",
              priceCurrency: "USD",
            },
            {
              "@type": "Offer",
              name: "Starter",
              price: "19",
              priceCurrency: "USD",
            },
            {
              "@type": "Offer",
              name: "Pro",
              price: "29",
              priceCurrency: "USD",
            },
            {
              "@type": "Offer",
              name: "Premium",
              price: "49",
              priceCurrency: "USD",
            },
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "182",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is multi-location reputation management?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Multi-location reputation management is the practice of monitoring, analyzing and improving customer reviews and ratings across every physical location of a business in one place. Branchly monitors Google reviews, benchmarks each location against local competitors and surfaces AI insights to grow ratings.",
              },
            },
            {
              "@type": "Question",
              name: "How does Branchly compare to traditional review management software?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Traditional review management tools focus on collecting and replying to reviews. Branchly goes further with competitive benchmarking, location-by-location ranking and AI-driven growth opportunities — built for chains, franchises and multi-unit operators.",
              },
            },
            {
              "@type": "Question",
              name: "How much does Branchly cost?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Branchly starts free for single locations. Paid plans range from $19 to $49 per month with a 14-day Pro trial. Multi-location and enterprise pricing scales with the number of locations monitored.",
              },
            },
            {
              "@type": "Question",
              name: "Does Branchly work with Google Business Profile?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Branchly connects to Google Business Profile to monitor reviews, ratings and category competitors automatically — no manual exports required.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Logos />
        <Problems />
        <Solution />
        <Stats />
        <Simulator />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
