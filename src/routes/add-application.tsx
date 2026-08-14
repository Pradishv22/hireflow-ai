import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ApiError, apiRequest, authHeaders, clearSession, getStoredToken } from "@/lib/api";

export const Route = createFileRoute("/add-application")({
  component: AddApplicationPage,
});

function AddApplicationPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [nextAction, setNextAction] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getStoredToken()) {
      clearSession();
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = getStoredToken();

    if (!token) {
      clearSession();
      navigate({ to: "/login" });
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiRequest("/api/applications", {
        method: "POST",
        headers: authHeaders(token, true),
        body: JSON.stringify({ company, role, status, nextAction, jobUrl }),
      });

      navigate({ to: "/dashboard" });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        navigate({ to: "/login" });
        return;
      }
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server. Make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Add Application</h1>

        <p className="mt-2 text-muted-foreground">Track a new internship or job application.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="company" className="text-sm font-medium">
              Company
            </label>

            <input
              id="company"
              className="mt-2 h-11 w-full rounded-md border bg-background px-3"
              placeholder="Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="text-sm font-medium">
              Job Title
            </label>

            <input
              id="role"
              className="mt-2 h-11 w-full rounded-md border bg-background px-3"
              placeholder="Software Engineer Intern"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>

            <select
              id="status"
              className="mt-2 h-11 w-full rounded-md border bg-background px-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Applied</option>
              <option>Screening</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="next-action" className="text-sm font-medium">
              Next Action
            </label>

            <input
              id="next-action"
              className="mt-2 h-11 w-full rounded-md border bg-background px-3"
              placeholder="Prepare for technical interview"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="job-url" className="text-sm font-medium">
              Job URL
            </label>

            <input
              id="job-url"
              type="url"
              className="mt-2 h-11 w-full rounded-md border bg-background px-3"
              placeholder="https://..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-md bg-primary px-4 font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
