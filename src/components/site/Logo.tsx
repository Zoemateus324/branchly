export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-7 w-7">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[oklch(0.6_0.18_265)] to-[oklch(0.5_0.2_290)]" />
        <div className="absolute inset-[3px] rounded-md bg-background flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 19V5M6 5l6 4M6 5l-3 3M18 19V9M18 9l-4 3M18 9l3-3" />
          </svg>
        </div>
      </div>
      <span className="font-display text-lg font-semibold tracking-tight">Branchly</span>
    </div>
  );
}