# 🚨 DevOps Incident Commander

**Multi-agent production incident response powered by Elastic Agent Builder**

> When a production alert fires at 3 AM, five AI agents coordinate to triage, diagnose, remediate, and communicate — resolving incidents in minutes instead of hours.

[![Elastic Agent Builder](https://img.shields.io/badge/Elastic-Agent%20Builder-005571?style=flat&logo=elastic)](https://www.elastic.co)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Live Dashboard

Explore the interactive demo without any setup:

**https://elastic-incident-commander.vercel.app**

- [Home](https://elastic-incident-commander.vercel.app) — Orchestration overview + scenario cards
- [Architecture](https://elastic-incident-commander.vercel.app/architecture) — Agent pipeline + data flow
- [Demo](https://elastic-incident-commander.vercel.app/demo) — Step-through incident simulations

## 🎥 Demo Video

Watch the 3-minute walkthrough: `[VIDEO_URL_PLACEHOLDER]`

---

## 🏗️ Architecture

```
Alert → Incident Commander → Triage Agent → Diagnosis Agent → Remediation Agent
                                                                      ↓
                                                            Communication Agent
                                                            (Slack + Postmortem)
```

### 5 Specialized Agents

| Agent | Role | Tools |
|-------|------|-------|
| **Incident Commander** | Orchestrator — classifies severity, routes to specialists | `severity_classifier`, `escalation_workflow` |
| **Triage Agent** | Correlates alerts, maps blast radius | `alert_correlator`, `service_dependency`, `logs_search` |
| **Diagnosis Agent** | Root cause analysis via logs, metrics, traces | `log_analyzer`, `metric_anomaly`, `trace_correlator`, `apm_search` |
| **Remediation Agent** | Executes playbooks, verifies fixes | `pod_restart`, `scale_service`, `fix_verifier` |
| **Communication Agent** | Status updates, timelines, postmortems | `incident_timeline`, `slack_notify`, `postmortem_generate` |

### 15 Custom Tools
- **8 ES|QL tools** — Parameterized queries for real-time data analysis
- **2 Index Search tools** — Free-text search across logs and APM data
- **5 Workflow tools** — Automated remediation and notification pipelines

## 🚀 Quick Start

### Prerequisites
- [Elastic Cloud](https://cloud.elastic.co) account (14-day free trial)
- Python 3.11+ with [uv](https://docs.astral.sh/uv/)
- LLM connector configured in Kibana (Azure OpenAI, Bedrock, or OpenAI)

### 1. Clone & Configure

```bash
git clone https://github.com/mgnlia/elastic-incident-commander.git
cd elastic-incident-commander
cp .env.example .env
# Edit .env with your Elastic Cloud credentials
```

### 2. Bootstrap (One Command)

```bash
uv run setup/bootstrap.py
```

This creates all indices, tools, workflows, and agents programmatically.

### 3. Seed Demo Data

```bash
uv run setup/seed_data.py
```

Populates 3 realistic incident scenarios with ~500 documents.

### 4. Run Demo

Open Kibana → Agent Builder → Select "Incident Commander" → Send:

> "Alert: High CPU usage detected on payment-service. Current CPU at 95% across 3 hosts. Started 5 minutes ago."

Watch the Commander classify, triage, diagnose, remediate, and communicate.

## 📁 Project Structure

```
elastic-incident-commander/
├── agents/                    # Agent configurations (JSON)
│   ├── commander.json         # Incident Commander (orchestrator)
│   ├── triage.json           # Triage Agent
│   ├── diagnosis.json        # Diagnosis Agent
│   ├── remediation.json      # Remediation Agent
│   └── communication.json    # Communication Agent
├── tools/
│   └── esql/                 # ES|QL tool definitions (JSON)
│       ├── severity_classifier.json
│       ├── alert_correlator.json
│       ├── service_dependency.json
│       ├── log_analyzer.json
│       ├── metric_anomaly.json
│       ├── trace_correlator.json
│       ├── incident_timeline.json
│       └── fix_verifier.json
├── workflows/                 # Workflow definitions (YAML)
│   ├── escalation.yaml
│   ├── pod_restart.yaml
│   ├── scale_service.yaml
│   ├── slack_notify.yaml
│   └── postmortem_generate.yaml
├── setup/                     # Programmatic setup scripts
│   ├── bootstrap.py          # One-click full setup
│   └── seed_data.py          # Demo data generator
├── dashboard/                 # Next.js demo dashboard (Vercel-deployed)
│   ├── app/                  # Next.js app router pages
│   ├── components/           # UI components
│   └── package.json
├── docs/
│   ├── SPEC.md               # Locked specification
│   ├── ARCHITECTURE.md       # Architecture document
│   ├── SUBMISSION_LOCK.md    # Submission lock packet
│   └── MILESTONES.md         # Build timeline
├── pyproject.toml
├── .env.example
└── README.md
```

## 🎯 Demo Scenarios

### Scenario 1: CPU Spike (Primary — 3 min)
Payment service CPU hits 95% → Commander classifies P2 → Triage finds 3 correlated alerts → Diagnosis identifies inefficient query from recent deployment → Remediation scales service → Communication sends Slack update

### Scenario 2: Memory Leak
User service memory grows to 97% → OOM kills detected → Pod restarts triggered → Memory pattern flagged for code review

### Scenario 3: Cascading Failure
Inventory DB connection refused → Order service timeouts → Gateway 503s → Circuit breakers trip → Multi-service coordinated response

## 📊 Judging Criteria

| Criterion | Weight | Our Approach |
|-----------|--------|-------------|
| Effective use of Agent Builder | 30% | 5 agents, 15 tools (ES\|QL + Index + Workflow), agent-to-agent routing |
| Creative & practical use case | 20% | Every SRE team's 3 AM nightmare — solved |
| Technical implementation | 20% | Programmatic setup, parameterized queries, automated workflows |
| Demo & documentation | 20% | Live dashboard, 3-min video, comprehensive docs |
| Social sharing | 10% | Architecture diagram + demo GIF on X |

## 📢 Share

Share your experience with Incident Commander:
- Tag [@elastic](https://twitter.com/elastic) on X with your project link

## 📝 License

MIT

---

Built for the [Elasticsearch Agent Builder Hackathon](https://elasticsearch.devpost.com) 🏆
