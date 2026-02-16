# Devpost Submission Draft — DevOps Incident Commander

> **Word count target: ~400 words.** Paste directly into the Devpost description field.

## What it does

DevOps Incident Commander is a five-agent incident response system built on Elastic Agent Builder. When a production alert fires, the Incident Commander agent classifies severity and routes the incident through four specialist agents — Triage, Diagnosis, Remediation, and Communication — to resolve incidents end-to-end.

Each agent has a clear boundary. Triage correlates alerts and maps blast radius across services. Diagnosis identifies root cause using ES|QL + search over logs, metrics, and traces. Remediation executes the right playbook (for example scale service or restart pods) and verifies outcomes. Communication generates stakeholder updates, incident timeline, and postmortem artifacts.

## How we built it

The environment is provisioned programmatically. A single command (`uv run setup/bootstrap.py`) creates indices, registers tools, deploys workflows, and creates all agents. A companion seed script populates realistic demo incidents (CPU spike, memory leak, cascading dependency failure) with observability data.

The project includes a public Next.js dashboard deployed on Vercel for judges:

- Home: orchestration overview
- Architecture: pipeline and data flow
- Demo: step-by-step scenario walkthrough

## Elastic Agent Builder features used

- **ES|QL tools (8):** severity classification, alert correlation, dependency analysis, log analysis, metric anomaly detection, trace correlation, timeline generation, fix verification.
- **Index search tools (2):** `logs-*` and `traces-apm*` exploration.
- **Workflow tools (5):** escalation, pod restart, service scaling, Slack notify, postmortem generation.
- **Multi-agent routing:** Commander coordinates specialist agents for full incident lifecycle management.

## What we liked

1. Tool composability: ES|QL tools as atomic capabilities made agent decisions transparent and reusable.
2. Workflow integration: the same agent can reason, trigger an action, and validate the result.

## Challenges

1. Tool-binding naming must be exact (especially workflow tool names).
2. Maintaining context fidelity across agent handoffs required strict structured outputs.

## Links

- Live dashboard: https://elastic-incident-commander.vercel.app
- Repository: https://github.com/mgnlia/elastic-incident-commander
- Demo video: `[VIDEO_URL_PLACEHOLDER]`
- Social post: `[SOCIAL_POST_PLACEHOLDER]`
