import React from 'react';
import { AgentInfo } from '../types';
import { X, Cpu } from 'lucide-react';

interface AgentDetailModalProps {
  agent: AgentInfo | null;
  onClose: () => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ agent, onClose }) => {
  if (!agent) return null;

  return (
    <div
      id="agent-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="agent-detail-modal-content"
        className="w-full max-w-lg bg-[#0E1015] border border-white/[0.1] rounded-[24px] p-6 shadow-2xl space-y-5 relative select-none font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="text-2xl bg-white/[0.06] p-2 rounded-xl border border-white/[0.08]">
              {agent.avatar}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{agent.name}</h3>
              <p className="text-xs text-white/50">
                Specialized Agent • {agent.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Description */}
          <p className="text-xs text-white/70 leading-relaxed bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
            {agent.description}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-semibold text-white/40 uppercase block font-sans">
                Total Tasks Handled
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {agent.totalTasks.toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-semibold text-white/40 uppercase block font-sans">
                Accuracy Score
              </span>
              <span className="text-lg font-bold text-[#22D3A7] font-mono">
                {agent.accuracyRate}%
              </span>
            </div>
          </div>

          {/* Equipped Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider font-mono">
              Equipped Custom Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {agent.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono bg-white/[0.06] text-white/80 px-2.5 py-1 rounded-lg border border-white/[0.08] flex items-center space-x-1.5"
                >
                  <Cpu className="w-3 h-3 text-[#FFB000]" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-primary w-full h-10 text-xs justify-center"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
