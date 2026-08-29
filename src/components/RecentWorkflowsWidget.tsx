import React, { useState, useEffect } from 'react';
import {
  Play,
  Zap,
  History,
  Sparkles,
  Loader2,
  Clock,
  CheckCircle2,
  Headphones,
  Receipt,
  UserCheck,
  ShieldCheck,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  Square,
  Network,
} from 'lucide-react';
import { WorkflowDefinition, AuditLogEntry, WorkspaceType } from '../types';

interface RecentWorkflowsWidgetProps {
  workflows: WorkflowDefinition[];
  auditLogs: AuditLogEntry[];
  activeWorkspace?: WorkspaceType;
  onTriggerRun: (workflowId: string) => void;
  onCancelRun?: () => void;
  isExecuting: boolean;
  executingWorkflowId?: string;
  onSelectWorkflow?: (workflow: WorkflowDefinition) => void;
  lastExecutedWorkflowId?: string | null;
}

export const RecentWorkflowsWidget: React.FC<RecentWorkflowsWidgetProps> = ({
  workflows,
  auditLogs,
  activeWorkspace,
  onTriggerRun,
  onCancelRun,
  isExecuting,
  executingWorkflowId,
  onSelectWorkflow,
  lastExecutedWorkflowId,
}) => {
  const [completedWfId, setCompletedWfId] = useState<string | null>(null);

  useEffect(() => {
    if (lastExecutedWorkflowId && !isExecuting) {
      setCompletedWfId(lastExecutedWorkflowId);
      const timer = setTimeout(() => {
        setCompletedWfId(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastExecutedWorkflowId, isExecuting]);

  // Extract last 3 unique executed workflow definitions in chronological order
  const getRecentWorkflows = (): {
    workflow: WorkflowDefinition;
    lastLog?: AuditLogEntry;
  }[] => {
    const executedMap = new Map<string, AuditLogEntry>();

    for (const log of auditLogs) {
      if (log.workflowId && !executedMap.has(log.workflowId)) {
        executedMap.set(log.workflowId, log);
      }
    }

    const recentItems: { workflow: WorkflowDefinition; lastLog?: AuditLogEntry }[] = [];

    for (const [wfId, log] of executedMap.entries()) {
      const match = workflows.find((w) => w.id === wfId);
      if (match) {
        recentItems.push({ workflow: match, lastLog: log });
      }
      if (recentItems.length === 3) break;
    }

    if (recentItems.length < 3) {
      const remaining = workflows.filter(
        (w) => !recentItems.some((item) => item.workflow.id === w.id)
      );

      const sortedRemaining = [...remaining].sort((a, b) => {
        if (a.workspace === activeWorkspace && b.workspace !== activeWorkspace) return -1;
        if (b.workspace === activeWorkspace && a.workspace !== activeWorkspace) return 1;
        return (b.totalRuns || 0) - (a.totalRuns || 0);
      });

      for (const wf of sortedRemaining) {
        recentItems.push({ workflow: wf });
        if (recentItems.length === 3) break;
      }
    }

    return recentItems.slice(0, 3);
  };

  const recentList = getRecentWorkflows();

  const getWorkflowIcon = (wf: WorkflowDefinition) => {
    if (wf.workspace === 'support' || wf.id.includes('support') || wf.id.includes('refund')) {
      return <Headphones className="w-4 h-4 text-[#FFB000]" />;
    }
    if (wf.workspace === 'finance' || wf.id.includes('finance') || wf.id.includes('invoice')) {
      return <Receipt className="w-4 h-4 text-[#22D3A7]" />;
    }
    if (wf.workspace === 'hr' || wf.id.includes('hr') || wf.id.includes('onboard')) {
      return <UserCheck className="w-4 h-4 text-[#5EA0FF]" />;
    }
    return <Cpu className="w-4 h-4 text-purple-400" />;
  };

  return (
    <section
      id="recent-workflows-widget"
      className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-4"
    >
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[#FFB000]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="card-title">
                Quick Dispatch Workflows
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                1-Click Run
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Instantly execute or simulate multi-agent operational pipelines
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A7]" />
          <span>Ready to Trigger</span>
        </div>
      </div>

      {/* 3-Card Quick Trigger Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentList.map((item, index) => {
          const wf = item.workflow;
          const log = item.lastLog;
          const isThisExecuting = isExecuting && executingWorkflowId === wf.id;
          const isJustCompleted = completedWfId === wf.id;

          return (
            <div
              key={`recent-wf-${wf.id}-${index}`}
              id={`recent-workflow-card-${wf.id}`}
              className={`p-4 rounded-[18px] flex flex-col justify-between space-y-3 transition-all relative border ${
                isThisExecuting
                  ? 'border-[#FFB000] bg-[#FFB000]/[0.08] ring-1 ring-[#FFB000]/40'
                  : isJustCompleted
                  ? 'border-[#22D3A7]/60 bg-[#22D3A7]/[0.08]'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              {/* Card Top Row: Category Icon, Workspace Badge, and Trigger Button */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] shrink-0">
                    {getWorkflowIcon(wf)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.08] text-white/80">
                      {wf.workspace}
                    </span>
                    <span className="block text-[10px] font-mono text-white/40 mt-1 truncate">
                      {wf.pipeline.length} steps
                    </span>
                  </div>
                </div>

                {/* Single-Click Trigger Button */}
                <button
                  id={`quick-trigger-btn-${wf.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isThisExecuting && onCancelRun) {
                      onCancelRun();
                    } else {
                      onTriggerRun(wf.id);
                    }
                  }}
                  title={
                    isThisExecuting
                      ? `Click to stop execution of ${wf.name}`
                      : isJustCompleted
                      ? `Execution finished for ${wf.name}`
                      : `Single-click to trigger ${wf.name}`
                  }
                  className={`p-2.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    isThisExecuting
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : isJustCompleted
                      ? 'bg-[#22D3A7] text-[#08090D]'
                      : 'bg-[#FFB000] hover:bg-[#FFC033] text-[#08090D]'
                  }`}
                >
                  {isThisExecuting ? (
                    <div className="flex items-center space-x-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <Square className="w-2.5 h-2.5 fill-current text-white/90" />
                    </div>
                  ) : isJustCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#08090D] stroke-[2.5]" />
                  ) : (
                    <Play className="w-4 h-4 fill-current text-[#08090D]" />
                  )}
                </button>
              </div>

              {/* Status Message */}
              {isThisExecuting && (
                <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-[10px] font-mono text-amber-300 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    <span>Pipeline running...</span>
                  </div>
                  <span className="text-rose-300 font-bold hover:underline cursor-pointer">
                    Stop
                  </span>
                </div>
              )}

              {/* Workflow Details */}
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-semibold text-white truncate leading-snug">
                  {wf.name}
                </h4>
                <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                  {wf.description}
                </p>
              </div>

              {/* Footer: Telemetry & Run History */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/40">
                <div className="flex items-center space-x-1.5 truncate">
                  <Clock className="w-3 h-3 text-white/40 shrink-0" />
                  <span className="truncate text-white/60">
                    {log ? log.timestamp : `${wf.totalRuns} total runs`}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-[#22D3A7] font-semibold shrink-0">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span>{wf.automationRate}%</span>
                </div>
              </div>

              {/* Action Buttons: Simulate Graph */}
              {onSelectWorkflow && (
                <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
                  <button
                    onClick={() => onSelectWorkflow(wf)}
                    className="text-[11px] font-semibold text-[#FFB000] hover:text-[#FFC033] flex items-center space-x-1 cursor-pointer font-mono"
                  >
                    <Network className="w-3 h-3" />
                    <span>Simulate Graph</span>
                  </button>
                  <button
                    onClick={() => onSelectWorkflow(wf)}
                    className="text-[11px] text-white/40 hover:text-white flex items-center space-x-0.5 cursor-pointer font-sans"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
