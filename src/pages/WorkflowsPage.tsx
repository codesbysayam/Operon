import React, { useState } from 'react';
import { WorkflowDefinition, WorkspaceType, WorkflowTemplate } from '../types';
import {
  GitMerge,
  Plus,
  Play,
  CheckCircle2,
  RefreshCw,
  Zap,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowRight,
  Users,
  Lock,
  Building2,
} from 'lucide-react';
import { CreateWorkflowModal } from '../components/CreateWorkflowModal';
import { StatusBadge } from '../components/StatusBadge';
import { WORKFLOW_TEMPLATES } from '../data/advancedOpsData';

interface WorkflowsPageProps {
  workflows: WorkflowDefinition[];
  activeWorkspace: WorkspaceType;
  setActiveWorkspace?: (ws: WorkspaceType) => void;
  onCreateWorkflow: (wf: Partial<WorkflowDefinition>) => void;
  onSelectWorkflow: (wf: WorkflowDefinition) => void;
  onTriggerRun: (wfId: string) => void;
  isExecuting: boolean;
  templates?: WorkflowTemplate[];
  onInstantiateTemplate?: (templateId: string) => void;
}

export const WorkflowsPage: React.FC<WorkflowsPageProps> = ({
  workflows,
  activeWorkspace,
  setActiveWorkspace,
  onCreateWorkflow,
  onSelectWorkflow,
  onTriggerRun,
  isExecuting,
  templates = WORKFLOW_TEMPLATES,
  onInstantiateTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'pipelines' | 'templates'>('pipelines');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterWorkspace, setFilterWorkspace] = useState<string>(activeWorkspace);

  React.useEffect(() => {
    setFilterWorkspace(activeWorkspace);
  }, [activeWorkspace]);

  const handleSelectWorkspaceTab = (ws: string) => {
    setFilterWorkspace(ws);
    if (ws !== 'all' && setActiveWorkspace) {
      setActiveWorkspace(ws as WorkspaceType);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    if (filterWorkspace !== 'all' && w.workspace !== filterWorkspace) return false;
    return true;
  });

  const filteredTemplates = templates.filter((t) => {
    if (filterWorkspace !== 'all' && t.workspace !== filterWorkspace) return false;
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
          <h1 className="page-title leading-tight">Multi-Agent Workflows & Templates</h1>
          <p className="text-xs text-white/50 mt-1">
            Configure automated pipelines combining AI agents with deterministic policy guardrails and production blueprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary min-h-[40px] px-5 text-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Custom Workflow</span>
          </button>
        </div>
      </div>

      {/* Main View Tabs (Pipelines vs Template Gallery) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pipelines')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pipelines'
                ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            Active Pipelines ({filteredWorkflows.length})
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5EA0FF]" />
            Production Template Library ({templates.length})
          </button>
        </div>

        {/* Filter Tabs Capsule */}
        <div className="flex items-center space-x-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08] w-fit">
          {(['all', 'support', 'finance', 'hr', 'operations'] as const).map((ws) => (
            <button
              key={ws}
              onClick={() => handleSelectWorkspaceTab(ws)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterWorkspace === ws
                  ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {ws === 'all' ? 'All Workspaces' : ws}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'pipelines' ? (
        /* TAB 1: Active Pipelines */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => onSelectWorkflow(wf)}
              className="group p-5 rounded-[20px] bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.16] space-y-4 transition-all duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/50 bg-white/[0.06] px-2 py-0.5 rounded uppercase">
                    {wf.workspace}
                  </span>
                  <StatusBadge status={wf.status} size="xs" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#FFB000] transition-colors line-clamp-1">
                    {wf.name}
                  </h3>
                  <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed">
                    {wf.description}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono pt-2 border-t border-white/[0.06]">
                  <div>
                    <span className="text-white/40 block text-[10px]">Steps</span>
                    <span className="text-white font-semibold">{wf.pipeline.length}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Runs</span>
                    <span className="text-white font-semibold">{wf.totalRuns}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Auto Rate</span>
                    <span className="text-[#22D3A7] font-semibold">{wf.automationRate}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerRun(wf.id);
                  }}
                  disabled={isExecuting}
                  className="btn-secondary text-xs h-8 px-3 text-[#FFB000] hover:text-white flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run Pipeline</span>
                </button>

                <div className="text-xs text-white/40 flex items-center space-x-1 group-hover:text-white transition-colors">
                  <span>Inspect DAG</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TAB 2: Production Template Library */
        <div className="space-y-4">
          <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles className="w-5 h-5 text-[#5EA0FF]" />
              <h3 className="text-sm font-semibold text-white">
                Battle-Tested Enterprise Workflow Templates
              </h3>
            </div>
            <p className="text-xs text-white/60">
              Instantly deploy pre-configured autonomous pipelines equipped with multi-agent consensus, fraud verification, and Release Guardian human gates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-[20px] bg-[#0E1015] border border-white/[0.08] hover:border-[#5EA0FF]/40 space-y-4 transition-all duration-150 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#5EA0FF] bg-[#5EA0FF]/10 border border-[#5EA0FF]/20 px-2 py-0.5 rounded uppercase">
                      {tpl.workspace}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">
                      {tpl.complexity} Complexity
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">{tpl.name}</h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/[0.06]">
                    <div className="bg-[#12141A] rounded-lg p-2">
                      <span className="text-[10px] text-white/40 block">Agents Count</span>
                      <span className="font-semibold text-white font-mono flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#FFB000]" />
                        {tpl.agentsCount} specialized agents
                      </span>
                    </div>

                    <div className="bg-[#12141A] rounded-lg p-2">
                      <span className="text-[10px] text-white/40 block">Human Gate</span>
                      <span className="font-semibold text-[#22D3A7] font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {tpl.humanGatesCount} release barrier
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/30 border border-white/[0.05] rounded-lg p-2.5 text-[11px] text-white/70">
                    <span className="text-white/40 font-mono block text-[10px] mb-0.5">
                      Operational Use Case:
                    </span>
                    {tpl.useCase}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06]">
                  <button
                    onClick={() => onInstantiateTemplate && onInstantiateTemplate(tpl.id)}
                    className="w-full py-2 bg-[#5EA0FF]/15 hover:bg-[#5EA0FF]/25 border border-[#5EA0FF]/30 text-[#5EA0FF] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Deploy This Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(newWf) => {
          onCreateWorkflow({ ...newWf, workspace: activeWorkspace });
          setIsModalOpen(false);
        }}
        activeWorkspace={activeWorkspace}
      />
    </div>
  );
};
