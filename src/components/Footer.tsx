import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const columns = [
  { title: "Product", items: ["Features", "Tracker", "AI Assistant", "Pricing"] },
  { title: "Company", items: ["About", "Careers", "Blog", "Contact"] },
  { title: "Resources", items: ["Resume Guide", "Interview Prep", "Help Center", "Status"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The application workspace for students and fresh graduates chasing their first offer.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item}>
                    <a href="/#features" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} HireFlow AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/login" className="transition-colors hover:text-foreground">
              Sign In
            </Link>
            <a href="/#how-it-works" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="/#how-it-works" className="transition-colors hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
