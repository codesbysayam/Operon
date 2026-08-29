import React, { useState } from 'react';
import { WorkflowDefinition, ExecutionMode } from '../types';
import { WorkflowPipeline } from '../components/WorkflowPipeline';
import { WorkflowCanvasBuilder } from '../components/WorkflowCanvasBuilder';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Play, Sparkles, Cpu, ShieldCheck, Zap, Network, ListOrdered, FlaskConical } from 'lucide-react';

interface WorkflowDetailPageProps {
  workflow: WorkflowDefinition;
  onBack: () => void;
  onTriggerRun: (wfId: string, customInput?: string) => Promise<void>;
  isExecuting: boolean;
  executionMode: ExecutionMode;
}

export const WorkflowDetailPage: React.FC<WorkflowDetailPageProps> = ({
  workflow,
  onBack,
  onTriggerRun,
  isExecuting,
  executionMode,
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'execution'>('canvas');
  const [customInput, setCustomInput] = useState(
    'Customer Sofia Karim (sofia.karim@enterprise-corp.com) requesting $249.00 duplicate charge refund.'
  );

  return (
    <div
      id="workflow-detail-page"
      className="flex-1 overflow-y-auto px-6 py-6 text-white space-y-6 select-none font-sans flex flex-col max-w-[1600px] mx-auto w-full"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-white/[0.04] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            title="Back to workflows console"
            className="btn-secondary h-9 w-9 p-0 flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="meta-label text-[#FFB000]">
                {workflow.workspace.toUpperCase()} WORKSPACE
              </span>
              <span className="text-white/20">•</span>
              <span className="meta-label">
                {executionMode === 'sandbox' ? 'SANDBOX TIER' : executionMode === 'live' ? 'LIVE PRODUCTION' : 'DEMO SIMULATION'}
              </span>
              <StatusBadge status={workflow.status} size="xs" />
            </div>
            <h1 className="page-title leading-tight">{workflow.name}</h1>
            <p className="text-xs text-white/50">{workflow.description}</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-white/[0.04] p-1 rounded-full border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'canvas'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interactive Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('execution')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'execution'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Execution Stream</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'canvas' ? (
        <div className="h-[700px] w-full">
          <WorkflowCanvasBuilder
            workflow={workflow}
            activeWorkspace={workflow.workspace}
            onSimulateRun={(wfId) => onTriggerRun(wfId, customInput)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Payload Trigger */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="meta-label">
                  Trigger Payload Input
                </h3>
                <span className="text-[10px] font-mono text-white/40">JSON / TEXT</span>
              </div>

              <textarea
                rows={5}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-xs text-white font-mono placeholder-white/30 focus:outline-none focus:border-[#FFB000]/60 resize-none leading-relaxed"
              />

              <button
                onClick={() => onTriggerRun(workflow.id, customInput)}
                disabled={isExecuting}
                className="btn-primary w-full h-10 text-xs justify-center"
              >
                {isExecuting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Orchestrating Agents...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute Pipeline Run ({executionMode.toUpperCase()})</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-[18px] bg-white/[0.04] border border-white/[0.08] space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#22D3A7] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Release Guardian Active</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {executionMode === 'sandbox'
                  ? 'Connected to Sandbox test adapters with isolated test data. Policy limits & human approvals remain strictly enforced.'
                  : 'Auto-refund actions are strictly limited to $100.00. Amounts above threshold will automatically divert to the Human Approval Queue.'}
              </p>
            </div>
          </div>

          {/* Right: Pipeline Steps Visualizer */}
          <div className="lg:col-span-7">
            <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-6">
              <WorkflowPipeline pipeline={workflow.pipeline} isExecuting={isExecuting} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
