import React, { useState } from 'react';
import { WorkflowDefinition, WorkspaceType } from '../types';
import { GitMerge, Plus, Play, CheckCircle2, RefreshCw, Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import { CreateWorkflowModal } from '../components/CreateWorkflowModal';
import { StatusBadge } from '../components/StatusBadge';

interface WorkflowsPageProps {
  workflows: WorkflowDefinition[];
  activeWorkspace: WorkspaceType;
  setActiveWorkspace?: (ws: WorkspaceType) => void;
  onCreateWorkflow: (wf: Partial<WorkflowDefinition>) => void;
  onSelectWorkflow: (wf: WorkflowDefinition) => void;
  onTriggerRun: (wfId: string) => void;
  isExecuting: boolean;
}

export const WorkflowsPage: React.FC<WorkflowsPageProps> = ({
  workflows,
  activeWorkspace,
  setActiveWorkspace,
  onCreateWorkflow,
  onSelectWorkflow,
  onTriggerRun,
  isExecuting,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterWorkspace, setFilterWorkspace] = useState<string>(activeWorkspace);

  React.useEffect(() => {
    setFilterWorkspace(activeWorkspace);
  }, [activeWorkspace]);

  const handleSelectTab = (ws: string) => {
    setFilterWorkspace(ws);
    if (ws !== 'all' && setActiveWorkspace) {
      setActiveWorkspace(ws as WorkspaceType);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    if (filterWorkspace !== 'all' && w.workspace !== filterWorkspace) return false;
    return true;
  });

  return (
    <div
      id="workflows-page"
      className="flex-1 overflow-y-auto px-6 py-6 text-white space-y-6 select-none font-sans max-w-[1600px] mx-auto w-full"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-white/[0.04] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="meta-label text-[#FFB000]">OPERATIONAL PIPELINES</span>
            <span className="text-white/20">•</span>
            <span className="meta-label">Release Guardian Enforced</span>
          </div>
          <h1 className="page-title leading-tight">Multi-Agent Workflows</h1>
          <p className="text-xs text-white/50 mt-1">
            Configure automated pipelines combining AI agents with deterministic policy guardrails.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary min-h-[40px] px-5 text-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* Filter Tabs Capsule */}
      <div className="flex items-center space-x-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08] w-fit">
        <button
          onClick={() => handleSelectTab('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            filterWorkspace === 'all'
              ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          All Workspaces
        </button>
        <button
          onClick={() => handleSelectTab('support')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            filterWorkspace === 'support'
              ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Customer Support
        </button>
        <button
          onClick={() => handleSelectTab('finance')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            filterWorkspace === 'finance'
              ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Finance Ops
        </button>
        <button
          onClick={() => handleSelectTab('hr')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            filterWorkspace === 'hr'
              ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          HR Operations
        </button>
      </div>

      {/* Workflow List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorkflows.map((wf) => (
          <div
            key={wf.id}
            className="p-6 rounded-[20px] bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[#FFB000]">
                    <GitMerge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{wf.name}</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-white/[0.08] text-white/70 mt-1 inline-block">
                      {wf.workspace}
                    </span>
                  </div>
                </div>

                <StatusBadge status={wf.status} size="xs" />
              </div>

              <p className="text-xs text-white/60 leading-relaxed">{wf.description}</p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] text-center font-mono">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block font-sans">Total Runs</span>
                  <span className="text-xs font-semibold text-white">{wf.totalRuns.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 uppercase block font-sans">Auto Rate</span>
                  <span className="text-xs font-semibold text-[#22D3A7]">{wf.automationRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 uppercase block font-sans">Avg Duration</span>
                  <span className="text-xs font-semibold text-white/70">{wf.avgDurationSeconds}s</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => onSelectWorkflow(wf)}
                className="text-xs font-semibold text-[#FFB000] hover:text-[#FFC033] transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <span>Configure Pipeline ({wf.pipeline.length} Steps)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onTriggerRun(wf.id)}
                disabled={isExecuting}
                className="btn-primary text-xs h-8 px-3.5"
              >
                <Play className="w-3 h-3 fill-current text-[#08090D]" />
                <span>Trigger Run</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <CreateWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={onCreateWorkflow}
        activeWorkspace={activeWorkspace}
      />
    </div>
  );
};
