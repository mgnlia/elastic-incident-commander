# DevOps Incident Commander — Locked Specification

**Status**: 🔒 LOCKED (CSO GO received)
**Last Updated**: Phase 1 — Spec Lock
**Hackathon**: Elasticsearch Agent Builder Hackathon (DevPost)
**Deadline**: February 27, 2026 @ 1:00 PM EST

---

## 1. Product Definition

**One-liner**: A multi-agent system that automates production incident response from detection through postmortem using Elastic Agent Builder.

**Problem**: When a production incident fires at 3 AM, teams scramble across dashboards, logs, and Slack channels. Triage takes 15+ minutes, root cause takes hours, and communication is ad-hoc. DevOps Incident Commander replaces this chaos with coordinated AI agents that each handle one phase of the incident lifecycle.

**Target User**: DevOps/SRE teams using Elastic Observability.

## 2. Agent Architecture

### 2.1 Core System (4 Agents + 1 Orchestrator)

#### Incident Commander (Orchestrator)
- **System Prompt**: "You are the Incident Commander. When an alert arrives, classify its severity (P1-P4), identify the affected service, and route to the appropriate specialist agent. For P1/P2, escalate immediately. Always maintain a running incident timeline."
- **Tools**: `severity_classifier` (ES|QL), `escalation_workflow` (Workflow)
- **Behavior**: Receives raw alerts → classifies → dispatches to Triage → monitors progress → triggers Communication for updates

#### Triage Agent
- **System Prompt**: "You are the Triage specialist. Given an incident, correlate related alerts from the last 30 minutes, identify all affected services using dependency mapping, and assign an initial priority score. Output a structured triage report."
- **Tools**: `alert_correlator` (ES|QL), `service_dependency` (ES|QL), `logs_search` (Index Search)
- **Behavior**: Correlates alerts → maps blast radius → produces triage report → hands off to Diagnosis

#### Diagnosis Agent
- **System Prompt**: "You are the Root Cause Analyst. Given a triage report, deep-dive into logs, metrics, and traces to identify the root cause. Look for error spikes, resource exhaustion, deployment correlations, and dependency failures. Output a root cause analysis with confidence level."
- **Tools**: `log_analyzer` (ES|QL), `metric_anomaly` (ES|QL), `trace_correlator` (ES|QL), `apm_search` (Index Search)
- **Behavior**: Analyzes logs → checks metrics → traces requests → identifies root cause → recommends remediation

#### Remediation Agent
- **System Prompt**: "You are the Remediation specialist. Given a root cause analysis, execute the appropriate remediation playbook. Available actions: restart pods, scale services, rollback deployments, toggle feature flags. Always verify the fix after execution."
- **Tools**: `pod_restart` (Workflow), `scale_service` (Workflow), `fix_verifier` (ES|QL)
- **Behavior**: Matches root cause to playbook → executes → verifies fix → reports outcome

#### Communication Agent
- **System Prompt**: "You are the Incident Communication specialist. Generate clear, non-technical status updates for stakeholders. Create incident timelines, status page updates, and post-incident summaries. Tone should be calm, factual, and actionable."
- **Tools**: `incident_timeline` (ES|QL), `slack_notify` (Workflow), `postmortem_generate` (Workflow)
- **Behavior**: Generates status updates → sends notifications → produces postmortem draft

### 2.2 Fallback System (2 Agents — MVP)

If time/complexity constrains the 4-agent build:

#### Triage+Diagnosis Agent (Combined)
- Merges Triage + Diagnosis into one agent with all their tools
- Handles: alert correlation, service mapping, log analysis, root cause identification

#### Remediation+Comms Agent (Combined)
- Merges Remediation + Communication into one agent
- Handles: playbook execution, fix verification, status updates, postmortems

## 3. ES|QL Tool Specifications

### 3.1 severity_classifier
```esql
FROM logs-*
| WHERE @timestamp > NOW() - 5 minutes
  AND service.name == ?service_name
  AND log.level IN ("error", "critical", "fatal")
| STATS error_count = COUNT(*), 
        unique_errors = COUNT_DISTINCT(error.message),
        affected_hosts = COUNT_DISTINCT(host.name)
| EVAL severity = CASE(
    error_count > 100 AND affected_hosts > 3, "P1",
    error_count > 50 OR affected_hosts > 1, "P2",
    error_count > 10, "P3",
    "P4"
  )
```
**Parameters**: `service_name` (string) — The service to classify

