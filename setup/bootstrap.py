#!/usr/bin/env python3
"""
DevOps Incident Commander — One-Click Bootstrap
Sets up all agents, tools, workflows, and seed data on Elastic Cloud.

Usage:
    export ELASTIC_CLOUD_ID="your-cloud-id"
    export ELASTIC_API_KEY="your-api-key"
    export KIBANA_URL="https://your-deployment.kb.us-central1.gcp.cloud.es.io"
    uv run setup/bootstrap.py
"""

import json
import os
import sys
import time
from pathlib import Path

import httpx

# --- Configuration ---
KIBANA_URL = os.environ.get("KIBANA_URL", "").rstrip("/")
ELASTIC_API_KEY = os.environ.get("ELASTIC_API_KEY", "")
ELASTIC_CLOUD_ID = os.environ.get("ELASTIC_CLOUD_ID", "")
ES_URL = os.environ.get("ES_URL", "")  # Elasticsearch endpoint

HEADERS = {
    "kbn-xsrf": "true",
    "Content-Type": "application/json",
    "Authorization": f"ApiKey {ELASTIC_API_KEY}",
}

ES_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"ApiKey {ELASTIC_API_KEY}",
}

PROJECT_ROOT = Path(__file__).parent.parent


def check_env():
    """Verify required environment variables."""
    missing = []
    if not KIBANA_URL:
        missing.append("KIBANA_URL")
    if not ELASTIC_API_KEY:
        missing.append("ELASTIC_API_KEY")
    if missing:
        print(f"❌ Missing environment variables: {', '.join(missing)}")
        print("Set them and re-run: export KIBANA_URL=... ELASTIC_API_KEY=...")
        sys.exit(1)
    print(f"✅ Kibana URL: {KIBANA_URL}")
    print(f"✅ API Key: {ELASTIC_API_KEY[:8]}...")


def create_indices():
    """Create custom indices for incident tracking."""
    if not ES_URL:
        print("⚠️  ES_URL not set — skipping index creation (will be created on first write)")
        return

    indices = [
        "incidents-log",
        "incidents-remediation",
        "incidents-notifications",
        "incidents-postmortems",
    ]
    client = httpx.Client(timeout=30)
    for index in indices:
        resp = client.put(
            f"{ES_URL}/{index}",
            headers=ES_HEADERS,
            json={
                "settings": {"number_of_shards": 1, "number_of_replicas": 0},
            },
        )
        if resp.status_code in (200, 201):
            print(f"  ✅ Created index: {index}")
        elif resp.status_code == 400 and "already_exists" in resp.text:
            print(f"  ⏭️  Index exists: {index}")
        else:
            print(f"  ❌ Failed to create {index}: {resp.status_code} {resp.text[:200]}")


def create_tools():
    """Register all ES|QL and index search tools via Kibana API."""
    tools_dir = PROJECT_ROOT / "tools" / "esql"
    client = httpx.Client(timeout=30)
    created = []

    for tool_file in sorted(tools_dir.glob("*.json")):
        tool_config = json.loads(tool_file.read_text())
        print(f"  📦 Creating tool: {tool_config['name']}")

        resp = client.post(
            f"{KIBANA_URL}/api/agent_builder/tools",
            headers=HEADERS,
            json=tool_config,
        )

        if resp.status_code in (200, 201):
            result = resp.json()
            tool_id = result.get("id", tool_config["name"])
            created.append(tool_id)
            print(f"     ✅ Created: {tool_id}")
        elif resp.status_code == 409:
            print(f"     ⏭️  Already exists: {tool_config['name']}")
            created.append(tool_config["name"])
        else:
            print(f"     ❌ Failed: {resp.status_code} {resp.text[:200]}")

    # Create index search tools
    index_tools = [
        {
            "name": "logs_search",
            "type": "index",
            "description": "Free-text search across application logs. Use for exploring log entries that don't match structured ES|QL queries.",
            "index_pattern": "logs-*",
        },
        {
            "name": "apm_search",
            "type": "index",
            "description": "Search APM trace and transaction data. Use for finding specific requests, errors, or performance issues.",
            "index_pattern": "traces-apm*",
        },
    ]
    for tool_config in index_tools:
        print(f"  📦 Creating index tool: {tool_config['name']}")
        resp = client.post(
            f"{KIBANA_URL}/api/agent_builder/tools",
            headers=HEADERS,
            json=tool_config,
        )
        if resp.status_code in (200, 201):
            created.append(tool_config["name"])
            print(f"     ✅ Created: {tool_config['name']}")
        elif resp.status_code == 409:
            created.append(tool_config["name"])
            print(f"     ⏭️  Already exists: {tool_config['name']}")
        else:
            print(f"     ❌ Failed: {resp.status_code} {resp.text[:100]}")

    return created


def create_workflows():
    """Deploy workflow tools from YAML definitions."""
    workflows_dir = PROJECT_ROOT / "workflows"
    client = httpx.Client(timeout=30)
    created = []

    for wf_file in sorted(workflows_dir.glob("*.yaml")):
        wf_content = wf_file.read_text()
        wf_name = wf_file.stem
        print(f"  ⚡ Creating workflow: {wf_name}")

        # Register as workflow tool
        resp = client.post(
            f"{KIBANA_URL}/api/agent_builder/tools",
            headers=HEADERS,
            json={
                "name": f"{wf_name}_workflow",
                "type": "workflow",
                "description": f"Workflow tool: {wf_name}. Triggers the {wf_name} automation.",
                "workflow_definition": wf_content,
            },
        )

        if resp.status_code in (200, 201):
            created.append(f"{wf_name}_workflow")
            print(f"     ✅ Created: {wf_name}_workflow")
        elif resp.status_code == 409:
            created.append(f"{wf_name}_workflow")
            print(f"     ⏭️  Already exists: {wf_name}_workflow")
        else:
            print(f"     ❌ Failed: {resp.status_code} {resp.text[:100]}")

    return created


