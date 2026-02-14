#!/usr/bin/env python3
"""
Seed realistic incident data into Elasticsearch for demo scenarios.

Generates 3 scenarios:
1. CPU Spike on payment-service (primary demo)
2. Memory Leak on user-service
3. Cascading Failure across multiple services

Usage:
    export ES_URL="https://your-deployment.es.us-central1.gcp.cloud.es.io"
    export ELASTIC_API_KEY="your-api-key"
    uv run setup/seed_data.py
"""

import json
import os
import random
import sys
from datetime import datetime, timedelta, timezone

import httpx

ES_URL = os.environ.get("ES_URL", "").rstrip("/")
ELASTIC_API_KEY = os.environ.get("ELASTIC_API_KEY", "")

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"ApiKey {ELASTIC_API_KEY}",
}

SERVICES = [
    "payment-service",
    "user-service",
    "order-service",
    "inventory-service",
    "gateway-service",
    "notification-service",
]

HOSTS = [
    "prod-node-01",
    "prod-node-02",
    "prod-node-03",
    "prod-node-04",
    "prod-node-05",
]


def bulk_index(client: httpx.Client, docs: list[dict]):
    """Bulk index documents into Elasticsearch."""
    body_lines = []
    for doc in docs:
        index = doc.pop("_index")
        body_lines.append(json.dumps({"index": {"_index": index}}))
        body_lines.append(json.dumps(doc))
    body = "\n".join(body_lines) + "\n"

    resp = client.post(
        f"{ES_URL}/_bulk",
        headers=HEADERS,
        content=body,
    )
    if resp.status_code in (200, 201):
        result = resp.json()
        errors = result.get("errors", False)
        items = len(result.get("items", []))
        if errors:
            print(f"    ⚠️  Bulk indexed {items} docs with some errors")
        else:
            print(f"    ✅ Bulk indexed {items} docs")
    else:
        print(f"    ❌ Bulk index failed: {resp.status_code} {resp.text[:200]}")


def generate_cpu_spike_scenario(base_time: datetime) -> list[dict]:
    """Scenario 1: CPU spike on payment-service."""
    docs = []

    # Normal logs before incident (t-60m to t-30m)
    for i in range(50):
        ts = base_time - timedelta(minutes=random.randint(30, 60))
        docs.append({
            "_index": "logs-app.payment",
            "@timestamp": ts.isoformat(),
            "service.name": "payment-service",
            "host.name": random.choice(HOSTS[:3]),
            "log.level": "info",
            "message": f"Payment processed successfully for order-{random.randint(1000, 9999)}",
        })

    # CPU metrics rising (t-30m to t-5m)
    for minute in range(30, 5, -1):
        ts = base_time - timedelta(minutes=minute)
        cpu_pct = min(0.5 + (30 - minute) * 0.018, 0.98)  # Gradual rise to 98%
        mem_pct = 0.45 + random.uniform(-0.05, 0.05)
        for host in HOSTS[:3]:
            docs.append({
                "_index": "metrics-system.cpu",
                "@timestamp": ts.isoformat(),
                "service.name": "payment-service",
                "host.name": host,
                "system.cpu.total.pct": round(cpu_pct + random.uniform(-0.02, 0.02), 3),
                "system.memory.used.pct": round(mem_pct, 3),
            })

    # Error logs during incident (t-20m to now)
    error_messages = [
        "Connection pool exhausted: max connections reached",
        "Request timeout after 30000ms processing payment",
        "Thread pool rejected execution: queue capacity exceeded",
        "Database query took 45000ms (threshold: 5000ms)",
        "Circuit breaker open for downstream inventory-service",
    ]
    for i in range(120):
        ts = base_time - timedelta(minutes=random.randint(0, 20))
        docs.append({
            "_index": "logs-app.payment",
            "@timestamp": ts.isoformat(),
            "service.name": "payment-service",
            "host.name": random.choice(HOSTS[:3]),
            "log.level": random.choice(["error", "error", "error", "critical"]),
            "message": random.choice(error_messages),
            "error.message": random.choice(error_messages),
        })

    # APM traces showing slow transactions
    for i in range(30):
        ts = base_time - timedelta(minutes=random.randint(0, 15))
        trace_id = f"trace-cpu-{i:04d}"
        duration = random.randint(15_000_000, 45_000_000)  # 15-45 seconds
        docs.append({
            "_index": "traces-apm-default",
            "@timestamp": ts.isoformat(),
            "service.name": "payment-service",
            "service.target.name": "inventory-service",
            "host.name": random.choice(HOSTS[:3]),
            "trace.id": trace_id,
            "transaction.name": "POST /api/payments",
            "transaction.duration.us": duration,
            "event.outcome": random.choice(["failure", "failure", "success"]),
            "span.name": "db.query",
        })

    # Alerts
    alert_rules = [
        ("High CPU Usage", "metrics"),
        ("Error Rate Spike", "logs"),
        ("Slow Transactions", "apm"),
    ]
    for rule_name, category in alert_rules:
        ts = base_time - timedelta(minutes=random.randint(5, 15))
        docs.append({
            "_index": ".alerts-observability.metrics",
            "@timestamp": ts.isoformat(),
            "kibana.alert.status": "active",
            "kibana.alert.rule.name": rule_name,
            "kibana.alert.rule.category": category,
            "service.name": "payment-service",
            "kibana.alert.severity": "critical",
        })

    return docs


