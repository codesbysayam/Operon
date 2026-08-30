import React, { useState } from 'react';
import { AGENT_WORKFORCE } from '../data/agentsAndSkills';
import { AgentInfo } from '../types';
import { AgentDiagnosticsDrawer } from '../components/AgentDiagnosticsDrawer';
import { AgentThroughputSparkline } from '../components/AgentThroughputSparkline';
import { Bot, Sparkles, Activity, ShieldCheck, Power } from 'lucide-react';

interface AgentsPageProps {
  agents?: AgentInfo[];
  onToggleAgentStatus?: (agentId: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({
  agents = AGENT_WORKFORCE,
  onToggleAgentStatus,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);

  const agentsList = agents && agents.length > 0 ? agents : AGENT_WORKFORCE;
  const activeAgentsCount = agentsList.filter((a) => a.status === 'active').length;
  const totalAgentsCount = agentsList.length;

  return (
    <div
      id="agents-page"
      className="flex-1 overflow-y-auto px-6 py-6 text-white space-y-6 select-none font-sans max-w-[1600px] mx-auto w-full"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-white/[0.04] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="meta-label text-[#FFB000]">SPECIALIZED WORKFORCE</span>
            <span className="text-white/20">•</span>
            <span className="meta-label">Autonomous Operators</span>
          </div>
          <h1 className="page-title leading-tight">Agent Catalog</h1>
          <p className="text-xs text-white/50 mt-1">
            Inspect and manage the <span className="text-white font-medium">{totalAgentsCount}</span> specialized AI agents powering OPERON autonomous pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A7]" />
          <span className="text-white/80 font-medium">
            {activeAgentsCount} / {totalAgentsCount} Active Agents Operational
          </span>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agentsList.map((agent) => {
          const isActive = agent.status === 'active';
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-5 rounded-[20px] bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-4 cursor-pointer flex flex-col justify-between group ${
                !isActive ? 'opacity-50 hover:opacity-100' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="text-2xl bg-white/[0.06] p-2.5 rounded-xl border border-white/[0.08] group-hover:border-white/[0.15] transition-colors shrink-0">
                      {agent.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-sm font-semibold text-white group-hover:text-[#FFB000] transition-colors truncate">
                          {agent.name}
                        </h3>
                        <AgentThroughputSparkline agent={agent} />
                      </div>
                      <span className="text-[10px] font-mono text-white/40 block truncate uppercase mt-0.5">
                        {agent.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {onToggleAgentStatus && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleAgentStatus(agent.id);
                        }}
                        title={isActive ? 'Deactivate Agent' : 'Activate Agent'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? 'text-[#22D3A7] hover:text-rose-400 bg-emerald-500/15 hover:bg-rose-500/15'
                            : 'text-white/40 hover:text-[#22D3A7] bg-white/[0.04]'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive
                          ? 'bg-[#22D3A7]'
                          : 'bg-white/30'
                      }`}
                    />
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed line-clamp-2 h-9">
                  {agent.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1 max-h-16 overflow-hidden">
                  {agent.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono bg-white/[0.06] text-white/80 px-2 py-0.5 rounded border border-white/[0.08] truncate max-w-[140px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs font-mono">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block font-sans">Tasks Handled</span>
                  <span className="font-semibold text-white">{agent.totalTasks.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/40 uppercase block font-sans">Accuracy</span>
                  <span className="font-semibold text-[#22D3A7]">{agent.accuracyRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AgentDiagnosticsDrawer
        isOpen={Boolean(selectedAgent)}
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onToggleStatus={onToggleAgentStatus}
      />
    </div>
  );
};
