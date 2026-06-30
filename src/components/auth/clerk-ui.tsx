import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import type { ReactNode } from "react";

export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--accent)",
    colorBackground: "transparent",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorNeutral: "var(--border)",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full",
    card: "shadow-none border border-border rounded-2xl bg-card",
    headerTitle: "font-display text-xl tracking-tight",
    socialButtonsBlockButton: "rounded-lg border border-border",
    formFieldInput: "rounded-lg border border-border bg-background",
    formButtonPrimary: "rounded-lg bg-primary text-primary-foreground hover:bg-primary/90",
    footerActionLink: "text-primary hover:text-primary/90",
  },
} as const;

function ClerkCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-4 w-10 animate-pulse rounded-md bg-muted" />
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-11 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-4 w-40 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function ClerkFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[30rem] w-full">
      <ClerkLoading>
        <ClerkCardSkeleton />
      </ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
    </div>
  );
}