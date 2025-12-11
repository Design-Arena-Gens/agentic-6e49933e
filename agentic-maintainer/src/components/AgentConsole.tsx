"use client";

import { useMemo, useState } from "react";
import type { AuditResponse } from "@/types/audit";

const statusStyles: Record<string, string> = {
  pass: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  warn: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  fail: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

const priorityStyles: Record<string, string> = {
  high: "border-rose-500/50",
  medium: "border-amber-500/50",
  low: "border-emerald-500/50",
};

function formatTimestamp(iso: string) {
  try {
    const date = new Date(iso);
    return date.toLocaleString();
  } catch {
    return iso;
  }
}

export default function AgentConsole() {
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [history, setHistory] = useState<AuditResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const totalOpenTasks = useMemo(() => {
    if (!audit) return 0;
    return audit.tasks.filter((task) => !completedTasks[task.id]).length;
  }, [audit, completedTasks]);

  const reliabilityScore = useMemo(() => {
    if (!audit) return null;
    const passCount = audit.checks.filter((item) => item.status === "pass").length;
    const total = audit.checks.length;
    return Math.round((passCount / Math.max(total, 1)) * 100);
  }, [audit]);

  async function runAudit() {
    if (!url) {
      setError("Provide a website URL to audit.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Audit failed");
      }

      const payload = (await response.json()) as AuditResponse;
      setAudit(payload);
      setHistory((current) => [payload, ...current].slice(0, 5));
      setCompletedTasks({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function toggleTask(taskId: string) {
    setCompletedTasks((current) => ({
      ...current,
      [taskId]: !current[taskId],
    }));
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-blue-500/10 to-emerald-500/10 blur-3xl" />
        <header className="relative mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 pb-12 pt-16">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100/80 backdrop-blur">
            Autonomous Site Maintainer
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Keep your site healthy with an always-on maintenance agent.
          </h1>
          <p className="max-w-2xl text-base text-slate-200/80 sm:text-lg">
            Run targeted audits, receive prioritized fixes, and track follow-up actions in
            one workspace. The agent inspects uptime, content, accessibility, and link
            health every time you trigger a run.
          </p>
          <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur">
            <label className="text-sm font-medium text-slate-200" htmlFor="site-url">
              Target website URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="site-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-base text-white shadow-inner shadow-black/40 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-400/30"
              />
              <button
                onClick={runAudit}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-5 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Scanning..." : "Run Audit"}
              </button>
            </div>
            {error ? (
              <p className="text-sm text-rose-300">{error}</p>
            ) : (
              <p className="text-xs text-slate-400">
                The agent performs a live fetch using a limited sample of internal links to
                estimate health metrics. Store credentials securely before scanning private
                pages.
              </p>
            )}
          </div>
        </header>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 pb-24">
        {audit ? (
          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <article className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-900/60">
              <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-white">Health overview</h2>
                  <p className="text-sm text-slate-300/80">
                    Last run {formatTimestamp(audit.generatedAt)} on {audit.targetUrl}
                  </p>
                </div>
                {reliabilityScore !== null && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Site reliability
                    </span>
                    <span className="text-3xl font-semibold text-emerald-300">
                      {reliabilityScore}%
                    </span>
                  </div>
                )}
              </header>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold text-slate-200">Response time</h3>
                  <p className="text-2xl font-semibold text-white">
                    {audit.responseTimeMs ? `${audit.responseTimeMs} ms` : "Unknown"}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {audit.statusCode ? `HTTP ${audit.statusCode}` : "No response captured"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold text-slate-200">Content depth</h3>
                  <p className="text-2xl font-semibold text-white">{audit.wordCount} words</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Title: {audit.title ? audit.title : "Not detected"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Checks
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {audit.checks.map((check) => (
                    <div
                      key={check.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[check.status]}`}
                      >
                        {check.status}
                      </span>
                      <h4 className="mt-3 text-lg font-semibold text-white">{check.label}</h4>
                      <p className="mt-2 text-sm text-slate-300/80">{check.details}</p>
                      <p className="mt-2 text-xs text-slate-400">{check.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-900/60">
                <h3 className="text-lg font-semibold text-white">Maintenance queue</h3>
                <p className="text-xs text-slate-400">
                  {totalOpenTasks === 0
                    ? "All agent tasks are complete. Great work!"
                    : `${totalOpenTasks} task${totalOpenTasks === 1 ? "" : "s"} awaiting attention.`}
                </p>
                <div className="mt-4 space-y-3">
                  {audit.tasks.length === 0 ? (
                    <p className="text-sm text-slate-300/80">
                      The agent has not queued any fixes for this run.
                    </p>
                  ) : (
                    audit.tasks.map((task) => {
                      const done = completedTasks[task.id] ?? false;
                      return (
                        <label
                          key={task.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border bg-slate-950/60 p-4 transition hover:border-sky-400/50 ${
                            priorityStyles[task.priority]
                          } ${done ? "opacity-60" : ""}`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-400 text-sky-400 focus:ring-sky-400"
                            checked={done}
                            onChange={() => toggleTask(task.id)}
                          />
                          <div className="space-y-1">
                            <span className="text-xs uppercase tracking-widest text-slate-400">
                              {task.priority} priority
                            </span>
                            <p className="text-sm font-semibold text-white">{task.title}</p>
                            <p className="text-xs text-slate-300/80">{task.description}</p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-900/60">
                <h3 className="text-lg font-semibold text-white">Insights</h3>
                <div className="mt-4 space-y-3">
                  {audit.insights.length === 0 ? (
                    <p className="text-sm text-slate-300/80">
                      No pressing insights for this run. Schedule the next check after publishing
                      new content.
                    </p>
                  ) : (
                    audit.insights.map((insight) => (
                      <div
                        key={insight.id}
                        className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4"
                      >
                        <span className="text-xs uppercase tracking-[0.3em] text-sky-300">
                          {insight.category}
                        </span>
                        <p className="mt-2 text-sm text-slate-100">{insight.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-10 text-center">
            <h2 className="text-2xl font-semibold text-white">Awaiting first audit</h2>
            <p className="mt-3 text-sm text-slate-300/80">
              Launch the agent to compile uptime, accessibility, and SEO signals for your
              site. Each run builds a lightweight knowledge base you can act on instantly.
            </p>
          </section>
        )}

        <section className="mt-10 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-900/60">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">Audit history</h2>
              <p className="text-xs text-slate-400">
                The agent stores the last five runs locally in your browser for quick context.
              </p>
            </div>
          </header>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {history.length === 0 ? (
              <p className="text-sm text-slate-300/80">
                Run your first audit to populate the timeline.
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={`${item.generatedAt}-${item.targetUrl}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {new URL(item.targetUrl).hostname}
                      </p>
                      <h3 className="text-base font-semibold text-white">
                        {formatTimestamp(item.generatedAt)}
                      </h3>
                    </div>
                    <span className="text-2xl font-semibold text-emerald-300">
                      {Math.round(
                        (item.checks.filter((check) => check.status === "pass").length /
                          Math.max(item.checks.length, 1)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300/80">
                    <div>HTTP {item.statusCode ?? "-"}</div>
                    <div>{item.responseTimeMs ? `${item.responseTimeMs} ms` : "n/a"}</div>
                    <div>
                      {item.brokenLinks.length} broken link{item.brokenLinks.length === 1 ? "" : "s"}
                    </div>
                    <div>{item.imagesMissingAlt} missing alt</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
