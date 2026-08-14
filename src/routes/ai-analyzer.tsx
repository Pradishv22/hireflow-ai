import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BrainCircuit, CheckCircle2, Lightbulb, Target } from "lucide-react";
import { Button } from "@/components/Button";
import { ApiError, apiRequest, authHeaders, clearSession, getStoredToken } from "@/lib/api";

export const Route = createFileRoute("/ai-analyzer")({ component: AiAnalyzerPage });

type Analysis = {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
  keyRequirements: string[];
  seniority: string;
  recommendation: string;
};

function AiAnalyzerPage() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = () => {
    clearSession();
    navigate({ to: "/login" });
  };
  useEffect(() => {
    if (!getStoredToken()) {
      clearSession();
      navigate({ to: "/login" });
    }
  }, [navigate]);
  const analyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getStoredToken();
    if (!token) return login();
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest<{ analysis: Analysis }>("/api/ai/analyze-job", {
        method: "POST",
        headers: authHeaders(token, true),
        body: JSON.stringify({ jobDescription }),
      });
      setAnalysis(response.analysis);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) return login();
      setError(
        caught instanceof Error ? caught.message : "Unable to analyze this job description.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <BrainCircuit className="h-4 w-4" /> AI tools
            </p>
            <h1 className="mt-2 text-3xl font-bold">AI Job Match Analyzer</h1>
            <p className="mt-2 text-muted-foreground">
              Understand how well a job matches your current skills.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Back to dashboard
          </Button>
        </div>
        <form onSubmit={analyze} className="mt-8 rounded-xl border bg-card p-5 shadow-soft sm:p-6">
          <label htmlFor="job-description" className="text-sm font-medium">
            Job description
          </label>
          <textarea
            id="job-description"
            className="mt-3 min-h-56 w-full resize-y rounded-md border border-input bg-background p-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="Paste the job description here..."
            value={jobDescription}
            maxLength={20000}
            required
            onChange={(event) => setJobDescription(event.target.value)}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {jobDescription.length.toLocaleString()} / 20,000 characters
            </p>
            <Button type="submit" disabled={loading || !jobDescription.trim()}>
              {loading ? "Analyzing job..." : "Analyze Job"}
            </Button>
          </div>
          {error ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>
        {analysis ? (
          <section className="mt-8 space-y-5" aria-live="polite">
            <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-xl border bg-ink p-6 text-ink-foreground">
                <p className="text-sm text-ink-foreground/70">MATCH SCORE</p>
                <p className="mt-3 font-display text-6xl font-semibold">{analysis.matchScore}%</p>
                <p className="mt-5 text-sm leading-relaxed text-ink-foreground/80">
                  {analysis.recommendation}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">SENIORITY</p>
                <p className="mt-2 text-2xl font-semibold">
                  {analysis.seniority || "Not detected"}
                </p>
                <div className="mt-5 border-t pt-5">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-4 w-4 text-primary" /> AI RECOMMENDATION
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {analysis.recommendation}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <AnalysisList
                title="MATCHING SKILLS"
                items={analysis.matchingSkills}
                icon={<CheckCircle2 className="h-4 w-4 text-accent" />}
              />
              <AnalysisList title="MISSING SKILLS" items={analysis.missingSkills} />
              <AnalysisList
                title="RECOMMENDED TO LEARN"
                items={analysis.recommendedSkills}
                icon={<Lightbulb className="h-4 w-4 text-primary" />}
              />
              <AnalysisList title="KEY REQUIREMENTS" items={analysis.keyRequirements} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function AnalysisList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {title}
      </p>
      {items.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item} className="rounded-full border bg-background px-3 py-1.5 text-sm">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No items identified.</p>
      )}
    </div>
  );
}
