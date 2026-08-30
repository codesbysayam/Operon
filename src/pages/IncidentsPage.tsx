import React, { useState } from 'react';
import {
  AlertOctagon,
  Activity,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Play,
  ShieldAlert,
  Zap,
  Layers,
  Cpu,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Incident } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface IncidentsPageProps {
  incidents: Incident[];
  onResolveIncident: (id: string) => void;
  onSimulateChaos: (type: 'latency' | 'agent_crash' | 'policy_conflict' | 'sla_breach') => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onResolveIncident,
  onSimulateChaos,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    incidents[0]?.id || ''
  );
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChaosModalOpen, setIsChaosModalOpen] = useState(false);

  const selectedIncident =
    incidents.find((inc) => inc.id === selectedIncidentId) || incidents[0];

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSev =
      filterSeverity === 'all' || inc.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchesSearch =
      inc.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                Incident Command Center & Resiliency
                {activeIncidentsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                    {activeIncidentsCount} ACTIVE
                  </span>
                )}
              </h1>
              <p className="text-xs text-white/50">
                Automated multi-agent anomaly detection, event correlation chains, and safe failure containment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsChaosModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/5"
          >
            <Flame className="w-4 h-4 text-pink-400" />
            Chaos Simulation Engine
          </button>
        </div>
      </div>

      {/* Resilience Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>MTTD (Mean Time to Detect)</span>
            <Activity className="w-3.5 h-3.5 text-[#22D3A7]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">1.2s</div>
          <div className="text-[11px] text-[#22D3A7] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sub-second sentry telemetry
          </div>
        </div>

        <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>Safe Degradation Rate</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#FFB000]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">100%</div>
          <div className="text-[11px] text-[#FFB000] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero unvetted mutations
          </div>
        </div>

        <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>Recovery Sentry Restarts</span>
            <RefreshCw className="w-3.5 h-3.5 text-[#5EA0FF]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">14</div>
          <div className="text-[11px] text-white/50 mt-1">
            Auto-healed worker nodes
          </div>
        </div>

        <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>Circuit Breaker Status</span>
            <Zap className="w-3.5 h-3.5 text-[#22D3A7]" />
          </div>
          <div className="text-2xl font-bold text-[#22D3A7] font-mono">HEALTHY</div>
          <div className="text-[11px] text-white/50 mt-1">
            All 8 agents operational
          </div>
        </div>
      </div>

      {/* Main Two-Column Incident Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incidents List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search incident number, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0E1015] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FFB000]/50"
              />
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#0E1015] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[#FFB000]/50"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>
          </div>

          {/* Incidents Card Stack */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredIncidents.map((inc) => {
              const isSelected = inc.id === selectedIncident?.id;
              const isResolved = inc.status === 'RESOLVED';

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#141720] border-[#FFB000]/40 shadow-lg shadow-[#FFB000]/5'
                      : 'bg-[#0E1015] border-white/[0.08] hover:border-white/[0.16] hover:bg-[#12141A]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {inc.incidentNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          inc.severity === 'HIGH'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : inc.severity === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isResolved
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-medium text-white/90 mt-2 line-clamp-1">
                    {inc.title}
                  </h3>

                  <p className="text-[11px] text-white/50 mt-1 line-clamp-2">
                    {inc.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-white/40 mt-3 pt-2 border-t border-white/[0.05]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {inc.detectedAt}
                    </span>
                    <span>{inc.agents.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Event Correlation Chain (7 cols) */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-5 space-y-5">
              {/* Top Details & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">
                      {selectedIncident.incidentNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        selectedIncident.severity === 'HIGH'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {selectedIncident.severity} SEVERITY
                    </span>
                    <span className="text-xs text-white/40">
                      Detected at {selectedIncident.detectedAt}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-white mt-1">
                    {selectedIncident.title}
                  </h2>
                </div>

                {selectedIncident.status !== 'RESOLVED' ? (
                  <button
                    onClick={() => onResolveIncident(selectedIncident.id)}
                    className="px-3 py-1.5 bg-[#22D3A7]/10 hover:bg-[#22D3A7]/20 border border-[#22D3A7]/30 text-[#22D3A7] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                  </span>
                )}
              </div>

              {/* Context Summary */}
              <div className="bg-black/30 border border-white/[0.06] rounded-lg p-3 text-xs text-white/70 leading-relaxed">
                <span className="font-semibold text-white">Root Cause Summary: </span>
                {selectedIncident.summary}
              </div>

              {/* Affected Workflows and Agents */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#12141A] border border-white/[0.06] rounded-lg p-3">
                  <div className="text-white/40 text-[11px] mb-1">Affected Workflows</div>
                  <div className="font-medium text-white space-y-1">
                    {selectedIncident.affectedWorkflows.map((wf, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5EA0FF]" />
                        <span>{wf}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#12141A] border border-white/[0.06] rounded-lg p-3">
                  <div className="text-white/40 text-[11px] mb-1">Involved Agents</div>
                  <div className="font-medium text-white space-y-1">
                    {selectedIncident.agents.map((ag, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB000]" />
                        <span>{ag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event Correlation Chain Timeline */}
              <div>
                <h3 className="text-xs font-semibold text-white/80 mb-3 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#5EA0FF]" />
                  Event Correlation Chain (Microsecond Provenance)
                </h3>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
                  {selectedIncident.eventCorrelationChain.map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative pl-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] z-10 font-mono ${
                          ev.status === 'error'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : ev.status === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : ev.status === 'info'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="flex-1 bg-[#12141A] border border-white/[0.06] rounded-lg p-2.5">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-white">{ev.stage}</span>
                          <span className="font-mono text-[10px] text-white/40">
                            {ev.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60">{ev.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-8 text-center text-white/40 text-xs">
              Select an incident from the left to view the event correlation chain.
            </div>
          )}
        </div>
      </div>

      {/* Chaos Simulation Modal */}
      {isChaosModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1015] border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-pink-400" />
                <h2 className="text-base font-semibold text-white">
                  Chaos Engineering Simulator
                </h2>
              </div>
              <button
                onClick={() => setIsChaosModalOpen(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/60">
              Inject synthetic faults into the autonomous agent mesh to verify fault tolerance, automated recovery sentries, and zero-loss degradation.
            </p>

            <div className="space-y-2.5">
              <div
                onClick={() => {
                  onSimulateChaos('latency');
                  setIsChaosModalOpen(false);
                }}
                className="p-3 bg-[#141720] hover:bg-[#1A1E29] border border-white/[0.08] hover:border-purple-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Inject 4,500ms Vector DB Latency Spike
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    Tests timeout detection, exponential backoff retry, and local fallback.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>

              <div
                onClick={() => {
                  onSimulateChaos('agent_crash');
                  setIsChaosModalOpen(false);
                }}
                className="p-3 bg-[#141720] hover:bg-[#1A1E29] border border-white/[0.08] hover:border-purple-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-red-400" />
                    Simulate Intent Analyst Worker SIGSEGV
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    Triggers Recovery Sentry container cold restart within 1.2s.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>

              <div
                onClick={() => {
                  onSimulateChaos('policy_conflict');
                  setIsChaosModalOpen(false);
                }}
                className="p-3 bg-[#141720] hover:bg-[#1A1E29] border border-white/[0.08] hover:border-purple-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#FFB000]" />
                    Inject Conflicting Policy Rules
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    Evaluates Release Guardian conflict resolver and human escalation.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>

              <div
                onClick={() => {
                  onSimulateChaos('sla_breach');
                  setIsChaosModalOpen(false);
                }}
                className="p-3 bg-[#141720] hover:bg-[#1A1E29] border border-white/[0.08] hover:border-purple-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Trigger Urgent SLA Breach & Manager Escalation
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    Elevates Case #CS-2041 priority to CRITICAL with real-time alerts.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsChaosModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
