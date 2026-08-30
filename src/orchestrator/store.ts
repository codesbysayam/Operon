import { useState } from 'react';
import {
  ApprovalCase,
  WorkflowDefinition,
  AuditLogEntry,
  AnalyticsData,
  ExecutionMode,
  WorkspaceType,
  PolicyConfig,
  AgentInfo,
  ExecutingWorkflowState,
  Incident,
  PolicyVersion,
  PolicyConflictInfo,
  WorkflowTemplate,
  WorkflowVersion,
  HumanDecisionHistoryItem,
  NotificationItem,
  SavedCaseView,
} from '../types';
import { ToastNotification } from '../components/ToastContainer';
import {
  INITIAL_APPROVAL_CASES,
  INITIAL_WORKFLOWS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANALYTICS,
} from '../data/demoScenario';
import {
  INITIAL_SAVED_VIEWS,
  INITIAL_POLICY_VERSIONS,
  INITIAL_POLICY_CONFLICTS,
  INITIAL_INCIDENTS,
  WORKFLOW_TEMPLATES,
  INITIAL_DECISION_HISTORY,
  INITIAL_NOTIFICATIONS,
  calculatePriorityEngine,
} from '../data/advancedOpsData';
import { AGENT_WORKFORCE } from '../data/agentsAndSkills';

export interface AppStoreState {
  executionMode: ExecutionMode;
  setExecutionMode: (mode: ExecutionMode) => void;
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (ws: WorkspaceType) => void;
  policyConfig: PolicyConfig;
  updatePolicyConfig: (newConfig: Partial<PolicyConfig>) => void;
  agents: AgentInfo[];
  toggleAgentStatus: (agentId: string) => void;
  cases: ApprovalCase[];
  workflows: WorkflowDefinition[];
  auditLogs: AuditLogEntry[];
  analytics: AnalyticsData;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  approveCase: (caseId: string, notes?: string) => Promise<void>;
  rejectCase: (caseId: string, notes?: string) => Promise<void>;
  batchApproveCases: (caseIds: string[], notes?: string) => Promise<void>;
  batchRejectCases: (caseIds: string[], notes?: string) => Promise<void>;
  createWorkflow: (newWf: Partial<WorkflowDefinition>) => void;
  updateWorkflow: (id: string, updatedWf: Partial<WorkflowDefinition>) => void;
  triggerWorkflowRun: (workflowId: string, customInput?: string) => Promise<void>;
  cancelWorkflowRun: () => void;
  runScenario: (scenario: 'A' | 'B' | 'C') => Promise<void>;
  injectDemoCase: (
    workspace?: WorkspaceType,
    customData?:
      | {
          amount?: number;
          riskScore?: number;
          title?: string;
          customerName?: string;
        }
      | number
  ) => void;
  injectCustomCase: (customCaseData: {
    amount: number;
    riskScore: number;
    workspace: WorkspaceType;
    title: string;
    customerName: string;
  }) => void;
  resetDemoData: () => void;
  isExecuting: boolean;
  executingWorkflow: ExecutingWorkflowState | null;
  currentActiveCase: ApprovalCase | null;
  lastExecutedWorkflowId: string | null;

  // Advanced Operations State & Methods
  incidents: Incident[];
  createIncident: (incident: Partial<Incident>) => void;
  resolveIncident: (incidentId: string) => void;
  simulateChaos: (type: 'latency' | 'agent_crash' | 'policy_conflict' | 'sla_breach') => void;

  policyVersions: PolicyVersion[];
  policyConflicts: PolicyConflictInfo[];
  rollbackPolicyVersion: (versionStr: string) => void;
  publishPolicyVersion: (versionStr: string, newConfig: Partial<PolicyConfig>, name?: string) => void;

  workflowTemplates: WorkflowTemplate[];
  instantiateWorkflowTemplate: (templateId: string) => void;

  decisionHistory: HumanDecisionHistoryItem[];
  addDecisionHistory: (item: Omit<HumanDecisionHistoryItem, 'id' | 'timestamp'>) => void;

  savedViews: SavedCaseView[];
  activeSavedViewId: string;
  setActiveSavedViewId: (id: string) => void;
  addSavedView: (view: SavedCaseView) => void;
  deleteSavedView: (id: string) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  assignCase: (caseId: string, reviewer: string) => void;
  escalateCase: (caseId: string) => void;
  addCaseNote: (caseId: string, note: string) => void;
  reopenCase: (caseId: string) => void;
  bulkTagCases: (caseIds: string[], tag: string) => void;
}