### 3.2 alert_correlator
```esql
FROM .alerts-*
| WHERE @timestamp > NOW() - 30 minutes
  AND kibana.alert.status == "active"
| STATS alert_count = COUNT(*),
        services = VALUES(service.name),
        rule_names = VALUES(kibana.alert.rule.name)
  BY kibana.alert.rule.category
| SORT alert_count DESC
| LIMIT 20
```
**Parameters**: None (time-windowed scan)

### 3.3 service_dependency
```esql
FROM traces-apm*
| WHERE @timestamp > NOW() - 15 minutes
  AND service.name == ?service_name
| STATS call_count = COUNT(*),
        error_rate = AVG(CASE(event.outcome == "failure", 1, 0)),
        avg_duration = AVG(transaction.duration.us)
  BY service.target.name
| WHERE error_rate > 0.1 OR avg_duration > 5000000
| SORT error_rate DESC
```
**Parameters**: `service_name` (string)

### 3.4 log_analyzer
```esql
FROM logs-*
| WHERE @timestamp > NOW() - ?time_window
  AND service.name == ?service_name
  AND log.level IN ("error", "warn", "critical")
| STATS count = COUNT(*), 
        first_seen = MIN(@timestamp),
        last_seen = MAX(@timestamp)
  BY error.message
| SORT count DESC
| LIMIT 10
```
**Parameters**: `service_name` (string), `time_window` (string, e.g. "1 hour")

### 3.5 metric_anomaly
```esql
FROM metrics-*
| WHERE @timestamp > NOW() - 30 minutes
  AND service.name == ?service_name
| STATS avg_cpu = AVG(system.cpu.total.pct),
        max_cpu = MAX(system.cpu.total.pct),
        avg_memory = AVG(system.memory.used.pct),
        max_memory = MAX(system.memory.used.pct)
  BY host.name
| WHERE max_cpu > 0.9 OR max_memory > 0.9
| SORT max_cpu DESC
```
**Parameters**: `service_name` (string)

### 3.6 trace_correlator
```esql
FROM traces-apm*
| WHERE @timestamp > NOW() - 15 minutes
  AND trace.id == ?trace_id
| SORT @timestamp ASC
| KEEP @timestamp, service.name, transaction.name, transaction.duration.us, event.outcome, span.name
| LIMIT 50
```
**Parameters**: `trace_id` (string)

### 3.7 incident_timeline
```esql
FROM logs-*,.alerts-*
| WHERE @timestamp > ?incident_start
  AND (@timestamp < ?incident_end OR ?incident_end == "now")
  AND service.name IN (?affected_services)
| SORT @timestamp ASC
| KEEP @timestamp, service.name, log.level, message, kibana.alert.rule.name
| LIMIT 100
```
**Parameters**: `incident_start` (string), `incident_end` (string), `affected_services` (string array)

### 3.8 fix_verifier
```esql
FROM logs-*
| WHERE @timestamp > NOW() - 5 minutes
  AND service.name == ?service_name
  AND log.level IN ("error", "critical", "fatal")
| STATS error_count = COUNT(*),
        unique_errors = COUNT_DISTINCT(error.message)
| EVAL status = CASE(
    error_count == 0, "RESOLVED",
    error_count < 5, "IMPROVING",
    "STILL_FAILING"
  )
```
**Parameters**: `service_name` (string)

## 4. Workflow Specifications

### 4.1 escalation.yaml
```yaml
triggers:
  - type: manual
steps:
  - id: check_severity
    type: if
    condition: "{{severity}} in ['P1', 'P2']"
    then:
      - id: page_oncall
        type: action
        action_type: webhook
        params:
          url: "{{pagerduty_webhook}}"
          method: POST
          body:
            severity: "{{severity}}"
            service: "{{service_name}}"
            summary: "{{incident_summary}}"
  - id: log_escalation
    type: action
    action_type: elasticsearch
    params:
      index: incidents-log
      body:
        "@timestamp": "{{now}}"
        action: escalation
        severity: "{{severity}}"
        service: "{{service_name}}"
```

