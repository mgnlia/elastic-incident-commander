# Milestone Timeline — DevOps Incident Commander

**Hackathon Deadline**: February 27, 2026 @ 1:00 PM EST
**Total Build Time**: ~72 hours
**Team**: AI Office (Sage research, Dev build, Scout coordination)

---

## Phase 1: Spec Lock + Scaffold ✅ (Current)
**Duration**: 4-6 hours
**Status**: IN PROGRESS

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Lock specification document | ✅ Done | Sage | `docs/SPEC.md` |
| Architecture document | ✅ Done | Sage | `docs/ARCHITECTURE.md` |
| Milestone timeline | ✅ Done | Sage | This document |
| Create GitHub repo | 🔄 In Progress | Sage | |
| Project scaffold (directory structure) | 🔄 In Progress | Sage | |
| Pre-write all 8 ES|QL tool configs | 🔄 Next | Sage | JSON configs ready for API |
| Pre-write all 5 workflow YAMLs | 🔄 Next | Sage | |
| Pre-write all 5 agent configs | 🔄 Next | Sage | |

**Checkpoint 1 Deliverable**: Repo URL + architecture + this timeline → Henry

---

## Phase 2: Bootstrap + Core Agents
**Duration**: 12-16 hours
**Depends on**: Elastic Cloud trial activated

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Elastic Cloud 14-day trial setup | ⬜ | Dev | CRITICAL PATH — do first |
| LLM connector configuration | ⬜ | Dev | Azure OpenAI or Bedrock |
| `setup/create_tools.py` — register all tools | ⬜ | Dev | 8 ES|QL + 2 Index + 5 Workflow |
| `setup/create_agents.py` — register all agents | ⬜ | Dev | 5 agents (or 2 fallback) |
| `setup/seed_data.py` — populate indices | ⬜ | Dev | 3 scenarios worth of data |
| `setup/bootstrap.py` — one-click orchestrator | ⬜ | Dev | Ties it all together |
| Smoke test: single agent chat works | ⬜ | Dev | Triage agent + 1 ES|QL tool |
| Smoke test: multi-agent routing works | ⬜ | Dev | Commander → Triage handoff |

**Checkpoint 2 Deliverable**: Working agents responding to chat queries

**⚠️ Risk Gate**: If Elastic Cloud trial has issues, pivot to 2-agent fallback immediately

---

## Phase 3: Runnable Workflow + Integration
**Duration**: 12-16 hours

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Workflow deployment (all 5 YAMLs) | ⬜ | Dev | |
| Workflow tools assigned to agents | ⬜ | Dev | |
| End-to-end scenario 1 (CPU Spike) | ⬜ | Dev | Full pipeline test |
| End-to-end scenario 2 (Memory Leak) | ⬜ | Dev | Backup demo |
| Agent-to-agent communication working | ⬜ | Dev | Via Commander routing |
| Fix any ES|QL query issues | ⬜ | Dev | Expect 2-3 iterations |

**Checkpoint 3 Deliverable**: Full incident flow working end-to-end

---

## Phase 4: Demo Dashboard + Deploy
**Duration**: 8-12 hours

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Next.js dashboard scaffold | ⬜ | Dev | |
| Agent flow visualization component | ⬜ | Dev | Shows active agent |
| Live chat panel (streaming) | ⬜ | Dev | Uses streaming API |
| Incident timeline component | ⬜ | Dev | |
| Scenario trigger buttons | ⬜ | Dev | CPU Spike, Mem Leak |
| Vercel deployment | ⬜ | Dev | `vercel deploy --prod` |
| Dashboard smoke test | ⬜ | Dev | |

**Checkpoint 4 Deliverable**: Live Vercel URL with working demo

---

## Phase 5: Submission Assets
**Duration**: 4-6 hours

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Demo video recording (3 min max) | ⬜ | Dev/Sage | Screen recording of Scenario 1 |
| Demo script document | ⬜ | Sage | `docs/DEMO_SCRIPT.md` |
| DevPost submission text | ⬜ | Sage | `submission/devpost_text.md` |
| Screenshots (4-6) | ⬜ | Dev | Dashboard + Kibana + agents |
| README polish | ⬜ | Sage | Final review |
| DevPost form submission | ⬜ | Scout | Before 1:00 PM EST |

**Checkpoint 5 Deliverable**: DevPost submission live

---

## Phase 6: Social Sharing Package
**Duration**: 2-3 hours (Day 2 — not last minute)

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Draft X post (main) | ⬜ | Sage | Architecture diagram + demo GIF |
| Draft X thread (5 tweets) | ⬜ | Sage | Technical deep-dive |
| Create demo GIF (15-30 sec) | ⬜ | Dev | Key moment from demo |
| Post to X | ⬜ | Scout | Tag @elastic @devaboraham |
| DevPost social link added | ⬜ | Scout | Paste tweet URL |

**Checkpoint 6 Deliverable**: Tweet posted, URL in DevPost

---

## Decision Gates

### Gate 1: Trial Activation (Phase 2 start)
- **IF** trial works → proceed with 4-agent core
- **IF** trial blocked → use existing Elastic Cloud instance or pivot

### Gate 2: Multi-Agent Routing (Phase 2 end)
- **IF** Commander→Triage→Diagnosis routing works → continue 4-agent
- **IF** routing fails → drop to 2-agent fallback, redirect time to polish

### Gate 3: Workflow Integration (Phase 3 mid)
- **IF** workflows trigger from agents → full feature set
- **IF** workflows fail → simulate with ES|QL logging, document as "designed for"

### Gate 4: Demo Quality (Phase 4 end)
- **IF** dashboard + demo impressive → record full 3-min video
- **IF** dashboard rough → record Kibana-native demo instead (still valid)

---

## Time Budget Summary

| Phase | Hours | Cumulative |
|-------|-------|-----------|
| 1. Spec Lock + Scaffold | 6 | 6 |
| 2. Bootstrap + Core Agents | 16 | 22 |
| 3. Runnable Workflow | 16 | 38 |
| 4. Demo Dashboard | 12 | 50 |
| 5. Submission Assets | 6 | 56 |
| 6. Social Sharing | 3 | 59 |
| **Buffer** | **13** | **72** |

13-hour buffer for debugging, ES|QL iteration, and unexpected issues.
