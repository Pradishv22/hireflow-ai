import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, FileText, Lightbulb, Upload, X } from "lucide-react";
import { Button } from "@/components/Button";
import { ApiError, apiRequest, authHeaders, clearSession, getStoredToken } from "@/lib/api";

export const Route = createFileRoute("/resume-analyzer")({ component: ResumeAnalyzerPage });
const acceptedFileTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
type Analysis = {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  matchingExperience: string[];
  experienceGaps: string[];
  resumeStrengths: string[];
  resumeImprovements: string[];
  importantJobRequirements: string[];
  recommendation: string;
  shouldApply: boolean;
};

function ResumeAnalyzerPage() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
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
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("Resume files must be 5 MB or smaller.");
    if (!acceptedFileTypes.includes(file.type) && !/\.(pdf|docx|txt)$/i.test(file.name))
      return setError("Please choose a PDF, DOCX, or TXT resume.");
    setError("");
    setResumeFile(file);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getStoredToken();
    if (!token) return login();
    if (!resumeFile && !resumeText.trim())
      return setError("Upload a resume or paste its text to continue.");
    try {
      setLoading(true);
      setError("");
      const form = new FormData();
      if (resumeFile) form.append("resume", resumeFile);
      if (resumeText.trim()) form.append("resumeText", resumeText.trim());
      form.append("jobDescription", jobDescription.trim());
      const response = await apiRequest<{ analysis: Analysis }>("/api/ai/analyze-resume", {
        method: "POST",
        headers: authHeaders(token),
        body: form,
      });
      setAnalysis(response.analysis);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) return login();
      setError(caught instanceof Error ? caught.message : "Unable to analyze your resume.");
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
              <FileText className="h-4 w-4" /> AI tools
            </p>
            <h1 className="mt-2 text-3xl font-bold">AI Resume Match</h1>
            <p className="mt-2 text-muted-foreground">
              See how well your resume matches a specific job before you apply.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Back to dashboard
          </Button>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
            <h2 className="text-lg font-semibold">YOUR RESUME</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a file or paste your resume text. You only need one.
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-lg border border-dashed p-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                  <Upload className="h-5 w-5 text-primary" />
                  <span>
                    Upload resume{" "}
                    <span className="text-muted-foreground">(PDF, DOCX, TXT · 5 MB max)</span>
                  </span>
                  <input
                    className="sr-only"
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={selectFile}
                  />
                </label>
                {resumeFile ? (
                  <div className="mt-4 flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
                    <span className="truncate">Resume selected: {resumeFile.name}</span>
                    <button
                      type="button"
                      aria-label="Remove selected resume"
                      onClick={() => setResumeFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
              <div>
                <label htmlFor="resume-text" className="text-sm font-medium">
                  Paste resume text
                </label>
                <textarea
                  id="resume-text"
                  className="mt-2 min-h-36 w-full resize-y rounded-md border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  value={resumeText}
                  maxLength={50000}
                  placeholder="Paste your resume here..."
                  onChange={(event) => setResumeText(event.target.value)}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {resumeText.length.toLocaleString()} / 50,000
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
            <h2 className="text-lg font-semibold">JOB DESCRIPTION</h2>
            <textarea
              className="mt-4 min-h-56 w-full resize-y rounded-md border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              value={jobDescription}
              maxLength={20000}
              required
              placeholder="Paste the job description here..."
              onChange={(event) => setJobDescription(event.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {jobDescription.length.toLocaleString()} / 20,000 characters
              </p>
              <Button
                type="submit"
                disabled={loading || !jobDescription.trim() || (!resumeFile && !resumeText.trim())}
              >
                {loading ? "Analyzing your resume..." : "Analyze Match"}
              </Button>
            </div>
            {error ? (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </section>
        </form>
        {analysis ? <Results analysis={analysis} /> : null}
      </div>
    </div>
  );
}

function Results({ analysis }: { analysis: Analysis }) {
  const decision = analysis.shouldApply
    ? "Yes — apply"
    : analysis.matchScore >= 50
      ? "Maybe — close the key gaps first"
      : "Not yet — build more evidence first";
  return (
    <section className="mt-8 space-y-5" aria-live="polite">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl bg-ink p-6 text-ink-foreground">
          <p className="text-sm text-ink-foreground/70">MATCH SCORE</p>
          <p className="mt-3 font-display text-6xl font-semibold">
            {analysis.matchScore}
            <span className="text-2xl"> / 100</span>
          </p>
          <p className="mt-5 text-sm text-ink-foreground/80">{analysis.recommendation}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">SHOULD YOU APPLY?</p>
          <p className="mt-2 text-2xl font-semibold">{decision}</p>
          <p className="mt-5 border-t pt-5 text-sm leading-relaxed text-muted-foreground">
            {analysis.recommendation}
          </p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <ResultList
          title="MATCHING SKILLS"
          items={analysis.matchingSkills}
          icon={<CheckCircle2 className="h-4 w-4 text-accent" />}
        />
        <ResultList title="MISSING SKILLS" items={analysis.missingSkills} />
        <ResultList title="EXPERIENCE MATCH" items={analysis.matchingExperience} />
        <ResultList title="EXPERIENCE GAPS" items={analysis.experienceGaps} />
        <ResultList title="RESUME STRENGTHS" items={analysis.resumeStrengths} />
        <ResultList
          title="IMPROVE YOUR RESUME"
          items={analysis.resumeImprovements}
          icon={<Lightbulb className="h-4 w-4 text-primary" />}
        />
        <ResultList title="KEY JOB REQUIREMENTS" items={analysis.importantJobRequirements} />
      </div>
    </section>
  );
}
function ResultList({ title, items, icon }: { title: string; items: string[]; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {title}
      </p>
      {items.length ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-primary">•</span>
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