export function useAppStore(): AppStoreState {
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('demo');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('support');
  const [policyConfig, setPolicyConfig] = useState<PolicyConfig>({
    autoRefundLimit: 100,
    fraudReviewThreshold: 30,
    fraudEscalationThreshold: 70,
    requireApprovalForPolicyExceptions: true,
    requireApprovalForHighValueInvoices: 1000,
    requireApprovalForAccessElevation: true,
  });

  const [agents, setAgents] = useState<AgentInfo[]>(AGENT_WORKFORCE);
  const [cases, setCases] = useState<ApprovalCase[]>(INITIAL_APPROVAL_CASES);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(INITIAL_WORKFLOWS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [analytics, setAnalytics] = useState<AnalyticsData>(INITIAL_ANALYTICS);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingWorkflow, setExecutingWorkflow] = useState<ExecutingWorkflowState | null>(null);
  const [currentActiveCase, setCurrentActiveCase] = useState<ApprovalCase | null>(INITIAL_APPROVAL_CASES[0]);
  const [lastExecutedWorkflowId, setLastExecutedWorkflowId] = useState<string | null>(null);
  const isCancelledRef = { current: false };

  // Advanced Operations Hooks
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [policyVersions, setPolicyVersions] = useState<PolicyVersion[]>(INITIAL_POLICY_VERSIONS);
  const [policyConflicts, setPolicyConflicts] = useState<PolicyConflictInfo[]>(INITIAL_POLICY_CONFLICTS);
  const [workflowTemplates] = useState<WorkflowTemplate[]>(WORKFLOW_TEMPLATES);
  const [decisionHistory, setDecisionHistory] = useState<HumanDecisionHistoryItem[]>(INITIAL_DECISION_HISTORY);
  const [savedViews, setSavedViews] = useState<SavedCaseView[]>(INITIAL_SAVED_VIEWS);
  const [activeSavedViewId, setActiveSavedViewId] = useState<string>('view-all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);


  const toggleAgentStatus = (agentId: string) => {
    setAgents((prev) =>
      prev.map((ag) => {
        if (ag.id === agentId) {
          const nextStatus = ag.status === 'active' ? 'idle' : 'active';
          return { ...ag, status: nextStatus };
        }
        return ag;
      })
    );
  };

  const addToast = (toastInput: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newToast: ToastNotification = {
      ...toastInput,
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updatePolicyConfig = (newConfig: Partial<PolicyConfig>) => {
    setPolicyConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      return updated;
    });
    addToast({
      title: 'Policy Configuration Saved',
      description: `Auto-refund threshold updated to $${newConfig.autoRefundLimit ?? policyConfig.autoRefundLimit}.00 limit.`,
      status: 'completed',
    });
  };

  const approveCase = async (caseId: string, notes?: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const amountStr = targetCase.amount ? `$${targetCase.amount.toFixed(2)}` : '$0.00';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedSteps = c.pipelineSteps.map((s) => {
            if (s.status === 'awaiting_approval') {
              return {
                ...s,
                status: 'completed' as const,
                output: `Human Approval Granted by Sayam Mukherjee (Operations Lead). ${notes ? 'Notes: ' + notes : ''}`,
                completedAt: nowTime,
              };
            }
            return s;
          });

          const hasExecutor = updatedSteps.some((s) => s.agentRole === 'executor');
          if (!hasExecutor) {
            const executorOutput =
              executionMode === 'live'
                ? `LIVE ACTION EXECUTED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Production Gateway. Immutable audit record sealed.`
                : executionMode === 'sandbox'
                ? `TEST ACTION EXECUTED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Stripe Test Mode. Invariants verified against sandbox ledger.`
                : `SIMULATED ACTION COMPLETED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Local Adapter. Zero external side effects.`;

            updatedSteps.push(
              {
                id: `p-exec-${Date.now()}`,
                agentRole: 'executor',
                agentName: 'Task Executor',
                stepName: 'Execute Operational Action',
                status: 'completed',
                input: `Execute transaction for ${c.caseNumber} (${amountStr}) [${executionMode.toUpperCase()}]`,
                output: executorOutput,
                confidenceScore: 99,
                latencyMs: 480,
                completedAt: nowTime,
              },
              {
                id: `p-test-${Date.now()}`,
                agentRole: 'tester',
                agentName: 'Validation Tester',
                stepName: 'Verify Invariants & Finalize',
                status: 'completed',
                input: `Validate response & post-execution state for ${c.caseNumber}`,
                output:
                  executionMode === 'live'
                    ? 'Production invariant check PASSED. Post-execution ledger & customer record sealed.'
                    : executionMode === 'sandbox'
                    ? 'Sandbox invariant check PASSED. Test API response code 200 OK. Mock ledger updated.'
                    : 'Simulation invariant check PASSED. Deterministic dry-run verified. Zero external side effects.',
                confidenceScore: 100,
                latencyMs: 190,
                completedAt: nowTime,
              }
            );
          }

          return {
            ...c,
            status: 'approved' as const,
            pipelineSteps: updatedSteps,
          };
        }
        return c;
      })
    );

    const timestamp = nowTime;
    const newLogs: AuditLogEntry[] = [
      {
        id: `log-${Date.now()}-1`,
        caseId: caseId,
        workspace: targetCase.workspace,
        event: 'Human Gate Approved',
        actor: 'Sayam Mukherjee (Operations Lead)',
        details: `Human authorization granted for ${targetCase.caseNumber} (${amountStr}). ${notes ? 'Note: ' + notes : ''}`,
        timestamp,
        mode: executionMode,
        status: 'success',
        immutableHash: `sha256:h_appr_${Math.random().toString(36).substr(2, 8)}`,
        ruleTriggered: 'HUMAN_AUTHORIZATION_SIGN_OFF',
        executionDurationMs: 38,
      },
      {
        id: `log-${Date.now()}-2`,
        caseId: caseId,
        workspace: targetCase.workspace,
        event: 'Task Executor Action Complete',
        agentRole: 'executor',
        actor: 'Task Executor',
        details: `ACTION EXECUTED — Processed ${targetCase.type.replace('_', ' ')} (${amountStr}) for ${targetCase.customerName}. Mode: ${executionMode.toUpperCase()}.`,
        timestamp,
        mode: executionMode,
        status: 'success',
        immutableHash: `sha256:exec_${Math.random().toString(36).substr(2, 8)}`,
        executionDurationMs: 480,
      },
      {
        id: `log-${Date.now()}-3`,
        caseId: caseId,
        workspace: targetCase.workspace,
        event: 'Validation Verification Passed',
        agentRole: 'tester',
        actor: 'Validation Tester',
        details: `Invariant check passed. Workflow pipeline finalized and sealed for ${targetCase.caseNumber}.`,
        timestamp,
        mode: executionMode,
        status: 'success',
        immutableHash: `sha256:seal_${Math.random().toString(36).substr(2, 8)}`,
        executionDurationMs: 190,
      },
    ];

    setAuditLogs((prev) => [...newLogs, ...prev]);

    // Record human decision history
    const decisionItem: HumanDecisionHistoryItem = {
      id: `dec-${Date.now()}`,
      reviewerName: 'Sayam Mukherjee',
      reviewerRole: 'Operations Lead',
      decision: 'APPROVED',
      caseNumber: targetCase.caseNumber,
      caseTitle: targetCase.title,
      amount: targetCase.amount || 0,
      reason: notes || `Human authorization granted for ${amountStr}. All invariants verified.`,
      timestamp: `${nowTime} UTC`,
      immutableHash: `sha256:dec_appr_${targetCase.caseNumber.toLowerCase()}`,
      isOverride: false,
    };
    setDecisionHistory((prev) => [decisionItem, ...prev]);

    setAnalytics((prev) => ({
      ...prev,
      casesAutomated: prev.casesAutomated + 1,
      costSavedUSD: prev.costSavedUSD + (targetCase.amount || 50),
      verifiedActionsCount: (prev.verifiedActionsCount || 1284) + 1,
    }));

    addToast({
      title: 'Human Gate Approved & Executed',
      description: `${targetCase.caseNumber}: Action executed (${amountStr}). Invariants verified & audit sealed.`,
      status: 'completed',
      caseNumber: targetCase.caseNumber,
    });
  };

  const rejectCase = async (caseId: string, notes?: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedSteps = c.pipelineSteps.map((s) => {
            if (s.status === 'awaiting_approval') {
              return {
                ...s,
                status: 'failed' as const,
                output: `Human Approval Rejected by Sayam Mukherjee (Operations Lead). ${notes ? 'Reason: ' + notes : 'Policy criteria not met.'}`,
                completedAt: nowTime,
              };
            }
            return s;
          });

          const hasBlockStep = updatedSteps.some((s) => s.stepName === 'Pipeline Permanently Blocked');
          if (!hasBlockStep) {
            updatedSteps.push({
              id: `p-block-${Date.now()}`,
              agentRole: 'release_guardian',
              agentName: 'Release Guardian',
              stepName: 'Pipeline Permanently Blocked',
              status: 'failed',
              input: `Enforce rejection barrier for ${c.caseNumber}`,
              output: `PIPELINE PERMANENTLY BLOCKED — Action halted by Operations Lead (${notes ? 'Reason: ' + notes : 'Policy criteria rejected'}). Zero execution or mutation permitted. Audit record sealed.`,
              confidenceScore: 100,
              latencyMs: 35,
              completedAt: nowTime,
            });
          }

          return {
            ...c,
            status: 'rejected' as const,
            pipelineSteps: updatedSteps,
          };
        }
        return c;
      })
    );

    const timestamp = nowTime;
    const newLogs: AuditLogEntry[] = [
      {
        id: `log-${Date.now()}-1`,
        caseId: caseId,
        workspace: targetCase.workspace,
        event: 'Human Gate Rejected',
        actor: 'Sayam Mukherjee (Operations Lead)',
        details: `Human authorization REJECTED for ${targetCase.caseNumber}. ${notes ? 'Reason: ' + notes : 'Policy criteria rejected.'}`,
        timestamp,
        mode: executionMode,
        status: 'warning',
        immutableHash: `sha256:rej_${Math.random().toString(36).substr(2, 8)}`,
        ruleTriggered: 'HUMAN_AUTHORIZATION_REJECTED',
        executionDurationMs: 40,
      },
      {
        id: `log-${Date.now()}-2`,
        caseId: caseId,
        workspace: targetCase.workspace,
        event: 'Pipeline Execution Permanently Blocked',
        agentRole: 'release_guardian',
        actor: 'Release Guardian',
        details: `Workflow execution permanently blocked for ${targetCase.caseNumber}. No financial or database mutation performed. Logged in immutable audit trail.`,
        timestamp,
        mode: executionMode,
        status: 'error',
        immutableHash: `sha256:block_${Math.random().toString(36).substr(2, 8)}`,
        ruleTriggered: 'RELEASE_GUARDIAN_BARRIER_ENFORCED',
        executionDurationMs: 35,
      },
    ];

    setAuditLogs((prev) => [...newLogs, ...prev]);

    // Record human decision history
    const decisionItem: HumanDecisionHistoryItem = {
      id: `dec-${Date.now()}`,
      reviewerName: 'Sayam Mukherjee',
      reviewerRole: 'Operations Lead',
      decision: 'REJECTED',
      caseNumber: targetCase.caseNumber,
      caseTitle: targetCase.title,
      amount: targetCase.amount || 0,
      reason: notes || 'Rejected per policy violation. Pipeline execution halted.',
      timestamp: `${nowTime} UTC`,
      immutableHash: `sha256:dec_rej_${targetCase.caseNumber.toLowerCase()}`,
      isOverride: false,
    };
    setDecisionHistory((prev) => [decisionItem, ...prev]);

    setAnalytics((prev) => ({
      ...prev,
      policyBlocksCount: (prev.policyBlocksCount || 17) + 1,
    }));

    addToast({
      title: 'Human Gate Rejected — Pipeline Permanently Blocked',
      description: `${targetCase.caseNumber}: Case rejected by Human Lead. Pipeline execution safely blocked & logged.`,
      status: 'failed',
      caseNumber: targetCase.caseNumber,
    });
  };

  const batchApproveCases = async (caseIds: string[], notes?: string) => {
    if (!caseIds || caseIds.length === 0) return;
    const targetCases = cases.filter((c) => caseIds.includes(c.id) && c.status === 'pending');
    if (targetCases.length === 0) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const totalAmount = targetCases.reduce((sum, c) => sum + (c.amount || 0), 0);

    setCases((prev) =>
      prev.map((c) => {
        if (caseIds.includes(c.id) && c.status === 'pending') {
          const amountStr = c.amount ? `$${c.amount.toFixed(2)}` : '$0.00';
          const updatedSteps = c.pipelineSteps.map((s) => {
            if (s.status === 'awaiting_approval') {
              return {
                ...s,
                status: 'completed' as const,
                output: `Human Batch Approval Granted by Sayam Mukherjee (Operations Lead). ${notes ? 'Notes: ' + notes : ''}`,
                completedAt: nowTime,
              };
            }
            return s;
          });

          const hasExecutor = updatedSteps.some((s) => s.agentRole === 'executor');
          if (!hasExecutor) {
            const executorOutput =
              executionMode === 'live'
                ? `LIVE BATCH ACTION EXECUTED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Production Gateway. Immutable audit sealed.`
                : executionMode === 'sandbox'
                ? `TEST BATCH ACTION EXECUTED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Stripe Test Mode. Invariants verified.`
                : `SIMULATED BATCH ACTION COMPLETED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Batch Execution Adapter. Zero external side effects.`;

            updatedSteps.push(
              {
                id: `p-exec-${Date.now()}-${c.id}`,
                agentRole: 'executor',
                agentName: 'Task Executor',
                stepName: 'Execute Operational Action',
                status: 'completed',
                input: `Batch execute transaction for ${c.caseNumber} (${amountStr}) [${executionMode.toUpperCase()}]`,
                output: executorOutput,
                confidenceScore: 99,
                latencyMs: 440,
                completedAt: nowTime,
              },
              {
                id: `p-test-${Date.now()}-${c.id}`,
                agentRole: 'tester',
                agentName: 'Validation Tester',
                stepName: 'Verify Invariants & Finalize',
                status: 'completed',
                input: `Validate batch response for ${c.caseNumber}`,
                output:
                  executionMode === 'live'
                    ? 'Production invariant check PASSED. Post-execution ledger & customer record sealed.'
                    : executionMode === 'sandbox'
                    ? 'Sandbox invariant check PASSED. Test API response code 200 OK. Mock ledger updated.'
                    : 'Simulation invariant check PASSED. Deterministic dry-run verified. Zero external side effects.',
                confidenceScore: 100,
                latencyMs: 180,
                completedAt: nowTime,
              }
            );
          }

          return {
            ...c,
            status: 'approved' as const,
            pipelineSteps: updatedSteps,
          };
        }
        return c;
      })
    );

    const timestamp = nowTime;
    const newLogs: AuditLogEntry[] = [];
    targetCases.forEach((tc, idx) => {
      const amountStr = tc.amount ? `$${tc.amount.toFixed(2)}` : '$0.00';
      newLogs.push({
        id: `log-batch-appr-${Date.now()}-${idx}-1`,
        caseId: tc.id,
        workspace: tc.workspace,
        event: 'Human Gate Batch Approved',
        actor: 'Sayam Mukherjee (Operations Lead)',
        details: `Batch authorization granted for ${tc.caseNumber} (${amountStr}). ${notes ? 'Note: ' + notes : ''}`,
        timestamp,
        mode: executionMode,
        status: 'success',
        immutableHash: `sha256:batch_appr_${tc.caseNumber.toLowerCase()}`,
      });
      newLogs.push({
        id: `log-batch-appr-${Date.now()}-${idx}-2`,
        caseId: tc.id,
        workspace: tc.workspace,
        event: 'Task Executor Action Complete',
        agentRole: 'executor',
        actor: 'Task Executor',
        details: `BATCH ACTION EXECUTED — Processed ${tc.type.replace('_', ' ')} (${amountStr}) for ${tc.customerName}.`,
        timestamp,
        mode: executionMode,
        status: 'success',
        immutableHash: `sha256:batch_exec_${tc.caseNumber.toLowerCase()}`,
      });
    });

    setAuditLogs((prev) => [...newLogs, ...prev]);

    setAnalytics((prev) => ({
      ...prev,
      casesAutomated: prev.casesAutomated + targetCases.length,
      costSavedUSD: prev.costSavedUSD + totalAmount,
      verifiedActionsCount: (prev.verifiedActionsCount || 1284) + targetCases.length,
    }));

    addToast({
      title: `Batch Approved: ${targetCases.length} Cases`,
      description: `Successfully approved and executed ${targetCases.length} pending cases ($${totalAmount.toFixed(2)} total value).`,
      status: 'completed',
    });
  };

  const batchRejectCases = async (caseIds: string[], notes?: string) => {
    if (!caseIds || caseIds.length === 0) return;
    const targetCases = cases.filter((c) => caseIds.includes(c.id) && c.status === 'pending');
    if (targetCases.length === 0) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setCases((prev) =>
      prev.map((c) => {
        if (caseIds.includes(c.id) && c.status === 'pending') {
          const updatedSteps = c.pipelineSteps.map((s) => {
            if (s.status === 'awaiting_approval') {
              return {
                ...s,
                status: 'failed' as const,
                output: `Human Batch Rejection by Sayam Mukherjee (Operations Lead). ${notes ? 'Reason: ' + notes : 'Policy criteria not met.'}`,
                completedAt: nowTime,
              };
            }
            return s;
          });

          const hasBlockStep = updatedSteps.some((s) => s.stepName === 'Pipeline Permanently Blocked');
          if (!hasBlockStep) {
            updatedSteps.push({
              id: `p-block-${Date.now()}-${c.id}`,
              agentRole: 'release_guardian',
              agentName: 'Release Guardian',
              stepName: 'Pipeline Permanently Blocked',
              status: 'failed',
              input: `Enforce rejection barrier for ${c.caseNumber}`,
              output: `PIPELINE PERMANENTLY BLOCKED — Action halted by Operations Lead during batch reject (${notes ? 'Reason: ' + notes : 'Policy criteria rejected'}). Zero execution or mutation permitted. Audit record sealed.`,
              confidenceScore: 100,
              latencyMs: 35,
              completedAt: nowTime,
            });
          }

          return {
            ...c,
            status: 'rejected' as const,
            pipelineSteps: updatedSteps,
          };
        }
        return c;
      })
    );

    const timestamp = nowTime;
    const newLogs: AuditLogEntry[] = [];
    targetCases.forEach((tc, idx) => {
      newLogs.push({
        id: `log-batch-rej-${Date.now()}-${idx}-1`,
        caseId: tc.id,
        workspace: tc.workspace,
        event: 'Human Gate Batch Rejected',
        actor: 'Sayam Mukherjee (Operations Lead)',
        details: `Batch authorization REJECTED for ${tc.caseNumber}. ${notes ? 'Reason: ' + notes : 'Batch policy rejection.'}`,
        timestamp,
        mode: executionMode,
        status: 'warning',
        immutableHash: `sha256:batch_rej_${tc.caseNumber.toLowerCase()}`,
      });
      newLogs.push({
        id: `log-batch-rej-${Date.now()}-${idx}-2`,
        caseId: tc.id,
        workspace: tc.workspace,
        event: 'Pipeline Execution Permanently Blocked',
        agentRole: 'release_guardian',
        actor: 'Release Guardian',
        details: `Workflow execution permanently blocked for ${tc.caseNumber} via batch operation.`,
        timestamp,
        mode: executionMode,
        status: 'error',
        immutableHash: `sha256:batch_block_${tc.caseNumber.toLowerCase()}`,
      });
    });

    setAuditLogs((prev) => [...newLogs, ...prev]);

    setAnalytics((prev) => ({
      ...prev,
      policyBlocksCount: (prev.policyBlocksCount || 17) + targetCases.length,
    }));

    addToast({
      title: `Batch Rejected: ${targetCases.length} Cases`,
      description: `${targetCases.length} pending cases rejected and permanently blocked per policy.`,
      status: 'failed',
    });
  };

  const createWorkflow = (newWf: Partial<WorkflowDefinition>) => {
    const fullWf: WorkflowDefinition = {
      id: `wf-custom-${Date.now()}`,
      name: newWf.name || 'New Custom Workflow',
      description: newWf.description || 'Custom agent workflow pipeline',
      workspace: newWf.workspace || activeWorkspace,
      status: 'active',
      triggerType: newWf.triggerType || 'webhook',
      totalRuns: 1,
      automationRate: 100.0,
      avgDurationSeconds: 42,
      pipeline: newWf.pipeline || [
        {
          id: `p-${Date.now()}-1`,
          agentRole: 'analyst',
          agentName: 'Intent Analyst',
          stepName: 'Intent Extraction',
          status: 'completed',
        },
        {
          id: `p-${Date.now()}-2`,
          agentRole: 'planner',
          agentName: 'Workflow Planner',
          stepName: 'Policy Validation',
          status: 'completed',
        },
        {
          id: `p-${Date.now()}-3`,
          agentRole: 'release_guardian',
          agentName: 'Release Guardian',
          stepName: 'Policy Gate Check',
          status: 'awaiting_approval',
        },
      ],
    };

    setWorkflows((prev) => [fullWf, ...prev]);

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      workflowId: fullWf.id,
      event: 'Workflow Created',
      actor: 'System Admin',
      details: `Workflow "${fullWf.name}" deployed in workspace [${fullWf.workspace.toUpperCase()}].`,
      timestamp: 'Just now',
      mode: executionMode,
      status: 'info',
      immutableHash: `sha256:wf_create_${fullWf.id}`,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    addToast({
      title: 'Workflow Created',
      description: `Workflow "${fullWf.name}" deployed in ${fullWf.workspace.toUpperCase()} workspace.`,
      status: 'completed',
      workflowName: fullWf.name,
    });
  };

  const updateWorkflow = (id: string, updatedWf: Partial<WorkflowDefinition>) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updatedWf } : w))
    );
    addToast({
      title: 'Pipeline Saved & Persisted',
      description: `Saved changes to "${updatedWf.name || id}".`,
      status: 'completed',
    });
  };

  const cancelWorkflowRun = () => {
    isCancelledRef.current = true;
    setIsExecuting(false);
    setExecutingWorkflow(null);
    addToast({
      title: 'Workflow Run Cancelled',
      description: 'Execution stopped by operator.',
      status: 'pending',
    });
  };

  const triggerWorkflowRun = async (workflowId: string, customInput?: string) => {
    isCancelledRef.current = false;
    setIsExecuting(true);

    const targetWf = workflows.find((w) => w.id === workflowId) || workflows[0];
    const newCaseId = `case-${Date.now()}`;
    const newCaseNumber =
      targetWf.workspace === 'finance'
        ? `FIN-${Math.floor(1000 + Math.random() * 900)}`
        : targetWf.workspace === 'hr'
        ? `HR-${Math.floor(3000 + Math.random() * 900)}`
        : targetWf.workspace === 'operations'
        ? `OPS-${Math.floor(7000 + Math.random() * 900)}`
        : `CS-${Math.floor(2000 + Math.random() * 900)}`;

    // Parse requested amount from input or default
    let detectedAmount = 249.0;
    if (customInput) {
      const match = customInput.match(/\$?(\d+(\.\d+)?)/);
      if (match) {
        detectedAmount = parseFloat(match[1]);
      }
    }

    const requiresHumanApproval = detectedAmount > policyConfig.autoRefundLimit;
    const totalPipelineSteps = targetWf.pipeline.length;

    // Set initial execution state for live visual feedback
    setExecutingWorkflow({
      workflowId: targetWf.id,
      workflowName: targetWf.name,
      caseNumber: newCaseNumber,
      currentStepName: 'Initializing Multi-Agent Pipeline',
      currentStepIndex: 1,
      totalSteps: totalPipelineSteps,
      progress: 15,
      mode: executionMode,
      workspace: targetWf.workspace,
      activeAgentName: targetWf.pipeline[0]?.agentName || 'Intent Analyst',
      activeAgentRole: targetWf.pipeline[0]?.agentRole || 'analyst',
      statusText: 'Initializing execution graph & verifying safety invariants...',
    });

    let liveReasoning = [
      'Multi-agent pipeline evaluated customer intent, churn history, and transaction logs.',
      'Customer tenure and positive account standing verified.',
      requiresHumanApproval
        ? `Enforced policy threshold ($${policyConfig.autoRefundLimit} limit); routed to Human Approval Gate.`
        : `Amount ($${detectedAmount}) within auto-approve cap ($${policyConfig.autoRefundLimit}). Eligible for autonomous execution.`,
    ];
    let liveConfidence = 92;
    let liveRisk = 18;
    let liveAction: 'APPROVE' | 'REJECT' = 'APPROVE';
    let liveSummary = customInput || `Live Trigger: ${targetWf.name}`;

    if (executionMode === 'live') {
      try {
        const res = await fetch('/api/gemini/orchestrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payload: customInput || `${targetWf.name}: ${targetWf.description}`,
            workspace: targetWf.workspace,
            policyLimit: policyConfig.autoRefundLimit,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reasoning) liveReasoning = data.reasoning;
          if (data.overallConfidence) liveConfidence = data.overallConfidence;
          if (data.riskScore) liveRisk = data.riskScore;
          if (data.recommendedAction) liveAction = data.recommendedAction;
          liveSummary = `[OPERON LIVE] ${customInput || targetWf.description}`;
        }
      } catch (err) {
        console.warn('Live API request fell back to local orchestrator logic:', err);
        liveSummary = `[OPERON LIVE] ${customInput || targetWf.description}`;
      }
    } else if (executionMode === 'sandbox') {
      liveSummary = `[OPERON SANDBOX] ${customInput || targetWf.description}`;
    } else {
      liveSummary = `[OPERON DEMO] ${customInput || targetWf.description}`;
    }

    const initialCase: ApprovalCase = {
      id: newCaseId,
      caseNumber: newCaseNumber,
      customerName: 'Elena Rostova',
      customerEmail: 'elena.rostova@enterprise-corp.com',
      workspace: targetWf.workspace,
      title: customInput || `Trigger Run: ${targetWf.name}`,
      summary: liveSummary,
      amount: detectedAmount,
      type: 'REFUND_REQUEST',
      confidenceScore: liveConfidence,
      riskScore: liveRisk,
      recommendedAction: liveAction,
      reasoning: liveReasoning,
      agentConsensus: [
        { agent: 'Intent Analyst', score: 99, verdict: 'Intent parsed & verified' },
        { agent: 'Context Memory', score: 98, verdict: 'Historical account standing validated' },
        { agent: 'Fraud Sentinel', score: 96, verdict: `Risk score ${liveRisk}/100 (LOW)` },
        { agent: 'Workflow Planner', score: 95, verdict: 'Policy evaluation calculated' },
        { agent: 'Release Guardian', score: 92, verdict: requiresHumanApproval ? 'Enforced $100 cap -> Human Gate' : 'Autonomous execution allowed' },
      ],
      status: 'pending',
      timestamp: 'Just now',
      pipelineSteps: targetWf.pipeline.map((step) => ({
        ...step,
        status: 'pending',
      })),
    };

    setCurrentActiveCase(initialCase);
    setCases((prev) => [initialCase, ...prev]);

    // Progressive agent execution simulation
    const stepDelay = executionMode === 'live' ? 420 : 300;
    try {
      for (let i = 0; i < initialCase.pipelineSteps.length; i++) {
        if (isCancelledRef.current) break;

        const currentStep = initialCase.pipelineSteps[i];
        const stepProgress = Math.min(95, Math.round(((i + 0.8) / totalPipelineSteps) * 100));

        setExecutingWorkflow({
          workflowId: targetWf.id,
          workflowName: targetWf.name,
          caseNumber: newCaseNumber,
          currentStepName: currentStep.stepName,
          currentStepIndex: i + 1,
          totalSteps: totalPipelineSteps,
          progress: stepProgress,
          mode: executionMode,
          workspace: targetWf.workspace,
          activeAgentName: currentStep.agentName,
          activeAgentRole: currentStep.agentRole,
          statusText: `Agent Step ${i + 1} of ${totalPipelineSteps}: ${currentStep.stepName} (${currentStep.agentName})`,
        });

        await new Promise((resolve) => setTimeout(resolve, stepDelay));
        if (isCancelledRef.current) break;

        setCases((prev) =>
          prev.map((c) => {
            if (c.id === newCaseId) {
              const updatedSteps = c.pipelineSteps.map((s, idx) => {
                if (idx === i) {
                  const isGate = s.agentRole === 'release_guardian' && requiresHumanApproval;
                  return {
                    ...s,
                    status: isGate ? ('awaiting_approval' as const) : ('completed' as const),
                    confidenceScore: Math.min(99, liveConfidence + idx),
                    output: isGate
                      ? `Policy Threshold Exceeded ($${detectedAmount} > $${policyConfig.autoRefundLimit}). Paused at Human Gate.`
                      : executionMode === 'live'
                      ? `LIVE ACTION EXECUTED — Processed via Production Adapters. Verified against invariant ledger.`
                      : executionMode === 'sandbox'
                      ? `TEST ACTION EXECUTED — Processed in sandbox test ledger. Response: OK 200.`
                      : `SIMULATED ACTION COMPLETED — Processed in DEMO simulation (zero external side effects).`,
                    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  };
                }
                if (idx === i + 1 && !(c.pipelineSteps[i]?.agentRole === 'release_guardian' && requiresHumanApproval)) {
                  return { ...s, status: 'running' as const };
                }
                return s;
              });
              return { ...c, pipelineSteps: updatedSteps };
            }
            return c;
          })
        );

        if (currentStep.agentRole === 'release_guardian' && requiresHumanApproval) {
          break; // Stop at human gate
        }
      }

      if (isCancelledRef.current) return;

      // Final progress update
      setExecutingWorkflow({
        workflowId: targetWf.id,
        workflowName: targetWf.name,
        caseNumber: newCaseNumber,
        currentStepName: requiresHumanApproval ? 'Human Approval Gate Active' : 'Pipeline Finalized',
        currentStepIndex: totalPipelineSteps,
        totalSteps: totalPipelineSteps,
        progress: 100,
        mode: executionMode,
        workspace: targetWf.workspace,
        activeAgentName: 'Release Guardian',
        statusText: requiresHumanApproval
          ? 'Hard Boundary Triggered: Human Review Required'
          : 'All Automated Invariants Verified Successfully',
      });

      // Update workflow runs
      setWorkflows((prev) =>
        prev.map((w) => (w.id === targetWf.id ? { ...w, totalRuns: (w.totalRuns || 0) + 1 } : w))
      );
      setLastExecutedWorkflowId(targetWf.id);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const runLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        caseId: newCaseId,
        workflowId: targetWf.id,
        event: requiresHumanApproval
          ? 'Policy Gate Triggered: Human Review Required'
          : `Workflow Pipeline Completed (${executionMode.toUpperCase()})`,
        actor: 'Release Guardian',
        details: requiresHumanApproval
          ? `Disbursement of $${detectedAmount}.00 exceeds $${policyConfig.autoRefundLimit} limit. Paused in Human Decision Center.`
          : `Executed multi-agent pipeline for ${newCaseNumber}. Route: Analyst -> Memory -> Fraud Sentinel -> Planner -> Guardian -> Executor.`,
        timestamp: 'Just now',
        mode: executionMode,
        status: requiresHumanApproval ? 'warning' : 'success',
        immutableHash: `sha256:wf_run_${Math.random().toString(36).substr(2, 8)}`,
        ruleTriggered: requiresHumanApproval ? 'RULE_AUTO_REFUND_LIMIT' : 'RULE_AUTONOMOUS_APPROVED',
      };

      setAuditLogs((prev) => [runLog, ...prev]);

      addToast({
        title: `Workflow Execution ${requiresHumanApproval ? 'Gate Reached' : 'Completed'}`,
        description: `${newCaseNumber}: "${targetWf.name}" finished run (${executionMode.toUpperCase()} mode). ${
          requiresHumanApproval
            ? `Amount $${detectedAmount} > $${policyConfig.autoRefundLimit} limit; routed to human approvals.`
            : 'All agent tasks completed automatically.'
        }`,
        status: requiresHumanApproval ? 'pending' : 'completed',
        workflowName: targetWf.name,
        caseNumber: newCaseNumber,
        actionLabel: requiresHumanApproval ? 'Review Gate Approval' : 'View Audit Trail',
      });
    } finally {
      setIsExecuting(false);
      setExecutingWorkflow(null);
    }
  };

  const runScenario = async (scenario: 'A' | 'B' | 'C') => {
    if (scenario === 'A') {
      await triggerWorkflowRun('wf-support-refund', 'Customer requesting $45.00 refund for minor downtime event.');
    } else if (scenario === 'B') {
      await triggerWorkflowRun('wf-support-refund', 'Customer Elena Rostova requesting $249.00 duplicate charge refund.');
    } else if (scenario === 'C') {
      await triggerWorkflowRun('wf-support-refund', 'Late cancellation request for $129.00 (22 days post-purchase).');
    }
  };

  const injectDemoCase = (
    targetWs?: WorkspaceType,
    customData?:
      | {
          amount?: number;
          riskScore?: number;
          title?: string;
          customerName?: string;
        }
      | number
  ) => {
    const ws = targetWs || activeWorkspace;
    const demoId = `demo-${Date.now()}`;
    const demoNumber =
      ws === 'finance'
        ? `FIN-${Math.floor(5000 + Math.random() * 900)}`
        : ws === 'hr'
        ? `HR-${Math.floor(6000 + Math.random() * 900)}`
        : ws === 'operations'
        ? `OPS-${Math.floor(8000 + Math.random() * 900)}`
        : `CS-${Math.floor(4000 + Math.random() * 900)}`;

    const amount =
      typeof customData === 'number'
        ? customData
        : customData?.amount !== undefined
        ? customData.amount
        : 320.0;
    const riskScore =
      typeof customData === 'object' && customData?.riskScore !== undefined
        ? customData.riskScore
        : 24;
    const title =
      typeof customData === 'object' && customData?.title
        ? customData.title
        : `Demo Test Escalation ($${amount.toFixed(2)}) in ${ws.toUpperCase()}`;
    const customerName =
      typeof customData === 'object' && customData?.customerName
        ? customData.customerName
        : 'Sayam Mukherjee (Demo Test)';

    const newDemoCase: ApprovalCase = {
      id: demoId,
      caseNumber: demoNumber,
      customerName,
      customerEmail: 'sayam.mukherjee@enterprise-demo.io',
      workspace: ws,
      title,
      summary: `Quick prototype escalation case injected in DEMO mode to verify approval gates and real-time badge sync.`,
      amount,
      type: 'POLICY_EXCEPTION',
      confidenceScore: 85,
      riskScore,
      recommendedAction: riskScore >= 70 ? 'REJECT' : 'APPROVE',
      agentConsensus: [
        { agent: 'Intent Analyst', score: 95, verdict: 'Prototype test payload parsed' },
        { agent: 'Workflow Planner', score: 88, verdict: 'Threshold cap checked' },
        { agent: 'Release Guardian', score: 85, verdict: 'Human authorization required' },
      ],
      reasoning: [
        'Demo scenario generated for instant authorization review.',
        `Policy gate active: amount ($${amount.toFixed(2)}) threshold check with Release Guardian.`,
        'Verify real-time badge updates in sidebar and header notification bell.',
      ],
      status: 'pending',
      timestamp: 'Just now',
      pipelineSteps: [
        {
          id: 'step-1',
          agentRole: 'analyst',
          agentName: 'Intent Analyst',
          stepName: 'Demo Intent Parsing',
          status: 'completed',
          input: 'Prototype test payload',
          output: `Classified: High value exception ($${amount.toFixed(2)})`,
          confidenceScore: 95,
        },
        {
          id: 'step-2',
          agentRole: 'release_guardian',
          agentName: 'Release Guardian',
          stepName: 'Policy Gate Sign-off',
          status: 'awaiting_approval',
          input: `Amount check vs policy cap`,
          output: 'Awaiting human authorization',
          confidenceScore: 85,
        },
      ],
    };

    setCases((prev) => [newDemoCase, ...prev]);

    addToast({
      title: 'Demo Approval Case Injected',
      description: `Injected case ${demoNumber} ($${amount.toFixed(2)}) into ${ws.toUpperCase()} approval queue.`,
      status: 'pending',
      caseNumber: demoNumber,
    });
  };

  const injectCustomCase = (customCaseData: {
    amount: number;
    riskScore: number;
    workspace: WorkspaceType;
    title: string;
    customerName: string;
  }) => {
    injectDemoCase(customCaseData.workspace, customCaseData);
  };

  const resetDemoData = () => {
    setCases(INITIAL_APPROVAL_CASES);
    setWorkflows(INITIAL_WORKFLOWS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAnalytics(INITIAL_ANALYTICS);
    setIncidents(INITIAL_INCIDENTS);
    setPolicyVersions(INITIAL_POLICY_VERSIONS);
    setPolicyConflicts(INITIAL_POLICY_CONFLICTS);
    setDecisionHistory(INITIAL_DECISION_HISTORY);
    setSavedViews(INITIAL_SAVED_VIEWS);
    setNotifications(INITIAL_NOTIFICATIONS);
    addToast({
      title: 'Demo State Reset',
      description: 'Reset all workflows, approval cases, policy engines, and audit logs to initial clean state.',
      status: 'completed',
    });
  };

  // Advanced Operations Implementations
  const createIncident = (incidentData: Partial<Incident>) => {
    const newInc: Incident = {
      id: `inc-${Date.now()}`,
      incidentNumber: `INC-${Math.floor(10 + Math.random() * 90)}`,
      title: incidentData.title || 'Automated Anomaly Alert',
      severity: incidentData.severity || 'MEDIUM',
      status: incidentData.status || 'INVESTIGATING',
      detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
      affectedWorkflows: incidentData.affectedWorkflows || ['Customer Support Refund Automation'],
      agents: incidentData.agents || ['Fraud & Anomaly Sentinel'],
      summary: incidentData.summary || 'Operational alert raised by autonomous monitoring sentry.',
      eventCorrelationChain: incidentData.eventCorrelationChain || [
        { time: '00:00.000', stage: 'Alert Detected', status: 'warning', detail: 'Automated monitor flagged metric variance' },
        { time: '00:01.200', stage: 'Sentry Containment', status: 'info', detail: 'Recovery Sentry isolated the execution thread' },
      ],
    };
    setIncidents((prev) => [newInc, ...prev]);
    addToast({
      title: `Incident Created: ${newInc.incidentNumber}`,
      description: newInc.title,
      status: 'pending',
    });
  };

  const resolveIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'RESOLVED' as const,
              eventCorrelationChain: [
                ...inc.eventCorrelationChain,
                {
                  time: 'Just now',
                  stage: 'Human Mitigation',
                  status: 'ok',
                  detail: 'Incident marked as RESOLVED by Sayam Mukherjee (Operations Lead)',
                },
              ],
            }
          : inc
      )
    );
    addToast({
      title: 'Incident Resolved',
      description: `Incident marked as resolved. Health metrics stabilized.`,
      status: 'completed',
    });
  };

  const simulateChaos = (type: 'latency' | 'agent_crash' | 'policy_conflict' | 'sla_breach') => {
    if (type === 'latency') {
      createIncident({
        title: 'Chaos Test: Simulated 4,500ms Network Latency Spike',
        severity: 'MEDIUM',
        status: 'INVESTIGATING',
        summary: 'Injected artificial latency into Fraud Sentinel vector retrieval endpoint. Automatic fallback activated.',
        agents: ['Fraud & Anomaly Sentinel', 'Recovery Sentry'],
        eventCorrelationChain: [
          { time: '00:00.000', stage: 'Fault Injected', status: 'warning', detail: 'Synthetic 4,500ms delay triggered by Operator' },
          { time: '00:04.500', stage: 'Circuit Breaker', status: 'error', detail: 'Gateway timeout intercepted' },
          { time: '00:04.600', stage: 'Safe Fallback', status: 'info', detail: 'Gracefully degraded to local rule-based engine' },
          { time: '00:04.700', stage: 'Human Escalation', status: 'ok', detail: 'Safely paused at Release Guardian human gate' },
        ],
      });
    } else if (type === 'agent_crash') {
      createIncident({
        title: 'Chaos Test: Intent Analyst Process Failure',
        severity: 'HIGH',
        status: 'INVESTIGATING',
        summary: 'Synthetic memory fault injected into Intent Analyst worker node. Recovery Sentry restarted container within 1.2s.',
        agents: ['Intent Analyst', 'Recovery Sentry'],
        eventCorrelationChain: [
          { time: '00:00.000', stage: 'SIGSEGV Injected', status: 'error', detail: 'Intent Analyst node worker crashed' },
          { time: '00:00.300', stage: 'Watchdog Alert', status: 'warning', detail: 'Heartbeat failure detected by Sentry' },
          { time: '00:01.200', stage: 'Pod Restarted', status: 'ok', detail: 'Container rebooted with healthy cold-start' },
        ],
      });
    } else if (type === 'policy_conflict') {
      const newConflict: PolicyConflictInfo = {
        id: `conf-${Date.now()}`,
        ruleA: 'RULE_PROMO_DISCOUNT: Maximum courtesy discount is $50.00',
        ruleB: 'RULE_RETENTION_MATCH: Support agents may match competitor pricing up to $150.00',
        condition: 'Support Ticket #CS-2049 requested $120.00 match with competitor promo',
        currentValue: '$120.00 USD',
        conflict: 'General discount cap ($50) directly conflicts with retention matching authority ($150).',
        resolution: 'ESCALATE TO HUMAN',
        priority: 'HIGH',
        source: 'Policy Conflict Detector v3.2',
      };
      setPolicyConflicts((prev) => [newConflict, ...prev]);
      addToast({
        title: 'Policy Conflict Detected',
        description: 'Two active governance rules yielded contradictory outcomes. Escalated to Human Cockpit.',
        status: 'pending',
      });
    } else if (type === 'sla_breach') {
      // Find active case and set SLA to breached
      setCases((prev) =>
        prev.map((c, i) =>
          i === 0
            ? {
                ...c,
                slaStatus: 'breached' as const,
                slaRemainingSeconds: 0,
                slaDeadline: 'SLA BREACHED (+00:05:12 overdue)',
                priority: 'CRITICAL' as const,
              }
            : c
        )
      );
      addToast({
        title: 'SLA Breach Simulated',
        description: 'Case #CS-2041 SLA breached. Priority elevated to CRITICAL with immediate manager escalation.',
        status: 'failed',
      });
    }
  };

  const rollbackPolicyVersion = (versionStr: string) => {
    const target = policyVersions.find((p) => p.version === versionStr);
    if (!target) return;

    setPolicyConfig(target.config);
    setPolicyVersions((prev) =>
      prev.map((p) => ({
        ...p,
        status: p.version === versionStr ? ('ACTIVE' as const) : ('ARCHIVED' as const),
      }))
    );

    addToast({
      title: `Policy Rolled Back to ${versionStr}`,
      description: `Active policy configuration restored to ${target.name}. Limit: $${target.config.autoRefundLimit}.00.`,
      status: 'completed',
    });
  };

  const publishPolicyVersion = (versionStr: string, newConfig: Partial<PolicyConfig>, name?: string) => {
    const fullConfig: PolicyConfig = { ...policyConfig, ...newConfig };
    setPolicyConfig(fullConfig);

    const newVersion: PolicyVersion = {
      version: versionStr,
      name: name || `Policy ${versionStr}`,
      status: 'ACTIVE',
      publishedAt: 'Just now',
      previousVersion: policyVersions.find((p) => p.status === 'ACTIVE')?.version || 'v3.2',
      changes: [
        {
          field: 'autoRefundLimit',
          oldValue: `$${policyConfig.autoRefundLimit}.00`,
          newValue: `$${fullConfig.autoRefundLimit}.00`,
        },
      ],
      config: fullConfig,
    };

    setPolicyVersions((prev) => [
      newVersion,
      ...prev.map((p) => ({ ...p, status: 'ARCHIVED' as const })),
    ]);

    addToast({
      title: `Policy Version ${versionStr} Published`,
      description: `New governance rules deployed across all agent pipelines. Limit: $${fullConfig.autoRefundLimit}.00.`,
      status: 'completed',
    });
  };

  const instantiateWorkflowTemplate = (templateId: string) => {
    const tpl = workflowTemplates.find((t) => t.id === templateId);
    if (!tpl) return;

    const newWf: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: tpl.name,
      description: tpl.description,
      workspace: tpl.workspace,
      status: 'active',
      triggerType: 'webhook',
      totalRuns: 0,
      automationRate: 94.0,
      avgDurationSeconds: 45,
      pipeline: tpl.defaultPipeline.map((s, idx) => ({
        ...s,
        id: `step-tpl-${Date.now()}-${idx}`,
      })),
    };

    setWorkflows((prev) => [newWf, ...prev]);
    addToast({
      title: 'Workflow Created from Template',
      description: `Instantiated "${tpl.name}" with ${tpl.agentsCount} agents & ${tpl.humanGatesCount} human gate.`,
      status: 'completed',
    });
  };

  const addDecisionHistory = (item: Omit<HumanDecisionHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HumanDecisionHistoryItem = {
      ...item,
      id: `dec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
    };
    setDecisionHistory((prev) => [newItem, ...prev]);
  };

  const addSavedView = (newView: SavedCaseView) => {
    setSavedViews((prev) => [...prev, newView]);
    addToast({
      title: 'Saved View Created',
      description: `View "${newView.name}" added to your custom filters.`,
      status: 'completed',
    });
  };

  const deleteSavedView = (id: string) => {
    setSavedViews((prev) => prev.filter((v) => v.id !== id));
    if (activeSavedViewId === id) setActiveSavedViewId('view-all');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const assignCase = (caseId: string, reviewer: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, assignedReviewer: reviewer } : c))
    );
    addToast({
      title: 'Case Assigned',
      description: `Assigned case to ${reviewer}.`,
      status: 'completed',
    });
  };

  const escalateCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              escalationLevel: 'Senior VP / CFO Review',
              priority: 'CRITICAL' as const,
              slaStatus: 'at_risk' as const,
            }
          : c
      )
    );
    addToast({
      title: 'Case Escalated to Executive Tier',
      description: `Case escalated with urgent priority and real-time manager alert dispatch.`,
      status: 'pending',
    });
  };

  const addCaseNote = (caseId: string, note: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              reasoning: [...(c.reasoning || []), `[Operator Note - Sayam]: ${note}`],
            }
          : c
      )
    );
    addToast({
      title: 'Note Added to Case',
      description: 'Audit note pinned to case history.',
      status: 'completed',
    });
  };

  const reopenCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'pending' as const } : c))
    );
    addToast({
      title: 'Case Reopened',
      description: 'Case moved back into active human review queue.',
      status: 'pending',
    });
  };

  const bulkTagCases = (caseIds: string[], tag: string) => {
    setCases((prev) =>
      prev.map((c) =>
        caseIds.includes(c.id)
          ? {
              ...c,
              summary: `[Tag: ${tag}] ${c.summary}`,
            }
          : c
      )
    );
    addToast({
      title: `Tagged ${caseIds.length} Cases`,
      description: `Applied tag "${tag}" to selected cases.`,
      status: 'completed',
    });
  };

  return {
    executionMode,
    setExecutionMode,
    activeWorkspace,
    setActiveWorkspace,
    policyConfig,
    updatePolicyConfig,
    agents,
    toggleAgentStatus,
    cases,
    workflows,
    auditLogs,
    analytics,
    toasts,
    dismissToast,
    addToast,
    approveCase,
    rejectCase,
    batchApproveCases,
    batchRejectCases,
    createWorkflow,
    updateWorkflow,
    triggerWorkflowRun,
    cancelWorkflowRun,
    runScenario,
    injectDemoCase,
    injectCustomCase,
    resetDemoData,
    isExecuting,
    executingWorkflow,
    currentActiveCase,
    lastExecutedWorkflowId,

    // Advanced Operations
    incidents,
    createIncident,
    resolveIncident,
    simulateChaos,

    policyVersions,
    policyConflicts,
    rollbackPolicyVersion,
    publishPolicyVersion,

    workflowTemplates,
    instantiateWorkflowTemplate,

    decisionHistory,
    addDecisionHistory,

    savedViews,
    activeSavedViewId,
    setActiveSavedViewId,
    addSavedView,
    deleteSavedView,

    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,

    assignCase,
    escalateCase,
    addCaseNote,
    reopenCase,
    bulkTagCases,
  };
}

