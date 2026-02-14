import Link from "next/link";

const agentFlow = [
  "Incident Commander",
  "Triage",
  "Diagnosis",
  "Remediation",
  "Communication",
];

const scenarios = [
  {
    name: "CPU Spike",
    severity: "P2",
    severityClass: "severity-p2",
    description:
      "Payment service CPU climbs to 95%. Agents correlate alerts, isolate an inefficient query, then scale and verify recovery.",
  },
  {
    name: "Memory Leak",
    severity: "P2",
    severityClass: "severity-p2",
    description:
      "User service memory grows to 97% and pods OOM. Remediation restarts workloads and flags long-term action.",
  },
  {
    name: "Cascading Failure",
    severity: "P1",
    severityClass: "severity-p1",
    description:
      "Inventory DB outage propagates to orders and gateway traffic. Multi-agent response contains blast radius quickly.",
  },
];

export default function HomePage() {
  return (
    <div className="px-6 pb-20 pt-12">
      <section className="mx-auto max-w-6xl rounded-2xl border border-dark-600 bg-gradient-to-br from-dark-800 to-dark-900 p-10">
        <span className="inline-flex items-center rounded-full border border-elastic-teal/40 bg-elastic-teal/10 px-3 py-1 text-xs text-elastic-teal">
          Elastic Agent Builder Hackathon Submission
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
          DevOps Incident Commander
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-gray-300">
          A visual companion for a multi-agent incident response system in
          Elastic. Five agents coordinate severity triage, diagnosis,
          remediation, and communication in one flow.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/demo"
            className="rounded-md bg-elastic-teal px-5 py-2.5 font-semibold text-dark-900 transition hover:bg-elastic-teal/90"
          >
            Open Live Demo
          </Link>
          <Link
            href="/architecture"
            className="rounded-md border border-dark-500 bg-dark-700 px-5 py-2.5 font-semibold text-gray-100 transition hover:border-elastic-teal/40"
          >
            View Architecture
          </Link>
          <a
            href="https://github.com/mgnlia/elastic-incident-commander#-quick-start"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-dark-500 px-5 py-2.5 font-semibold text-gray-300 transition hover:text-white"
          >
            Try in Kibana ↗
          </a>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl">
        <h2 className="text-2xl font-semibold text-white">How it works</h2>
        <p className="mt-2 text-gray-400">
          A single incident message triggers this deterministic orchestration path.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {agentFlow.map((step, idx) => (
            <div
              key={step}
              className="rounded-xl border border-dark-600 bg-dark-800 p-4 text-center"
            >
              <p className="text-xs text-gray-500">Step {idx + 1}</p>
              <p className="mt-1 font-medium text-white">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl">
        <h2 className="text-2xl font-semibold text-white">Incident scenarios</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {scenarios.map((scenario) => (
            <article
              key={scenario.name}
              className="rounded-xl border border-dark-600 bg-dark-800 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-white">{scenario.name}</h3>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${scenario.severityClass}`}
                >
                  {scenario.severity}
                </span>
              </div>
              <p className="text-sm text-gray-300">{scenario.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
