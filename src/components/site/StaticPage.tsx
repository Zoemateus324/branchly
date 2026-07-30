import { type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Sections";
import { Analytics } from "@vercel/analytics/next"

interface StaticPageProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function StaticPage({ eyebrow, title, subtitle, children }: StaticPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Analytics />
      <Header />
      <main>
        <div className="border-b border-border bg-muted/30 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-16">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function Section({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-16 ${className}`}>
      {title && (
        <h2 className="font-display mb-8 text-2xl font-semibold text-foreground">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function ProseCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
