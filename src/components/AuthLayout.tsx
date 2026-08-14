import type { ReactNode } from "react";
import { Logo } from "./Logo";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  quote: string;
  attribution: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthLayout({ title, subtitle, quote, attribution, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>

      <div className="relative hidden border-l border-border bg-ink text-ink-foreground lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="absolute inset-0 opacity-[0.12] grid-lines" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-ink-foreground/60">
          HireFlow AI
        </p>
        <blockquote className="relative max-w-md">
          <p className="font-display text-2xl leading-snug">{quote}</p>
          <footer className="mt-5 text-sm text-ink-foreground/60">{attribution}</footer>
        </blockquote>
        <div className="relative grid grid-cols-3 gap-6 border-t border-ink-foreground/15 pt-8 text-sm">
          {[
            ["18k+", "applications tracked"],
            ["3.4x", "more interviews"],
            ["120+", "campuses"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-xl font-semibold">{v}</p>
              <p className="mt-1 text-xs text-ink-foreground/60">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
