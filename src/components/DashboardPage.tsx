import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ApprovalCase, AuditLogEntry, AnalyticsData, WorkflowDefinition, WorkspaceType, PolicyConfig } from '../types';
import { StatusBadge } from './StatusBadge';
import { DecisionFabricVisualizer } from './DecisionFabricVisualizer';
import { RecentWorkflowsWidget } from './RecentWorkflowsWidget';
import {
  Play,
  CheckCircle2,
  Shield,
  XCircle,
  Clock,
  TrendingUp,
  Bot,
  Zap,
  Plus,
  ArrowRight,
  GitMerge,
  Sparkles,
  ChevronRight,
  Layers,
  PieChart as PieChartIcon,
  ShieldCheck,
  FlaskConical,
  Activity,
  UserCheck,
  Cpu,
  RotateCw,
} from 'lucide-react';

interface DashboardPageProps {
  cases: ApprovalCase[];
  workflows?: WorkflowDefinition[];
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (ws: WorkspaceType) => void;
  policyConfig: PolicyConfig;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  auditLogs: AuditLogEntry[];
  analytics: AnalyticsData;
  onTriggerRun: (workflowId?: string) => void;
  onCancelRun?: () => void;
  isExecuting: boolean;
  executingWorkflowId?: string;
  lastExecutedWorkflowId?: string | null;
  onViewAllCases: () => void;
  onSelectWorkflow?: (wf: WorkflowDefinition) => void;
  onOpenCreateWorkflow?: () => void;
  onNavigateToTab?: (tab: string) => void;
  activeAgentsCount?: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  cases,
  workflows = [],
  activeWorkspace,
  setActiveWorkspace,
  policyConfig,
  onApprove,
  onReject,
  auditLogs,
  analytics,
  onTriggerRun,
  onCancelRun,
  isExecuting,
  executingWorkflowId,
  lastExecutedWorkflowId,
  onViewAllCases,
  onSelectWorkflow,
  onOpenCreateWorkflow,
  onNavigateToTab,
  activeAgentsCount = 8,
}) => {
  const workspaceWorkflows = workflows.filter((w) => w.workspace === activeWorkspace);
  const workspaceCases = cases.filter((c) => c.workspace === activeWorkspace);
  const pendingCasesCount = workspaceCases.filter((c) => c.status === 'pending').length;
  
  const wsPendingCount = workspaceCases.filter((c) => c.status === 'pending').length;
  const wsApprovedCount = workspaceCases.filter((c) => c.status === 'approved').length;
  const wsRejectedCount = workspaceCases.filter((c) => c.status === 'rejected').length;

  const caseStatusData = [
    { name: 'Pending Review', value: wsPendingCount, color: '#FFB000' },
    { name: 'Approved', value: wsApprovedCount, color: '#22D3A7' },
    { name: 'Rejected', value: wsRejectedCount, color: '#FF5C6C' },
  ];

  const mainWorkflow = workspaceWorkflows[0] || workflows[0] || {
    id: 'wf-1',
    name: 'Customer Support Automation Plan',
    description:
      'AI customer support system that classifies incoming requests, determines priority, drafts responses, and enforces policy refund caps.',
    workspace: 'support',
    status: 'completed',
    totalRuns: 42,
    automationRate: 98.4,
    avgDurationSeconds: 42,
    pipeline: [],
  };

  const workspaceLabel =
    activeWorkspace === 'support'
      ? 'Customer Support Operations'
      : activeWorkspace === 'finance'
      ? 'Finance & Accounting Operations'
      : activeWorkspace === 'hr'
      ? 'HR & Provisioning Operations'
      : 'General Enterprise Operations';

  const filteredLogs = auditLogs.filter(
    (log) => !log.workspace || log.workspace === activeWorkspace
  );

  return (
    <div
      id="dashboard-container"
      className="flex-1 overflow-y-auto px-6 py-6 text-white space-y-6 select-none font-sans max-w-[1600px] mx-auto w-full"
    >
      {/* 1. HERO SECTION (Compact 220-260px Height) */}
      <section
        id="dashboard-hero"
        className="p-6 md:p-8 rounded-[24px] bg-white/[0.04] border border-white/[0.08] relative overflow-hidden backdrop-blur-xl"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center space-x-2">
              <span className="meta-label text-[#FFB000]">
                {activeWorkspace.toUpperCase()} / OPERATIONS
              </span>
              <span className="text-white/20">•</span>
              <span className="meta-label text-white/50">Multi-Agent Engine</span>
            </div>

            {/* Page Title: 32-38px, font-weight 650, letter-spacing -0.035em */}
            <h1 className="page-title leading-tight">
              {workspaceLabel}
            </h1>

            {/* Description */}
            <p className="text-xs md:text-sm text-white/60 leading-relaxed font-normal">
              Real-time monitoring of multi-agent workflows, approval gates, execution progress and operational security.
            </p>

            {/* Workspace Segmented Control */}
            <div className="pt-2 flex items-center flex-wrap gap-1.5">
              <button
                onClick={() => setActiveWorkspace('support')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeWorkspace === 'support'
                    ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                Customer Support
              </button>
              <button
                onClick={() => setActiveWorkspace('finance')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeWorkspace === 'finance'
                    ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                Finance Ops
              </button>
              <button
                onClick={() => setActiveWorkspace('hr')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeWorkspace === 'hr'
                    ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                HR Operations
              </button>
              <button
                onClick={() => setActiveWorkspace('operations')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeWorkspace === 'operations'
                    ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                General Ops
              </button>
            </div>
          </div>

          {/* Right Action CTAs */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
            <button
              id="hero-create-workflow-btn"
              onClick={onOpenCreateWorkflow}
              className="btn-primary min-h-[42px] px-5"
            >
              <Plus className="w-4 h-4 text-[#08090D] stroke-[2.5]" />
              <span>Create Workflow</span>
            </button>

            <button
              onClick={() => onTriggerRun(mainWorkflow.id)}
              disabled={isExecuting}
              className="btn-secondary min-h-[38px] px-4 text-xs"
            >
              {isExecuting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB000] animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-white/70" />
                  <span>Run Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 2. KPI / METRIC SYSTEM (Horizontal Grid with Restrained Monochrome Surfaces) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* RUNNING */}
        <div
          onClick={() => onNavigateToTab?.('workflows')}
          className="p-4 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="meta-label">Running</span>
            <span className="status-dot-running" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">
              {isExecuting ? 1 : 0}
            </div>
            <div className="text-[11px] text-[#22D3A7] font-medium mt-0.5">
              +12.4% <span className="text-white/40 font-normal">Active</span>
            </div>
          </div>
        </div>

        {/* COMPLETED */}
        <div
          onClick={() => onNavigateToTab?.('workflows')}
          className="p-4 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="meta-label">Completed</span>
            <span className="status-dot-completed" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">
              {workspaceWorkflows.length * 8 + 4}
            </div>
            <div className="text-[11px] text-[#22D3A7] font-medium mt-0.5">
              +8.2% <span className="text-white/40 font-normal">Workspace</span>
            </div>
          </div>
        </div>

        {/* PENDING APPROVAL */}
        <div
          onClick={() => onNavigateToTab?.('approvals')}
          className="p-4 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.07] border border-amber-500/25 hover:border-amber-500/40 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="meta-label text-amber-300">Pending Gate</span>
            <span className="status-dot-pending" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#FFB000]">
              {pendingCasesCount}
            </div>
            <div className="text-[11px] text-[#FFB000] font-medium mt-0.5">
              Requires attention
            </div>
          </div>
        </div>

        {/* FAILED */}
        <div
          onClick={() => onNavigateToTab?.('activity')}
          className="p-4 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="meta-label">Failed</span>
            <span className="status-dot-paused" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">0</div>
            <div className="text-[11px] text-white/40 mt-0.5">Healthy &amp; Clean</div>
          </div>
        </div>

        {/* AVG RUNTIME */}
        <div
          onClick={() => onNavigateToTab?.('analytics')}
          className="p-4 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="meta-label">Avg Runtime</span>
            <Clock className="w-3.5 h-3.5 text-white/40" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">
              {mainWorkflow.avgDurationSeconds}s
            </div>
            <div className="text-[11px] text-[#22D3A7] font-medium mt-0.5">
              -8.4% <span className="text-white/40 font-normal">faster</span>
            </div>
          </div>
        </div>

        {/* SUCCESS RATE */}
        <div
          onClick={() => onNavigateToTab?.('analytics')}
          className="p-4 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="meta-label">Success Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#22D3A7]" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#22D3A7]">
              {mainWorkflow.automationRate}%
            </div>
            <div className="text-[11px] text-[#22D3A7] font-medium mt-0.5">
              +2.1% <span className="text-white/40 font-normal">pass</span>
            </div>
          </div>
        </div>

        {/* ACTIVE AGENTS */}
        <div
          onClick={() => onNavigateToTab?.('agents')}
          className="p-4 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="meta-label">Active Agents</span>
            <Bot className="w-3.5 h-3.5 text-white/40" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">
              {activeAgentsCount}
            </div>
            <div className="text-[11px] text-[#22D3A7] font-medium mt-0.5">
              All operational
            </div>
          </div>
        </div>
      </section>

      {/* 3. RECENT WORKFLOWS QUICK TRIGGER WIDGET */}
      <RecentWorkflowsWidget
        workflows={workflows}
        auditLogs={auditLogs}
        activeWorkspace={activeWorkspace}
        onTriggerRun={onTriggerRun}
        onCancelRun={onCancelRun}
        isExecuting={isExecuting}
        executingWorkflowId={executingWorkflowId}
        lastExecutedWorkflowId={lastExecutedWorkflowId}
        onSelectWorkflow={onSelectWorkflow}
      />

      {/* 4. WORKFLOW CONSOLE (Data-Dense Table / List) */}
      <section className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="section-title">Workflow Console</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                {workspaceWorkflows.length} in {activeWorkspace.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              Active pipelines, status indicators, agent counts, and one-click execution controls.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab?.('workflows')}
            className="text-xs font-semibold text-[#FFB000] hover:text-[#FFC033] flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>View All Workflows</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Enterprise Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/40 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Workflow</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Agents</th>
                <th className="py-2.5 px-3 font-semibold">Total Runs</th>
                <th className="py-2.5 px-3 font-semibold">Automation</th>
                <th className="py-2.5 px-3 font-semibold">Runtime</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-sans">
              {workspaceWorkflows.map((wf) => {
                const isThisExecuting = isExecuting && executingWorkflowId === wf.id;
                return (
                  <tr
                    key={wf.id}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => onSelectWorkflow?.(wf)}
                  >
                    {/* Workflow Name & Workspace */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-white group-hover:text-[#FFB000] transition-colors">
                        {wf.name}
                      </div>
                      <div className="text-[11px] text-white/40 line-clamp-1 max-w-sm">
                        {wf.description}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-1.5">
                        <StatusBadge
                          status={isThisExecuting ? 'running' : wf.status}
                          size="xs"
                        />
                      </div>
                    </td>

                    {/* Agents */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-white/70">
                      {wf.pipeline.length} steps
                    </td>

                    {/* Total Runs */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-white/70">
                      {wf.totalRuns}
                    </td>

                    {/* Automation Rate */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#22D3A7] font-semibold">
                      {wf.automationRate}%
                    </td>

                    {/* Runtime */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-white/60">
                      {wf.avgDurationSeconds}s
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onTriggerRun(wf.id)}
                        disabled={isExecuting}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isThisExecuting
                            ? 'bg-[#FFB000] text-[#08090D]'
                            : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.10]'
                        }`}
                      >
                        {isThisExecuting ? (
                          <>
                            <Sparkles className="w-3 h-3 animate-spin" />
                            <span>Running...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current text-white/70" />
                            <span>Trigger</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. VISUAL AI DECISION FABRIC & REASONING FLOW */}
      <DecisionFabricVisualizer
        currentCase={workspaceCases[0] || cases[0]}
        policyConfig={policyConfig}
        onApproveCase={onApprove}
        onRejectCase={onReject}
      />

      {/* 6. APPROVAL STATUS & AUDIT TIMELINE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Case Status Distribution (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-[#FFB000]" />
              <h3 className="card-title">Case Status Distribution</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60 uppercase">
              {activeWorkspace}
            </span>
          </div>

          {/* Doughnut Chart Canvas */}
          <div className="relative h-48 w-full flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caseStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={74}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {caseStatusData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101217',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#F5F5F7',
                  }}
                  formatter={(value: number) => [`${value} case(s)`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white font-mono leading-none">
                {workspaceCases.length}
              </span>
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider mt-0.5">
                Total Cases
              </span>
            </div>
          </div>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] font-mono text-xs">
            <div className="p-2 rounded-xl bg-white/[0.02] border border-amber-500/20 text-center">
              <div className="text-[10px] text-white/50 font-sans">Pending</div>
              <div className="text-base font-bold text-[#FFB000]">{wsPendingCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-emerald-500/20 text-center">
              <div className="text-[10px] text-white/50 font-sans">Approved</div>
              <div className="text-base font-bold text-[#22D3A7]">{wsApprovedCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-rose-500/20 text-center">
              <div className="text-[10px] text-white/50 font-sans">Rejected</div>
              <div className="text-base font-bold text-[#FF5C6C]">{wsRejectedCount}</div>
            </div>
          </div>
        </div>

        {/* Right: Operational Summary & Human Gate Queue (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#22D3A7]" />
              <h3 className="card-title">Governance &amp; Human Approval Gate</h3>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22D3A7]" />
              <span className="text-[10px] font-mono text-white/60">Policy Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="meta-label">Safeguard Limit</div>
              <div className="text-sm font-semibold text-[#FFB000]">
                ${policyConfig.autoRefundLimit}.00 Auto-Threshold
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                Mutations exceeding threshold automatically route to human sign-off.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="meta-label">Active Agents</div>
              <div className="text-sm font-semibold text-[#22D3A7]">
                {activeAgentsCount} Specialized Agents
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                Intent Analyst, Memory, Fraud Sentinel, Planner, Policy, Executor.
              </p>
            </div>
          </div>

          {/* Pending Approval Banner Card */}
          <div className="p-3.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-[#FFB000]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  {wsPendingCount} Pending Human Approval Case(s)
                </div>
                <div className="text-[11px] text-white/50">
                  Review authorization queue for {activeWorkspace.toUpperCase()} operations
                </div>
              </div>
            </div>

            <button
              onClick={onViewAllCases}
              className="btn-primary text-xs h-8 px-3"
            >
              Review Now
            </button>
          </div>
        </div>
      </div>

      {/* 7. RECENT AUDIT LOG TIMELINE */}
      <section className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-white/60" />
            <h3 className="card-title">Recent Immutable Audit Trail</h3>
          </div>
          <button
            onClick={() => onNavigateToTab?.('activity')}
            className="text-xs font-semibold text-[#FFB000] hover:text-[#FFC033] flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>View Full Audit Log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {filteredLogs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <StatusBadge
                  status={log.status === 'success' ? 'completed' : log.status === 'warning' ? 'pending' : 'failed'}
                  size="xs"
                />
                <span className="font-mono text-[10px] text-white/40">{log.timestamp}</span>
              </div>
              <p className="text-xs font-semibold text-white">{log.event}</p>
              <p className="text-[11px] text-white/50 font-mono line-clamp-1">{log.details}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
