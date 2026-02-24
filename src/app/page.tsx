"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { IncidentCard } from "@/components/IncidentCard";
import { IncidentDetail } from "@/components/IncidentDetail";
import { MTTRWidget } from "@/components/MTTRWidget";
import { MOCK_INCIDENTS } from "@/lib/mockData";
import { Incident } from "@/lib/types";
import { Shield } from "lucide-react";

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [selectedId, setSelectedId] = useState<string>(MOCK_INCIDENTS[0].id);
  const [tick, setTick] = useState(0);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedIncident = incidents.find((i) => i.id === selectedId) ?? incidents[0];
  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const resolvedToday = incidents.filter((i) => i.status === "resolved").length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-elastic-darker">
      <Header activeCount={activeIncidents.length} resolvedToday={resolvedToday} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — incident list */}
        <aside className="w-80 xl:w-96 flex-shrink-0 border-r border-elastic-border flex flex-col overflow-hidden bg-elastic-darker">
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-elastic-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-200">Incidents</h2>
              <div className="flex items-center gap-1.5 text-xs text-elastic-green">
                <span className="w-1.5 h-1.5 rounded-full bg-elastic-green animate-pulse" />
                Live
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {["All", "Active", "Resolved"].map((f) => (
                <button
                  key={f}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-elastic-card border border-elastic-border text-slate-400 hover:text-white hover:border-elastic-blue/50 transition-all"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* MTTR Widget */}
          <div className="px-4 py-4 border-b border-elastic-border">
            <MTTRWidget />
          </div>

          {/* Incident list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                isSelected={selectedId === incident.id}
                onClick={() => setSelectedId(incident.id)}
              />
            ))}
          </div>
        </aside>

        {/* Main content — incident detail */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {selectedIncident ? (
            <IncidentDetail
              key={selectedIncident.id}
              incident={selectedIncident}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-elastic-blue/20 flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-elastic-blue" />
      </div>
      <h3 className="text-xl font-bold text-slate-200 mb-2">Select an Incident</h3>
      <p className="text-sm text-slate-500 max-w-xs">
        Choose an incident from the left panel to view agent activity, metrics, and remediation steps.
      </p>
    </div>
  );
}