def validate_agent_tool_bindings(available_tools: list[str]) -> bool:
    """Fail fast if any agent references a tool that was not created/available."""
    agents_dir = PROJECT_ROOT / "agents"
    known = set(available_tools)
    ok = True

    for agent_file in sorted(agents_dir.glob("*.json")):
        agent_config = json.loads(agent_file.read_text())
        missing = [tool for tool in agent_config.get("tools", []) if tool not in known]
        if missing:
            ok = False
            print(
                f"  ❌ Invalid tool binding in {agent_file.name}: {', '.join(missing)}"
            )

    if ok:
        print("  ✅ Agent tool bindings validated")
    else:
        print("  ❌ Tool binding validation failed. Fix agent config or tool names and re-run.")

    return ok


def create_agents(tool_ids: list[str]):
    """Create all 5 agents with their tool assignments."""
    agents_dir = PROJECT_ROOT / "agents"
    client = httpx.Client(timeout=30)
    created = {}

    # Agent creation order matters — Commander references others
    agent_order = ["triage", "diagnosis", "remediation", "communication", "commander"]

    for agent_name in agent_order:
        agent_file = agents_dir / f"{agent_name}.json"
        if not agent_file.exists():
            print(f"  ❌ Agent config not found: {agent_file}")
            continue

        agent_config = json.loads(agent_file.read_text())
        print(f"  🤖 Creating agent: {agent_config['name']}")

        # Build the API payload
        payload = {
            "name": agent_config["name"],
            "description": agent_config["description"],
            "system_prompt": agent_config["system_prompt"],
            "tools": agent_config.get("tools", []),
        }

        # If commander, add sub-agent references
        if agent_name == "commander" and created:
            payload["sub_agents"] = list(created.values())

        resp = client.post(
            f"{KIBANA_URL}/api/agent_builder/agents",
            headers=HEADERS,
            json=payload,
        )

        if resp.status_code in (200, 201):
            result = resp.json()
            agent_id = result.get("id", agent_name)
            created[agent_name] = agent_id
            print(f"     ✅ Created: {agent_config['name']} (ID: {agent_id})")
        else:
            print(f"     ❌ Failed: {resp.status_code} {resp.text[:200]}")

    return created


def run_smoke_test(agents: dict):
    """Quick smoke test — send a message to the Commander agent."""
    if "commander" not in agents:
        print("  ⚠️  Commander agent not found — skipping smoke test")
        return False

    client = httpx.Client(timeout=60)
    commander_id = agents["commander"]

    # Create a conversation
    resp = client.post(
        f"{KIBANA_URL}/api/agent_builder/conversations",
        headers=HEADERS,
        json={"agent_id": commander_id, "title": "Smoke Test"},
    )

    if resp.status_code not in (200, 201):
        print(f"  ❌ Failed to create conversation: {resp.status_code}")
        return False

    conv_id = resp.json().get("id")

    # Send a test message
    resp = client.post(
        f"{KIBANA_URL}/api/agent_builder/conversations/{conv_id}/messages",
        headers=HEADERS,
        json={
            "message": "Alert: High CPU usage detected on payment-service. Current CPU at 95% across 3 hosts. Started 5 minutes ago."
        },
    )

    if resp.status_code in (200, 201):
        print(f"  ✅ Smoke test passed — Commander responded")
        result = resp.json()
        if "message" in result:
            preview = result["message"][:200]
            print(f"     Response preview: {preview}...")
        return True
    else:
        print(f"  ❌ Smoke test failed: {resp.status_code} {resp.text[:200]}")
        return False


def main():
    print("=" * 60)
    print("🚀 DevOps Incident Commander — Bootstrap")
    print("=" * 60)

    print("\n📋 Step 0: Check environment")
    check_env()

    print("\n📋 Step 1: Create indices")
    create_indices()

    print("\n📋 Step 2: Create ES|QL & Index tools")
    tool_ids = create_tools()
    print(f"   Total tools: {len(tool_ids)}")

    print("\n📋 Step 3: Create workflow tools")
    wf_ids = create_workflows()
    print(f"   Total workflows: {len(wf_ids)}")

    print("\n📋 Step 4: Validate agent tool bindings")
    if not validate_agent_tool_bindings(tool_ids + wf_ids):
        print("\n" + "=" * 60)
        print("❌ Bootstrap aborted due to invalid agent tool bindings.")
        print("=" * 60)
        sys.exit(1)

    print("\n📋 Step 5: Create agents")
    agents = create_agents(tool_ids + wf_ids)
    print(f"   Total agents: {len(agents)}")

    print("\n📋 Step 6: Smoke test")
    success = run_smoke_test(agents)

    print("\n" + "=" * 60)
    if success:
        print("✅ Bootstrap complete! All systems operational.")
    else:
        print("⚠️  Bootstrap complete with warnings. Check output above.")
    print("=" * 60)

    # Write agent IDs to file for dashboard use
    ids_file = PROJECT_ROOT / "setup" / "agent_ids.json"
    ids_file.write_text(json.dumps(agents, indent=2))
    print(f"\nAgent IDs saved to: {ids_file}")


if __name__ == "__main__":
    main()