### 4.2 pod_restart.yaml
```yaml
triggers:
  - type: manual
steps:
  - id: log_action
    type: action
    action_type: elasticsearch
    params:
      index: incidents-remediation
      body:
        "@timestamp": "{{now}}"
        action: pod_restart
        service: "{{service_name}}"
        namespace: "{{namespace}}"
        status: initiated
  - id: execute_restart
    type: action
    action_type: webhook
    params:
      url: "{{k8s_api}}/namespaces/{{namespace}}/pods/{{pod_name}}"
      method: DELETE
  - id: wait_recovery
    type: wait
    duration: 30s
  - id: verify
    type: action
    action_type: elasticsearch
    params:
      index: incidents-remediation
      body:
        "@timestamp": "{{now}}"
        action: pod_restart
        service: "{{service_name}}"
        status: completed
```

### 4.3 slack_notify.yaml
```yaml
triggers:
  - type: manual
steps:
  - id: send_update
    type: action
    action_type: webhook
    params:
      url: "{{slack_webhook}}"
      method: POST
      body:
        text: |
          🚨 *Incident Update — {{severity}}*
          *Service*: {{service_name}}
          *Status*: {{status}}
          *Summary*: {{summary}}
          *Time*: {{now}}
  - id: log_notification
    type: action
    action_type: elasticsearch
    params:
      index: incidents-notifications
      body:
        "@timestamp": "{{now}}"
        channel: slack
        severity: "{{severity}}"
        service: "{{service_name}}"
```

## 5. Data Model

### Indices Required
| Index Pattern | Purpose | Source |
|--------------|---------|--------|
| `logs-*` | Application logs | Elastic Agent / Filebeat |
| `metrics-*` | System & app metrics | Metricbeat |
| `traces-apm*` | Distributed traces | APM Server |
| `.alerts-*` | Kibana alerting | Rule engine |
| `incidents-log` | Incident event log | Our workflows |
| `incidents-remediation` | Remediation actions | Our workflows |
| `incidents-notifications` | Notification log | Our workflows |

### Seed Data Strategy
Generate realistic incident data for 3 demo scenarios:
1. **CPU Spike** — Gradual CPU increase → threshold breach → cascading errors
2. **Memory Leak** — Slow memory growth → OOM kills → service restarts
3. **Cascading Failure** — Upstream dependency timeout → retry storms → circuit breaker trips

## 6. Demo Scenarios

### Scenario 1: CPU Spike (Primary Demo — 3 minutes)
1. Alert fires: "High CPU on payment-service" (P2)
2. Commander classifies → routes to Triage
3. Triage correlates: 3 related alerts, 2 services affected
4. Diagnosis finds: deployment 30min ago introduced inefficient query
5. Remediation: scales service + prepares rollback
6. Communication: sends Slack update + generates timeline

### Scenario 2: Memory Leak (Backup Demo)
1. Alert: "Memory usage critical on user-service"
2. Full pipeline: triage → diagnose (memory growth pattern) → remediate (restart + flag) → communicate

### Scenario 3: Cascading Failure (Stretch Demo)
1. Multiple alerts across services
2. Shows multi-agent coordination at scale

## 7. Judging Criteria Alignment

| Criterion | Weight | Our Coverage |
|-----------|--------|-------------|
| Effective use of Agent Builder | 30% | 5 agents, custom prompts, tool assignment, agent-to-agent routing |
| Creative & practical use case | 20% | Real-world DevOps — every SRE team needs this |
| Technical implementation | 20% | ES|QL tools (8), Workflows (5), Index Search (2), A2A, API-driven setup |
| Demo & documentation | 20% | 3-min video, live dashboard, comprehensive docs |
| Social sharing | 10% | X post with demo GIF, thread explaining architecture |

## 8. Non-Goals (Scope Fence)
- ❌ No real Kubernetes integration (simulated via seed data)
- ❌ No real PagerDuty/Slack (webhook stubs)
- ❌ No custom ML models (use Elastic's built-in anomaly detection)
- ❌ No multi-tenancy
- ❌ No auth on demo dashboard
