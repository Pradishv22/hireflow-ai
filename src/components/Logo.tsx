import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[0.4rem] bg-ink text-ink-foreground transition-transform duration-200 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M5 19V5M19 19V5M5 12h14" strokeLinecap="round" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="font-display text-[1.05rem] font-semibold tracking-tight">HireFlow AI</span>
    </Link>
  );
}
