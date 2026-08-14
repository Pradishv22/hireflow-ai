import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  ApiError,
  apiRequest,
  authHeaders,
  clearSession,
  getStoredToken,
  type Application,
  type ApplicationStatus,
} from "@/lib/api";

export const Route = createFileRoute("/edit-application/$id")({ component: EditApplicationPage });
const statusOptions: ApplicationStatus[] = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
];
type FormValues = {
  company: string;
  role: string;
  status: ApplicationStatus;
  nextAction: string;
  jobUrl: string;
};

function EditApplicationPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/edit-application/$id" });
  const [form, setForm] = useState<FormValues>({
    company: "",
    role: "",
    status: "Applied",
    nextAction: "",
    jobUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const login = () => {
    clearSession();
    navigate({ to: "/login" });
  };
  useEffect(() => {
    const load = async () => {
      const token = getStoredToken();
      if (!token) {
        clearSession();
        navigate({ to: "/login" });
        return;
      }
      try {
        const { application } = await apiRequest<{ application: Application }>(
          `/api/applications/${id}`,
          { headers: authHeaders(token) },
        );
        setForm({
          company: application.company,
          role: application.role,
          status: application.status,
          nextAction: application.nextAction ?? "",
          jobUrl: application.jobUrl ?? "",
        });
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 401) {
          clearSession();
          navigate({ to: "/login" });
          return;
        }
        setError(caught instanceof Error ? caught.message : "Unable to load the application.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, navigate]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getStoredToken();
    if (!token) return login();
    try {
      setSaving(true);
      setError("");
      await apiRequest(`/api/applications/${id}`, {
        method: "PUT",
        headers: authHeaders(token, true),
        body: JSON.stringify(form),
      });
      navigate({ to: "/dashboard" });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) return login();
      setError(caught instanceof Error ? caught.message : "Unable to update the application.");
    } finally {
      setSaving(false);
    }
  };
  const change = (field: keyof FormValues, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  if (loading)
    return (
      <div className="min-h-screen bg-background p-8 text-muted-foreground">
        Loading application...
      </div>
    );
  return (
    <div className="min-h-screen bg-background p-5 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Edit Application</h1>
        <p className="mt-2 text-muted-foreground">Keep this application moving forward.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          {(
            [
              ["company", "Company", "Google"],
              ["role", "Job Title", "Software Engineer Intern"],
              ["nextAction", "Next Action", "Prepare for technical interview"],
              ["jobUrl", "Job URL", "https://..."],
            ] as const
          ).map(([field, label, placeholder]) => (
            <div key={field}>
              <label htmlFor={`edit-${field}`} className="text-sm font-medium">
                {label}
              </label>
              <input
                id={`edit-${field}`}
                type={field === "jobUrl" ? "url" : "text"}
                className="mt-2 h-11 w-full rounded-md border bg-card px-3"
                value={form[field]}
                placeholder={placeholder}
                required={field === "company" || field === "role"}
                onChange={(event) => change(field, event.target.value)}
              />
            </div>
          ))}
          <div>
            <label htmlFor="edit-status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="edit-status"
              className="mt-2 h-11 w-full rounded-md border bg-card px-3"
              value={form.status}
              onChange={(event) => change("status", event.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-md bg-primary font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
