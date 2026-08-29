import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle, Info, Zap } from 'lucide-react';

interface ActivityPageProps {
  logs: AuditLogEntry[];
}

export const ActivityPage: React.FC<ActivityPageProps> = ({ logs }) => {
  const [filterMode, setFilterMode] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterMode !== 'all' && log.mode !== filterMode) return false;
    return true;
  });

  return (
    <div
      id="activity-page"
      className="flex-1 overflow-y-auto px-6 py-6 text-white space-y-6 select-none font-sans max-w-[1600px] mx-auto w-full"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-white/[0.04] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="meta-label text-[#FFB000]">IMMUTABLE AUDIT TRAIL</span>
            <span className="text-white/20">•</span>
            <span className="meta-label">Compliance Stream</span>
          </div>
          <h1 className="page-title leading-tight">Audit Timeline</h1>
          <p className="text-xs text-white/50 mt-1">
            Complete cryptographic record of agent actions, human approvals, and Release Guardian policy execution.
          </p>
        </div>

        {/* Filter Capsule */}
        <div className="flex items-center space-x-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08] text-xs font-medium shrink-0">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm font-semibold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            All Modes
          </button>
          <button
            onClick={() => setFilterMode('demo')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              filterMode === 'demo'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm font-semibold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Demo
          </button>
          <button
            onClick={() => setFilterMode('sandbox')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              filterMode === 'sandbox'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm font-semibold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Sandbox
          </button>
          <button
            onClick={() => setFilterMode('live')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              filterMode === 'live'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm font-semibold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Live
          </button>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all gap-4"
          >
            <div className="flex items-start space-x-3.5">
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                  log.status === 'success'
                    ? 'bg-emerald-500/15 text-[#22D3A7] border-emerald-500/30'
                    : log.status === 'warning'
                    ? 'bg-amber-500/15 text-[#FFB000] border-amber-500/30'
                    : 'bg-blue-500/15 text-[#5EA0FF] border-blue-500/30'
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-semibold text-white">{log.event}</h4>
                  <span className="text-[10px] font-mono uppercase bg-white/[0.06] text-white/60 px-2 py-0.5 rounded border border-white/[0.08]">
                    ACTOR: {log.actor}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                      log.mode === 'sandbox'
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : log.mode === 'live'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {log.mode}
                  </span>
                </div>
                <p className="text-xs text-white/60 font-mono leading-relaxed">{log.details}</p>
              </div>
            </div>

            <time className="font-mono text-[11px] text-white/40 font-medium shrink-0">{log.timestamp}</time>
          </div>
        ))}
      </div>
    </div>
  );
};
