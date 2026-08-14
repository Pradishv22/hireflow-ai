import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import {
  ApiError,
  apiRequest,
  authHeaders,
  clearSession,
  getStoredToken,
  getStoredUser,
  type Application,
  type ApplicationStatus,
  type StoredUser,
} from "@/lib/api";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });
const statuses: ApplicationStatus[] = ["Applied", "Screening", "Interview", "Offer", "Rejected"];

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const redirectToLogin = useCallback(() => {
    clearSession();
    navigate({ to: "/login" });
  }, [navigate]);
  const loadApplications = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return redirectToLogin();
    try {
      setError("");
      const data = await apiRequest<{ applications: Application[] }>("/api/applications", {
        headers: authHeaders(token),
      });
      setApplications(data.applications);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) return redirectToLogin();
      setError(caught instanceof Error ? caught.message : "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }, [redirectToLogin]);
  useEffect(() => {
    setUser(getStoredUser());
    void loadApplications();
  }, [loadApplications]);
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    const token = getStoredToken();
    if (!token) return redirectToLogin();
    try {
      await apiRequest<{ message: string }>(`/api/applications/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      setApplications((current) => current.filter((application) => application._id !== id));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) return redirectToLogin();
      setError(caught instanceof Error ? caught.message : "Unable to delete the application.");
    }
  };
  const statistics = statuses.map((status) => ({
    status,
    count: applications.filter((application) => application.status === status).length,
  }));
  return (
    <div className="min-h-screen bg-background p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name || "there"} 👋</h1>
            <p className="mt-2 text-muted-foreground">Your HireFlow AI applications</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate({ to: "/resume-analyzer" })}>
              Analyze Resume
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/ai-analyzer" })}>
              AI Analyzer
            </Button>
            <Button onClick={() => navigate({ to: "/add-application" })}>+ Add Application</Button>
            <Button variant="outline" onClick={redirectToLogin}>
              Logout
            </Button>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-semibold">{applications.length}</p>
          </div>
          {statistics.map(({ status, count }) => (
            <div key={status} className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">{status}</p>
              <p className="mt-1 text-2xl font-semibold">{count}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Applications</h2>
            {error ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setLoading(true);
                  void loadApplications();
                }}
              >
                Try again
              </Button>
            ) : null}
          </div>
          {loading ? <p className="mt-4 text-muted-foreground">Loading applications...</p> : null}
          {error ? (
            <p role="alert" className="mt-4 text-destructive">
              {error}
            </p>
          ) : null}
          {!loading && !error && applications.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed bg-card p-6">
              <p className="text-muted-foreground">
                You have not added any applications yet. Start by tracking your first role.
              </p>
              <Button className="mt-4" onClick={() => navigate({ to: "/add-application" })}>
                Add your first application
              </Button>
            </div>
          ) : null}
          <div className="mt-4 space-y-4">
            {applications.map((application) => (
              <div key={application._id} className="rounded-lg border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{application.company}</h3>
                    <p className="text-sm text-muted-foreground">{application.role}</p>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-sm">
                    {application.status}
                  </span>
                </div>
                {application.nextAction ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Next: {application.nextAction}
                  </p>
                ) : null}
                {application.jobUrl ? (
                  <a
                    className="mt-2 block truncate text-sm text-primary hover:underline"
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View job posting
                  </a>
                ) : null}
                <div className="mt-4 flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate({ to: "/edit-application/$id", params: { id: application._id } })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate({ to: "/application-copilot" })}
                  >
                    AI Copilot
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => void handleDelete(application._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
