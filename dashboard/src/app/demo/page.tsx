"use client";

import { useMemo, useState } from "react";

type DemoStep = {
  agent: string;
  title: string;
  detail: string;
  severity?: "P1" | "P2" | "P3" | "P4";
};

type Scenario = {
  id: string;
  name: string;
  service: string;
  summary: string;
  steps: DemoStep[];
};

const scenarios: Scenario[] = [
  {
    id: "cpu-spike",
    name: "Scenario 1: CPU Spike",
    service: "payment-service",
    summary:
      "CPU rises to 95% on 3 hosts after deployment. System should classify, triage, diagnose query regression, scale, and notify.",
    steps: [
      {
        agent: "Incident Commander",
        title: "Severity classification",
        detail:
          "Analyzed active alerts + host spread and classified incident as P2 with immediate triage handoff.",
        severity: "P2",
      },
      {
        agent: "Triage Agent",
        title: "Correlated blast radius",
        detail:
          "Found 3 correlated alerts in payment-service and checkout dependency chain. Scope constrained to two services.",
      },
      {
        agent: "Diagnosis Agent",
        title: "Root cause hypothesis",
        detail:
          "Detected latency jump after recent deploy and linked spikes to inefficient SQL query pattern in checkout endpoint.",
      },
      {
        agent: "Remediation Agent",
        title: "Runbook execution",
        detail:
          "Triggered scale_service_workflow (3→6 replicas) and validated latency recovery below SLO in 4 minutes.",
      },
      {
        agent: "Communication Agent",
        title: "Stakeholder update",
        detail:
          "Posted #incidents update with impact, action taken, and next update ETA: 15 minutes.",
      },
    ],
  },
  {
    id: "memory-leak",
    name: "Scenario 2: Memory Leak",
    service: "user-service",
    summary: "Progressive memory growth causes OOM kills and degraded login reliability.",
    steps: [
      {
        agent: "Incident Commander",
        title: "Severity classification",
        detail: "Classified as P2 and initiated diagnostics for memory pressure conditions.",
        severity: "P2",
      },
      {
        agent: "Triage Agent",
        title: "Pattern confirmation",
        detail: "Mapped OOMKill events to same deployment window and pod set.",
      },
      {
        agent: "Diagnosis Agent",
        title: "Leak evidence",
        detail: "Correlated allocation growth with session cache miss handling path.",
      },
      {
        agent: "Remediation Agent",
        title: "Stabilization",
        detail: "Executed pod_restart_workflow and created follow-up refactor recommendation.",
      },
      {
        agent: "Communication Agent",
        title: "Incident note",
        detail: "Published workaround and next action items to incident channel.",
      },
    ],
  },
  {
    id: "cascading-failure",
    name: "Scenario 3: Cascading Failure",
    service: "inventory-db",
    summary: "Primary datastore outage cascades into timeout storms and gateway errors.",
    steps: [
      {
        agent: "Incident Commander",
        title: "Severity classification",
        detail: "Classified as P1 due to broad customer impact and elevated error budget burn.",
        severity: "P1",
      },
      {
        agent: "Triage Agent",
        title: "Dependency map",
        detail: "Identified impact chain: inventory → order-service → gateway.",
      },
      {
        agent: "Diagnosis Agent",
        title: "Root cause confirmation",
        detail: "Confirmed database connection refusals and circuit breaker opens.",
      },
      {
        agent: "Remediation Agent",
        title: "Containment",
        detail: "Applied failover workflow and reduced gateway error rate to baseline.",
      },
      {
        agent: "Communication Agent",
        title: "Executive summary",
        detail: "Sent high-priority updates and initiated postmortem draft creation.",
      },
    ],
  },
];

function severityClass(level?: "P1" | "P2" | "P3" | "P4") {
  if (!level) return "bg-dark-700 text-gray-300 border border-dark-500";
  return `severity-${level.toLowerCase()}`;
}

export default function DemoPage() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [stepIndex, setStepIndex] = useState(0);

  const scenario = useMemo(
    () => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0],
    [scenarioId]
  );

  const visibleSteps = scenario.steps.slice(0, stepIndex + 1);
  const isDone = stepIndex >= scenario.steps.length - 1;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-12">
      <h1 className="text-4xl font-bold text-white">Interactive Demo</h1>
      <p className="mt-3 text-gray-300">
        Simulated incident timelines that mirror the Elastic Agent Builder flow.
      </p>

      <section className="mt-8 grid gap-3 md:grid-cols-3">
        {scenarios.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              setScenarioId(item.id);
              setStepIndex(0);
            }}
            className={`rounded-xl border p-4 text-left transition ${
              scenario.id === item.id
                ? "border-elastic-teal bg-elastic-teal/10"
                : "border-dark-600 bg-dark-800 hover:border-dark-500"
            }`}
          >
            <p className="font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-xs text-gray-400">{item.service}</p>
          </button>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-dark-600 bg-dark-800 p-6">
        <h2 className="text-2xl font-semibold text-white">{scenario.name}</h2>
        <p className="mt-2 text-sm text-gray-300">{scenario.summary}</p>

        <div className="mt-6 space-y-3">
          {visibleSteps.map((step, idx) => (
            <article
              key={`${step.agent}-${idx}`}
              className="rounded-lg border border-dark-600 bg-dark-900/50 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-500">Step {idx + 1}</p>
                  <p className="font-medium text-white">{step.agent}</p>
                </div>
                {step.severity ? (
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${severityClass(step.severity)}`}>
                    {step.severity}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-200">{step.title}</p>
              <p className="mt-1 text-sm text-gray-400">{step.detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
            className="rounded-md border border-dark-500 bg-dark-700 px-4 py-2 text-sm text-gray-200 transition hover:border-dark-400"
          >
            Previous step
          </button>
          <button
            type="button"
            onClick={() =>
              setStepIndex((prev) =>
                prev + 1 > scenario.steps.length - 1 ? prev : prev + 1
              )
            }
            className="rounded-md bg-elastic-teal px-4 py-2 text-sm font-semibold text-dark-900 transition hover:bg-elastic-teal/90"
          >
            {isDone ? "Scenario complete" : "Next step"}
          </button>
        </div>
      </section>
    </div>
  );
}
