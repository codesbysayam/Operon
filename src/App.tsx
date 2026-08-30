import React, { useState } from 'react';
import { useAppStore } from './orchestrator/store';
import { Header } from './components/Header';
import { Sidebar, PageTab } from './components/Sidebar';
import { DashboardPage } from './components/DashboardPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { WorkflowDetailPage } from './pages/WorkflowDetailPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { AgentsPage } from './pages/AgentsPage';
import { SkillsPage } from './pages/SkillsPage';
import { ActivityPage } from './pages/ActivityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { GovernancePage } from './pages/GovernancePage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ToastContainer } from './components/ToastContainer';
import { PolicySimulatorModal } from './components/PolicySimulatorModal';
import { ExecutionReplayTheaterModal } from './components/ExecutionReplayTheaterModal';
import { GovernanceCertificateModal } from './components/GovernanceCertificateModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { WorkflowDefinition, WorkspaceType, ApprovalCase } from './types';
import {
  LayoutDashboard,
  GitMerge,
  ShieldCheck,
  Users,
  Activity,
  BarChart3,
  Settings,
  Plus,
  Zap,
  X,
} from 'lucide-react';
import { WorkflowTipBanner, DeployButtonWithTip } from './components/WorkflowTipTooltip';

export function App() {
  const store = useAppStore();
  const [activePage, setActivePage] = useState<PageTab>('dashboard');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Additional Feature Modals State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [replayCase, setReplayCase] = useState<ApprovalCase | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [certificateCase, setCertificateCase] = useState<ApprovalCase | null>(null);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // New Workflow Modal Form State
  const [wfName, setWfName] = useState('');
  const [wfDesc, setWfDesc] = useState('');
  const [wfWorkspace, setWfWorkspace] = useState<WorkspaceType>(store.activeWorkspace);

  const pendingApprovalsCount = store.cases.filter((c) => c.status === 'pending').length;
  const activeAgentsCount = store.agents.filter((a) => a.status === 'active').length;

  const handleSelectWorkflow = (wf: WorkflowDefinition) => {
    setSelectedWorkflow(wf);
    setActivePage('workflows');
  };

  const handleOpenReplay = (caseItem: ApprovalCase) => {
    setReplayCase(caseItem);
    setIsReplayOpen(true);
  };

  const handleOpenCertificate = (caseItem: ApprovalCase) => {
    setCertificateCase(caseItem);
    setIsCertificateOpen(true);
  };

  const handleLaunchDemoScenario = () => {
    store.setActiveWorkspace('support');
    const targetCase = store.cases.find((c) => c.caseNumber === 'CS-2041') || store.cases[0];
    if (targetCase) {
      setReplayCase(targetCase);
      setIsReplayOpen(true);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfName.trim()) return;
    store.createWorkflow({
      name: wfName,
      description: wfDesc || 'Custom automated multi-agent operational workflow.',
      workspace: wfWorkspace,
    });
    setWfName('');
    setWfDesc('');
    setIsCreateModalOpen(false);
    setActivePage('workflows');
  };

  const renderActivePage = () => {
    if (selectedWorkflow && activePage === 'workflows') {
      return (
        <WorkflowDetailPage
          workflow={selectedWorkflow}
          onBack={() => setSelectedWorkflow(null)}
          onTriggerRun={store.triggerWorkflowRun}
          isExecuting={store.isExecuting}
          executionMode={store.executionMode}
        />
      );
    }

    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            cases={store.cases}
            workflows={store.workflows}
            activeWorkspace={store.activeWorkspace}
            setActiveWorkspace={store.setActiveWorkspace}
            policyConfig={store.policyConfig}
            onApprove={store.approveCase}
            onReject={store.rejectCase}
            auditLogs={store.auditLogs}
            analytics={store.analytics}
            onTriggerRun={(id) => store.triggerWorkflowRun(id || store.workflows[0]?.id)}
            onCancelRun={store.cancelWorkflowRun}
            isExecuting={store.isExecuting}
            executingWorkflowId={store.executingWorkflow?.workflowId}
            lastExecutedWorkflowId={store.lastExecutedWorkflowId}
            onViewAllCases={() => setActivePage('approvals')}
            onSelectWorkflow={handleSelectWorkflow}
            onOpenCreateWorkflow={() => setIsCreateModalOpen(true)}
            onNavigateToTab={(tab) => setActivePage(tab as PageTab)}
            activeAgentsCount={store.agents.filter((a) => a.status === 'active').length}
            onOpenReplay={handleOpenReplay}
            onOpenCertificate={handleOpenCertificate}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
            onOpenDemoScenario={handleLaunchDemoScenario}
            onInjectDemoCase={store.injectDemoCase}
          />
        );

      case 'workflows':
        return (
          <WorkflowsPage
            workflows={store.workflows}
            activeWorkspace={store.activeWorkspace}
            setActiveWorkspace={store.setActiveWorkspace}
            onCreateWorkflow={store.createWorkflow}
            onSelectWorkflow={handleSelectWorkflow}
            onTriggerRun={store.triggerWorkflowRun}
            isExecuting={store.isExecuting}
            templates={store.workflowTemplates}
            onInstantiateTemplate={store.instantiateWorkflowTemplate}
          />
        );

      case 'approvals':
        return (
          <ApprovalsPage
            cases={store.cases}
            activeWorkspace={store.activeWorkspace}
            setActiveWorkspace={store.setActiveWorkspace}
            onApprove={store.approveCase}
            onReject={store.rejectCase}
            onBatchApprove={store.batchApproveCases}
            onBatchReject={store.batchRejectCases}
            onInjectDemoCase={store.injectDemoCase}
            onResetDemoData={store.resetDemoData}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenReplay={handleOpenReplay}
            onOpenCertificate={handleOpenCertificate}
            savedViews={store.savedViews}
            activeSavedViewId={store.activeSavedViewId}
            onSelectSavedView={store.setActiveSavedViewId}
            decisionHistory={store.decisionHistory}
            onAssignCase={store.assignCase}
            onEscalateCase={store.escalateCase}
            onAddCaseNote={store.addCaseNote}
            onBulkTag={store.bulkTagCases}
          />
        );

      case 'governance':
        return (
          <GovernancePage
            policyVersions={store.policyVersions}
            policyConflicts={store.policyConflicts}
            policyConfig={store.policyConfig}
            updatePolicyConfig={store.updatePolicyConfig}
            onRollback={store.rollbackPolicyVersion}
            onRollbackPolicy={store.rollbackPolicyVersion}
            onPublishVersion={store.publishPolicyVersion}
            onPublishPolicy={store.publishPolicyVersion}
          />
        );

      case 'incidents':
        return (
          <IncidentsPage
            incidents={store.incidents}
            onResolveIncident={store.resolveIncident}
            onSimulateChaos={store.simulateChaos}
          />
        );

      case 'agents':
        return (
          <AgentsPage
            agents={store.agents}
            onToggleAgentStatus={store.toggleAgentStatus}
          />
        );

      case 'skills':
        return <SkillsPage />;

      case 'activity':
        return <ActivityPage logs={store.auditLogs} />;

      case 'analytics':
        return <AnalyticsPage analytics={store.analytics} />;

      case 'settings':
        return (
          <SettingsPage
            executionMode={store.executionMode}
            setExecutionMode={store.setExecutionMode}
            policyConfig={store.policyConfig}
            updatePolicyConfig={store.updatePolicyConfig}
          />
        );

      default:
        return null;
    }
  };

  const enrichedToasts = store.toasts.map((toast) => ({
    ...toast,
    onAction: () => {
      if (toast.status === 'pending') {
        setActivePage('approvals');
      } else {
        setActivePage('activity');
      }
      store.dismissToast(toast.id);
    },
  }));

  return (
    <div className="bg-[#08090D] text-[#F5F5F7] min-h-screen flex flex-col font-sans selection:bg-[#FFB000] selection:text-black antialiased relative">
      {/* Top Console Header */}
      <Header
        activeWorkspace={store.activeWorkspace}
        setActiveWorkspace={store.setActiveWorkspace}
        executionMode={store.executionMode}
        setExecutionMode={store.setExecutionMode}
        pendingApprovalsCount={pendingApprovalsCount}
        workflows={store.workflows}
        cases={store.cases}
        auditLogs={store.auditLogs}
        onSelectWorkflow={handleSelectWorkflow}
        onNavigateToTab={(tab) => {
          setSelectedWorkflow(null);
          setActivePage(tab);
        }}
        onOpenCreateWorkflow={() => setIsCreateModalOpen(true)}
        onRunDemoWorkflow={() => {
          setSelectedWorkflow(store.workflows[0]);
          setActivePage('workflows');
        }}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        isProfileModalOpen={isProfileModalOpen}
        setIsProfileModalOpen={setIsProfileModalOpen}
      />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Desktop Sidebar Rail (250px) */}
        <Sidebar
          activePage={activePage}
          setActivePage={(page) => {
            setSelectedWorkflow(null);
            setActivePage(page);
          }}
          pendingApprovalsCount={pendingApprovalsCount}
          activeAgentsCount={activeAgentsCount}
          openIncidentsCount={store.incidents.filter((i) => i.status === 'INVESTIGATING' || i.status === 'MITIGATED').length}
          agents={store.agents}
          store={store}
          activeWorkspace={store.activeWorkspace}
          setActiveWorkspace={store.setActiveWorkspace}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-6 relative z-10">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-[#0E1015] border border-white/[0.12] rounded-2xl p-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => {
            setSelectedWorkflow(null);
            setActivePage('dashboard');
          }}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] cursor-pointer transition-colors ${
            activePage === 'dashboard' ? 'text-[#FFB000]' : 'text-white/50 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => {
            setSelectedWorkflow(null);
            setActivePage('workflows');
          }}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] cursor-pointer transition-colors ${
            activePage === 'workflows' ? 'text-[#FFB000]' : 'text-white/50 hover:text-white'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>Workflows</span>
        </button>

        <button
          onClick={() => {
            setSelectedWorkflow(null);
            setActivePage('approvals');
          }}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] cursor-pointer transition-colors relative ${
            activePage === 'approvals' ? 'text-[#FFB000]' : 'text-white/50 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Approvals</span>
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFB000]" />
          )}
        </button>

        <button
          onClick={() => {
            setSelectedWorkflow(null);
            setActivePage('agents');
          }}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] cursor-pointer transition-colors ${
            activePage === 'agents' ? 'text-[#FFB000]' : 'text-white/50 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Agents</span>
        </button>

        <button
          onClick={() => {
            setSelectedWorkflow(null);
            setActivePage('settings');
          }}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] cursor-pointer transition-colors ${
            activePage === 'settings' ? 'text-[#FFB000]' : 'text-white/50 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer
        toasts={enrichedToasts}
        onDismiss={store.dismissToast}
        executingWorkflow={store.executingWorkflow}
        isExecuting={store.isExecuting}
      />

      {/* Global Create Workflow Modal */}
      {isCreateModalOpen && (
        <div
          id="create-workflow-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0E1015] border border-white/[0.12] rounded-[24px] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-white/[0.06] text-[#FFB000] border border-white/[0.08]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Create New Workflow</h3>
                  <p className="text-xs text-white/50">Configure multi-agent pipeline parameters</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-white/70 uppercase tracking-wider text-[10px] font-mono">
                  Workflow Title
                </label>
                <input
                  type="text"
                  required
                  value={wfName}
                  onChange={(e) => setWfName(e.target.value)}
                  placeholder="e.g. Automated Invoice Reconciliation Pipeline"
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-white/70 uppercase tracking-wider text-[10px] font-mono">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={wfDesc}
                  onChange={(e) => setWfDesc(e.target.value)}
                  placeholder="Describe intent, constraints, and target outcomes..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-xl p-3 text-xs text-white placeholder:text-white/30 outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-white/70 uppercase tracking-wider text-[10px] font-mono">
                  Assign Workspace
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['support', 'finance', 'hr', 'operations'] as WorkspaceType[]).map((ws) => (
                    <button
                      key={ws}
                      type="button"
                      onClick={() => setWfWorkspace(ws)}
                      className={`py-2 px-2 rounded-xl font-semibold text-xs capitalize transition-all border cursor-pointer ${
                        wfWorkspace === ws
                          ? 'bg-[#FFB000] text-[#08090D] border-amber-300 shadow-sm'
                          : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {ws}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contextual Workflow Tip */}
              <WorkflowTipBanner workspace={wfWorkspace} />

              <div className="pt-4 flex items-center justify-end space-x-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary text-xs h-9 px-4"
                >
                  Cancel
                </button>
                <DeployButtonWithTip workspace={wfWorkspace} align="end">
                  <button
                    type="submit"
                    className="btn-primary text-xs h-9 px-4"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Deploy Workflow</span>
                  </button>
                </DeployButtonWithTip>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Policy Boundary Simulator Modal */}
      <PolicySimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        policyConfig={store.policyConfig}
        onUpdatePolicyConfig={store.updatePolicyConfig}
        onSavePolicy={store.updatePolicyConfig}
        onInjectCase={store.injectCustomCase}
        onInjectDemoCase={store.injectDemoCase}
        activeWorkspace={store.activeWorkspace}
      />

      {/* Step-by-Step DAG Execution Replay Theater Modal */}
      <ExecutionReplayTheaterModal
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
        caseItem={replayCase || store.cases[0]}
        onApprove={(id, notes) => {
          store.approveCase(id, notes);
          setIsReplayOpen(false);
        }}
        onReject={(id, notes) => {
          store.rejectCase(id, notes);
          setIsReplayOpen(false);
        }}
      />

      {/* SOC2 / ISO-27001 Cryptographic Governance Certificate Modal */}
      <GovernanceCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        caseData={certificateCase || store.cases.find((c) => c.status === 'approved') || store.cases[0]}
      />

      {/* 8-Agent Topological Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}

export default App;
