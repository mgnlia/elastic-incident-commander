const agents = [
  {
    name: "Incident Commander",
    role: "Orchestrator",
    toolGroup: ["severity_classifier", "escalation_workflow"],
    receives: "Incoming alert context",
    emits: "Severity + specialist routing",
  },
  {
    name: "Triage Agent",
    role: "Scope and Correlation",
    toolGroup: ["alert_correlator", "service_dependency", "logs_search"],
    receives: "Commander routing",
    emits: "Blast radius and impacted services",
  },
  {
    name: "Diagnosis Agent",
    role: "Root Cause Detection",
    toolGroup: ["log_analyzer", "metric_anomaly", "trace_correlator", "apm_search"],
    receives: "Triage evidence",
    emits: "Root cause hypothesis",
  },
  {
    name: "Remediation Agent",
    role: "Automated Recovery",
    toolGroup: ["pod_restart", "scale_service", "fix_verifier"],
    receives: "Diagnosis output",
    emits: "Runbook action + verification",
  },
  {
    name: "Communication Agent",
    role: "Stakeholder Updates",
    toolGroup: ["incident_timeline", "slack_notify", "postmortem_generate"],
    receives: "Execution timeline",
    emits: "Status updates and postmortem",
  },
];

const dataSources = [
  { name: "Logs", index: "logs-*" },
  { name: "Metrics", index: "metrics-*" },
  { name: "Traces", index: "traces-apm-*" },
  { name: "Alerts", index: ".alerts-*" },
];

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-12">
      <h1 className="text-4xl font-bold text-white">Architecture</h1>
      <p className="mt-3 max-w-3xl text-gray-300">
        Elastic Incident Commander runs a layered agent pattern where each agent
        owns a bounded responsibility and hands off structured output.
      </p>

      <section className="mt-10 space-y-4">
        {agents.map((agent, idx) => (
          <article
            key={agent.name}
            className="rounded-xl border border-dark-600 bg-dark-800 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Stage {idx + 1}
                </p>
                <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
                <p className="text-sm text-elastic-teal">{agent.role}</p>
              </div>
              <div className="max-w-md text-sm text-gray-300">
                <p>
                  <span className="text-gray-500">In:</span> {agent.receives}
                </p>
                <p>
                  <span className="text-gray-500">Out:</span> {agent.emits}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {agent.toolGroup.map((tool) => (
                <span
                  key={tool}
                  className="rounded bg-dark-900 px-2.5 py-1 text-xs text-gray-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Data flow</h2>
        <p className="mt-2 text-gray-400">
          ES|QL and index-search tools consume observability telemetry directly.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {dataSources.map((source) => (
            <div
              key={source.name}
              className="rounded-lg border border-dark-600 bg-dark-800 p-4"
            >
              <p className="font-medium text-white">{source.name}</p>
              <p className="mt-1 font-mono text-xs text-gray-400">{source.index}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
