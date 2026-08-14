const stages = [
  { label: "Applied", count: 34, tone: "bg-secondary text-foreground" },
  { label: "In review", count: 12, tone: "bg-primary/10 text-primary" },
  { label: "Interview", count: 6, tone: "bg-accent/25 text-accent-foreground" },
  { label: "Offer", count: 2, tone: "bg-ink text-ink-foreground" },
];

const rows = [
  { role: "Product Analyst Intern", company: "Northwind", stage: "Interview", match: 94, when: "Tomorrow, 10:30" },
  { role: "Frontend Engineer (New Grad)", company: "Lumen Labs", stage: "In review", match: 88, when: "Follow up in 2d" },
  { role: "Data Science Intern", company: "Halcyon", stage: "Applied", match: 81, when: "Sent 3d ago" },
  { role: "Associate PM", company: "Fieldnote", stage: "Offer", match: 76, when: "Respond by Fri" },
];

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lift">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-3 text-xs text-muted-foreground">app.hireflow.ai / pipeline</span>
      </div>

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stages.map((s) => (
              <div key={s.label} className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1.5 font-display text-2xl font-semibold">{s.count}</p>
                <span className={`mt-2 inline-block rounded px-1.5 py-0.5 text-[0.65rem] font-medium ${s.tone}`}>
                  this month
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-border">
            <div className="hidden grid-cols-[1.6fr_0.8fr_0.6fr_0.9fr] gap-3 border-b border-border bg-surface px-4 py-2.5 text-[0.7rem] uppercase tracking-wider text-muted-foreground sm:grid">
              <span>Role</span>
              <span>Stage</span>
              <span>Match</span>
              <span>Next</span>
            </div>
            {rows.map((r) => (
              <div
                key={r.role}
                className="grid gap-1 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-surface sm:grid-cols-[1.6fr_0.8fr_0.6fr_0.9fr] sm:items-center sm:gap-3"
              >
                <div>
                  <p className="text-sm font-medium">{r.role}</p>
                  <p className="text-xs text-muted-foreground">{r.company}</p>
                </div>
                <span className="text-xs text-muted-foreground">{r.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${r.match}%` }} />
                  </span>
                  <span className="text-xs text-muted-foreground">{r.match}</span>
                </div>
                <span className="text-xs text-muted-foreground">{r.when}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">AI copilot</p>
          <p className="mt-3 text-sm leading-relaxed">
            Your Northwind interview is in 18 hours. I drafted 6 likely questions from the JD and tightened your
            resume bullets for analytics impact.
          </p>
          <div className="mt-4 space-y-2">
            {["Review 6 questions", "Apply resume edits", "Draft follow-up email"].map((a) => (
              <div
                key={a}
                className="cursor-default rounded-md border border-border bg-card px-3 py-2 text-xs transition-colors hover:border-foreground/30"
              >
                {a}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
