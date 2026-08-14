import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  LayoutGrid,
  MessagesSquare,
  Search,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ButtonLink } from "@/components/Button";
import { FeatureCard } from "@/components/FeatureCard";
import { SectionHeading } from "@/components/SectionHeading";
import { DashboardPreview } from "@/components/DashboardPreview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HireFlow AI — Run your job search like a pipeline" },
      {
        name: "description",
        content:
          "HireFlow AI helps students and fresh graduates track applications, tailor resumes and prep interviews with an AI copilot.",
      },
      { property: "og:title", content: "HireFlow AI — Run your job search like a pipeline" },
      {
        property: "og:description",
        content:
          "Track every internship and graduate application, tailor your resume and never miss a follow-up.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: LayoutGrid,
    title: "One pipeline, zero spreadsheets",
    description:
      "Every internship and graduate role in a single board, from saved to offer, with status changes tracked automatically.",
  },
  {
    icon: FileText,
    title: "Resume tailoring that reads the JD",
    description:
      "Paste a job description and get rewritten bullets that mirror the language recruiters and screeners actually filter for.",
  },
  {
    icon: CalendarClock,
    title: "Deadlines that chase you back",
    description:
      "Application windows, assessment links and follow-up windows surface before they expire, not after.",
  },
  {
    icon: MessagesSquare,
    title: "Interview prep from your own history",
    description:
      "Question sets built from the role, the company and the projects already listed on your profile.",
  },
  {
    icon: Search,
    title: "Match scoring before you apply",
    description:
      "See how your profile stacks up against a posting so you spend effort on the roles worth the effort.",
  },
  {
    icon: Sparkles,
    title: "Follow-ups written for you",
    description:
      "Thank-you notes, nudges and status checks drafted in your voice and queued at the right moment.",
  },
];

const steps = [
  {
    n: "01",
    title: "Add your roles",
    body: "Paste a link or forward the confirmation email. HireFlow pulls in the company, role, deadline and stage.",
  },
  {
    n: "02",
    title: "Let the copilot prep you",
    body: "Get a match score, tailored resume bullets and a question set for every application in your pipeline.",
  },
  {
    n: "03",
    title: "Move every application forward",
    body: "Daily next actions keep follow-ups on time so nothing stalls between you and the offer.",
  },
];

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
          <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pt-28 lg:px-8">
            <div className="mx-auto max-w-3xl text-center rise-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Built for students and fresh graduates
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
                Run your job search like a pipeline, not a panic.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                HireFlow AI keeps every internship and graduate application in one place, tailors your resume to
                each role and tells you exactly what to do next.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink to="/signup" size="lg" variant="primary">
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-card px-6 text-[0.95rem] font-medium transition-colors hover:border-foreground/30 hover:bg-secondary"
                >
                  See How It Works
                </a>
              </div>
            </div>

            <div className="mt-16 rise-in sm:mt-20" style={{ animationDelay: "120ms" }}>
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t border-border py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <SectionHeading
              eyebrow="Features"
              title="Everything the spreadsheet was never going to do"
              description="HireFlow replaces the tabs, reminders and half-finished trackers with one workspace that actually keeps up with your search."
            />
            <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-t border-border bg-surface py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <SectionHeading
              eyebrow="How it works"
              title="Three steps from scattered to structured"
              align="center"
            />
            <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="group bg-card p-8 transition-colors hover:bg-background">
                  <span className="font-display text-sm font-semibold text-muted-foreground transition-colors group-hover:text-primary">
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="relative overflow-hidden rounded-xl bg-ink px-6 py-14 text-ink-foreground sm:px-14">
              <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.14]" />
              <div className="relative max-w-2xl">
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  Your next offer starts with one organised week.
                </h2>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-foreground/70">
                  Set up your pipeline in under five minutes. Free for students, no card required.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink to="/signup" size="lg" variant="accent">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink
                    to="/login"
                    size="lg"
                    variant="ghost"
                    className="border border-ink-foreground/20 text-ink-foreground/80 hover:bg-ink-foreground/10 hover:text-ink-foreground"
                  >
                    Sign In
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
