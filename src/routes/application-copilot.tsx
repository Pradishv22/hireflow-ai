import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clipboard, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { ApiError, apiRequest, authHeaders, clearSession, getStoredToken } from "@/lib/api";

export const Route = createFileRoute("/application-copilot")({ component: ApplicationCopilotPage });
type InterviewQuestion = { question: string; reason: string; whatToEmphasize: string };
type Kit = {
  coverLetter: string;
  fitExplanation: string;
  skillsToHighlight: string[];
  interviewQuestions: InterviewQuestion[];
  preparationTips: string[];
};

function ApplicationCopilotPage() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [kit, setKit] = useState<Kit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
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
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getStoredToken();
    if (!token) return login();
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest<{ kit: Kit }>("/api/ai/application-copilot", {
        method: "POST",
        headers: authHeaders(token, true),
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      setKit(response.kit);
      setCopied(false);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) return login();
      setError(caught instanceof Error ? caught.message : "Unable to prepare your application.");
    } finally {
      setLoading(false);
    }
  };
  const copyLetter = async () => {
    if (!kit) return;
    try {
      await navigator.clipboard.writeText(kit.coverLetter);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("We couldn't copy the cover letter. Please select and copy it manually.");
    }
  };
  return (
    <div className="min-h-screen bg-background p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> AI tools
            </p>
            <h1 className="mt-2 text-3xl font-bold">AI Application Copilot</h1>
            <p className="mt-2 text-muted-foreground">
              Prepare a stronger application with AI-powered, job-specific guidance.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Back to dashboard
          </Button>
        </div>
        <form
          onSubmit={submit}
          className="mt-8 space-y-5 rounded-xl border bg-card p-5 shadow-soft sm:p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextArea
              id="copilot-job"
              label="JOB DESCRIPTION"
              value={jobDescription}
              placeholder="Paste the job description here..."
              maxLength={20000}
              onChange={setJobDescription}
            />
            <TextArea
              id="copilot-resume"
              label="RESUME"
              value={resumeText}
              placeholder="Paste your resume text here..."
              maxLength={50000}
              onChange={setResumeText}
            />
          </div>
          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={loading || !resumeText.trim() || !jobDescription.trim()}
            >
              {loading ? "Preparing your application..." : "Generate Application Kit"}
            </Button>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>
        {kit ? <Results kit={kit} copied={copied} onCopy={() => void copyLetter()} /> : null}
      </div>
    </div>
  );
}
function TextArea({
  id,
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        className="mt-3 min-h-64 w-full resize-y rounded-md border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        value={value}
        maxLength={maxLength}
        required
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="mt-1 text-right text-xs text-muted-foreground">
        {value.length.toLocaleString()} / {maxLength.toLocaleString()}
      </p>
    </div>
  );
}
function Results({ kit, copied, onCopy }: { kit: Kit; copied: boolean; onCopy: () => void }) {
  return (
    <section className="mt-8 space-y-5" aria-live="polite">
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">COVER LETTER</h2>
          <Button size="sm" variant="outline" onClick={onCopy}>
            <Clipboard className="h-4 w-4" /> {copied ? "Copied!" : "Copy Cover Letter"}
          </Button>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {kit.coverLetter}
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <ResultCard title="WHY YOU'RE A GOOD FIT">
          <p className="text-sm leading-relaxed text-muted-foreground">{kit.fitExplanation}</p>
        </ResultCard>
        <ResultCard title="SKILLS TO HIGHLIGHT">
          <Pills items={kit.skillsToHighlight} />
        </ResultCard>
      </div>
      <ResultCard title="INTERVIEW QUESTIONS">
        <div className="mt-4 space-y-4">
          {kit.interviewQuestions.map((item, index) => (
            <div key={`${index}-${item.question}`} className="rounded-lg border bg-background p-4">
              <p className="font-medium">
                {index + 1}. {item.question}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Why they may ask: </span>
                {item.reason}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">What to emphasize: </span>
                {item.whatToEmphasize}
              </p>
            </div>
          ))}
        </div>
      </ResultCard>
      <ResultCard title="INTERVIEW PREPARATION">
        <ul className="mt-4 space-y-3">
          {kit.preparationTips.map((tip) => (
            <li key={tip} className="flex gap-2 text-sm leading-relaxed">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </ResultCard>
    </section>
  );
}
function ResultCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Pills({ items }: { items: string[] }) {
  return items.length ? (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border bg-background px-3 py-1.5 text-sm">
          {item}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">No skills identified.</p>
  );
}