def generate_memory_leak_scenario(base_time: datetime) -> list[dict]:
    """Scenario 2: Memory leak on user-service."""
    docs = []

    # Memory metrics rising over 2 hours
    for minute in range(120, 0, -1):
        ts = base_time - timedelta(minutes=minute)
        mem_pct = min(0.3 + minute * 0.005, 0.97)  # Gradual rise
        mem_pct = min(0.3 + (120 - minute) * 0.005, 0.97)
        cpu_pct = 0.3 + random.uniform(-0.05, 0.05)
        for host in HOSTS[1:3]:
            docs.append({
                "_index": "metrics-system.memory",
                "@timestamp": ts.isoformat(),
                "service.name": "user-service",
                "host.name": host,
                "system.cpu.total.pct": round(cpu_pct, 3),
                "system.memory.used.pct": round(mem_pct, 3),
            })

    # OOM kill logs
    for i in range(15):
        ts = base_time - timedelta(minutes=random.randint(0, 10))
        docs.append({
            "_index": "logs-app.user",
            "@timestamp": ts.isoformat(),
            "service.name": "user-service",
            "host.name": random.choice(HOSTS[1:3]),
            "log.level": "critical",
            "message": "OutOfMemoryError: Java heap space",
            "error.message": "OutOfMemoryError: Java heap space",
        })

    # Restart logs
    for i in range(5):
        ts = base_time - timedelta(minutes=random.randint(0, 8))
        docs.append({
            "_index": "logs-app.user",
            "@timestamp": ts.isoformat(),
            "service.name": "user-service",
            "host.name": random.choice(HOSTS[1:3]),
            "log.level": "warn",
            "message": "Container restarted due to OOMKilled",
            "error.message": "Container restarted due to OOMKilled",
        })

    # Alert
    docs.append({
        "_index": ".alerts-observability.metrics",
        "@timestamp": (base_time - timedelta(minutes=5)).isoformat(),
        "kibana.alert.status": "active",
        "kibana.alert.rule.name": "Memory Usage Critical",
        "kibana.alert.rule.category": "metrics",
        "service.name": "user-service",
        "kibana.alert.severity": "critical",
    })

    return docs


def generate_cascading_failure_scenario(base_time: datetime) -> list[dict]:
    """Scenario 3: Cascading failure across services."""
    docs = []

    # Gateway timeout → order-service errors → inventory-service down
    cascade_chain = [
        ("inventory-service", -15, "Connection refused: inventory-db:5432"),
        ("order-service", -12, "Upstream dependency timeout: inventory-service"),
        ("gateway-service", -10, "503 Service Unavailable: /api/orders"),
        ("payment-service", -8, "Retry storm detected: order-service circuit breaker tripped"),
    ]

    for service, offset, error_msg in cascade_chain:
        for i in range(30):
            ts = base_time - timedelta(minutes=abs(offset) - random.randint(0, 3))
            docs.append({
                "_index": f"logs-app.{service.split('-')[0]}",
                "@timestamp": ts.isoformat(),
                "service.name": service,
                "host.name": random.choice(HOSTS),
                "log.level": "error",
                "message": error_msg,
                "error.message": error_msg,
            })

        # Traces showing the cascade
        for i in range(10):
            ts = base_time - timedelta(minutes=abs(offset))
            docs.append({
                "_index": "traces-apm-default",
                "@timestamp": ts.isoformat(),
                "service.name": service,
                "service.target.name": cascade_chain[0][0] if service != "inventory-service" else "inventory-db",
                "trace.id": f"trace-cascade-{i:04d}",
                "transaction.name": f"GET /api/{service.split('-')[0]}",
                "transaction.duration.us": random.randint(25_000_000, 60_000_000),
                "event.outcome": "failure",
            })

        # Alert per service
        docs.append({
            "_index": ".alerts-observability.logs",
            "@timestamp": (base_time + timedelta(minutes=offset)).isoformat(),
            "kibana.alert.status": "active",
            "kibana.alert.rule.name": f"Error Rate Spike - {service}",
            "kibana.alert.rule.category": "logs",
            "service.name": service,
        })

    return docs


def main():
    if not ES_URL or not ELASTIC_API_KEY:
        print("❌ Set ES_URL and ELASTIC_API_KEY environment variables")
        sys.exit(1)

    client = httpx.Client(timeout=60)
    now = datetime.now(timezone.utc)

    print("=" * 60)
    print("🌱 Seeding Incident Data")
    print("=" * 60)

    print("\n📋 Scenario 1: CPU Spike (payment-service)")
    cpu_docs = generate_cpu_spike_scenario(now)
    print(f"   Generated {len(cpu_docs)} documents")
    bulk_index(client, cpu_docs)

    print("\n📋 Scenario 2: Memory Leak (user-service)")
    mem_docs = generate_memory_leak_scenario(now)
    print(f"   Generated {len(mem_docs)} documents")
    bulk_index(client, mem_docs)

    print("\n📋 Scenario 3: Cascading Failure (multi-service)")
    cascade_docs = generate_cascading_failure_scenario(now)
    print(f"   Generated {len(cascade_docs)} documents")
    bulk_index(client, cascade_docs)

    total = len(cpu_docs) + len(mem_docs) + len(cascade_docs)
    print(f"\n✅ Total documents seeded: {total}")
    print("=" * 60)


if __name__ == "__main__":
    main()
