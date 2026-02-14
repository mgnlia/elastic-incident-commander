# Architecture Document — DevOps Incident Commander

## System Overview

```
                          ┌──────────────────────┐
                          │   Elastic Cloud       │
                          │   (14-day trial)      │
                          ├──────────────────────┤
                          │                      │
  Alert fires ──────────► │  INCIDENT COMMANDER  │ ◄── Kibana Chat UI
  (Elastic Rules)         │  (Orchestrator Agent) │     or A2A / API
                          │                      │
                          └──────┬───────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼──┐  ┌─────▼──┐  ┌─────▼──────┐
              │ TRIAGE │  │DIAGNOSE│  │ REMEDIATE  │
              │ Agent  │  │ Agent  │  │ Agent      │
              └───┬────┘  └───┬────┘  └──┬────┬────┘
                  │           │          │    │
              ┌───▼────┐  ┌──▼─────┐ ┌──▼──┐ │
              │ES|QL   │  │ES|QL   │ │Work-│ │
              │Tools   │  │Tools   │ │flows│ │
              │+ Index │  │+ Index │ └─────┘ │
              │Search  │  │Search  │         │
              └────────┘  └────────┘    ┌────▼──────┐
                                        │COMMUNICATE│
                                        │  Agent    │
                                        └──┬────┬───┘
                                           │    │
                                       ┌───▼┐ ┌▼────┐
                                       │ES|Q│ │Work- │
                                       │L   │ │flows │
                                       └────┘ └─────┘
```

## Agent Communication Flow

### Primary Flow (4-Agent)
```
1. Alert → Commander.classify(alert)
2. Commander → Triage.correlate(alert, service)
3. Triage.report → Commander.route()
4. Commander → Diagnosis.analyze(triage_report)
5. Diagnosis.root_cause → Commander.route()
6. Commander → Remediation.execute(root_cause)
7. Commander → Communication.update(incident_state)
8. Remediation.result → Commander.verify()
9. Communication → [Slack, Status Page, Postmortem]
```

### Fallback Flow (2-Agent MVP)
```
1. Alert → TriageDiagnosis.analyze(alert)
2. TriageDiagnosis.root_cause → RemediationComms.execute(root_cause)
3. RemediationComms → [Fix + Notify]
```

## Tool Architecture

### ES|QL Tools (8 total)
Each ES|QL tool is a pre-written, parameterized query registered via the Kibana API:

```
POST /api/agent_builder/tools
{
  "name": "severity_classifier",
  "type": "esql",
  "description": "Classify incident severity based on error rates",
  "query": "FROM logs-* | WHERE ...",
  "parameters": [
    {"name": "service_name", "type": "string", "description": "Service to check"}
  ]
}
```

### Index Search Tools (2 total)
Scoped searches that let agents dynamically query:
- `logs_search` — scoped to `logs-*` for free-text log exploration
- `apm_search` — scoped to `traces-apm*` for APM data

### Workflow Tools (5 total)
YAML-defined workflows that agents can trigger:
- `escalation` — Page on-call for P1/P2
- `pod_restart` — Restart a failing pod
- `scale_service` — Horizontal scale-up
- `slack_notify` — Send Slack status update
- `postmortem_generate` — Generate post-incident report

## Data Flow

```
                    Seed Data (setup/seed_data.py)
                              │
                    ┌─────────▼─────────┐
                    │  Elasticsearch     │
                    │  ├─ logs-*         │
                    │  ├─ metrics-*      │
                    │  ├─ traces-apm*    │
                    │  ├─ .alerts-*      │
                    │  ├─ incidents-*    │
                    │  └─ (seed data)    │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
        │ ES|QL     │  │ Index     │  │ Workflows │
        │ Queries   │  │ Searches  │  │ (YAML)    │
        └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Agent Builder    │
                    │  (Agents + Tools) │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
        │ Kibana    │  │ A2A       │  │ Demo      │
        │ Chat UI   │  │ Protocol  │  │ Dashboard │
        └───────────┘  └───────────┘  └───────────┘
```

## Programmatic Setup

All agents and tools are created programmatically (not via UI clicks) for reproducibility:

```python
# setup/bootstrap.py orchestrates:
1. create_indices()     # Create custom indices for incidents
2. seed_data()          # Populate realistic incident data
3. create_tools()       # Register all 15 tools via API
4. create_workflows()   # Deploy 5 YAML workflows
5. create_agents()      # Create 5 agents with tool assignments
6. run_smoke_test()     # Verify end-to-end flow
```

### Kibana API Endpoints Used
| Endpoint | Purpose |
|----------|---------|
| `POST /api/agent_builder/tools` | Create ES|QL/Index/Workflow tools |
| `POST /api/agent_builder/tools/{id}/_execute` | Test tool execution |
| `POST /api/agent_builder/agents` | Create agents with system prompts |
| `PUT /api/agent_builder/agents/{id}` | Update agent tool assignments |
| `POST /api/agent_builder/conversations` | Create conversation |
| `POST /api/agent_builder/conversations/{id}/messages` | Send chat message |
| `POST /api/agent_builder/conversations/{id}/messages/stream` | Streaming chat |

## Demo Dashboard (Vercel)

Next.js dashboard that visualizes the incident response flow:

```
┌─────────────────────────────────────────────────┐
│  DevOps Incident Commander — Live Demo          │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Trigger Incident ▼]  [CPU Spike | Mem Leak]   │
│                                                 │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ Agent Flow  │  │ Live Chat                │  │
│  │             │  │                          │  │
│  │ Commander ● │  │ > Alert: High CPU on     │  │
│  │   │         │  │   payment-service        │  │
│  │ Triage ●    │  │                          │  │
│  │   │         │  │ Commander: Classified P2  │  │
│  │ Diagnosis ○ │  │ Routing to Triage...     │  │
│  │   │         │  │                          │  │
│  │ Remedy ○    │  │ Triage: Found 3 related  │  │
│  │   │         │  │ alerts across 2 services │  │
│  │ Comms ○     │  │                          │  │
│  └─────────────┘  └──────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ Incident Timeline                        │   │
│  │ 14:32:01 Alert fired                     │   │
│  │ 14:32:05 Commander classified P2         │   │
│  │ 14:32:12 Triage: 3 alerts correlated     │   │
│  │ 14:32:28 Diagnosis: CPU query identified │   │
│  │ 14:32:45 Remediation: Scaling initiated  │   │
│  │ 14:33:01 Comms: Slack update sent        │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Security Considerations
- All API keys stored as environment variables
- Demo uses Elastic Cloud trial (auto-expires)
- No real production data — all synthetic
- Dashboard is read-only visualization
