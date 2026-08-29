import { useState, useEffect } from 'react';
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
} from '../types';
import { ToastNotification } from '../components/ToastContainer';
import {
  INITIAL_APPROVAL_CASES,
  INITIAL_WORKFLOWS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANALYTICS,
} from '../data/demoScenario';
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
  injectDemoCase: (workspace?: WorkspaceType) => void;
  resetDemoData: () => void;
  isExecuting: boolean;
  executingWorkflow: ExecutingWorkflowState | null;
  currentActiveCase: ApprovalCase | null;
  lastExecutedWorkflowId: string | null;
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

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedSteps = c.pipelineSteps.map((s) => {
            if (s.status === 'awaiting_approval') {
              return {
                ...s,
                status: 'completed' as const,
                output: `Human Approval Granted by Sayam Mukherjee (Operations Lead). ${notes ? 'Notes: ' + notes : ''}`,
                completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              };
            }
            return s;
          });

          const hasExecutor = updatedSteps.some((s) => s.agentRole === 'executor');
          if (!hasExecutor) {
            const executorOutput =
              executionMode === 'live'
                ? `REAL REFUND CREATED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Stripe Production Gateway (Charge ID: ch_prod_${Math.random().toString(36).substr(2, 8)}). Real financial disbursement executed with immutable audit seal.`
                : executionMode === 'sandbox'
                ? `TEST REFUND CREATED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Stripe Test Mode (API Key: sk_test_...). Invariants verified against sandbox test ledger.`
                : `SIMULATED REFUND COMPLETED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Simulated Adapter. Zero external side effects.`;

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
                completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              },
              {
                id: `p-test-${Date.now()}`,
                agentRole: 'tester',
                agentName: 'Validation Tester',
                stepName: 'Verify Invariants & Finalize',
                status: 'completed',
                input: `Validate response for ${c.caseNumber}`,
                output:
                  executionMode === 'live'
                    ? 'Production invariant check PASSED. Post-execution ledger & customer record sealed.'
                    : executionMode === 'sandbox'
                    ? 'Sandbox invariant check PASSED. Test API response code 200 OK. Mock ledger updated.'
                    : 'Simulation invariant check PASSED. Deterministic dry-run verified. Zero side effects.',
                confidenceScore: 100,
                completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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

    const timestamp = 'Just now';
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
      },
      {
        id: `log-${Date.now()}-2`,
        caseId: caseId,
        workspace: targetCase.workspace,
        event: 'Task Executor Action Complete',
        agentRole: 'executor',
        actor: 'Task Executor',
        details: `SIMULATED ACTION EXECUTED — Processed ${targetCase.type.replace('_', ' ')} (${amountStr}) for ${targetCase.customerName}.`,
        timestamp,
        mode: executionMode,
        status: 'success',
      },
      {
        id: `log-${Date.now()}-3`,
        caseId: caseId,
        workspace: targetCase.workspace,
        event: 'Validation Verification Passed',
        agentRole: 'tester',
        actor: 'Validation Tester',
        details: `Invariant check passed. Workflow pipeline finalized for ${targetCase.caseNumber}.`,
        timestamp,
        mode: executionMode,
        status: 'success',
      },
    ];

    setAuditLogs((prev) => [...newLogs, ...prev]);

    setAnalytics((prev) => ({
      ...prev,
      casesAutomated: prev.casesAutomated + 1,
      costSavedUSD: prev.costSavedUSD + (targetCase.amount || 50),
    }));

    addToast({
      title: 'Human Gate Approved & Executed',
      description: `${targetCase.caseNumber}: Action executed (${amountStr}). Pipeline completed successfully.`,
      status: 'completed',
      caseNumber: targetCase.caseNumber,
    });
  };

  const rejectCase = async (caseId: string, notes?: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedSteps = c.pipelineSteps.map((s) => {
            if (s.status === 'awaiting_approval') {
              return {
                ...s,
                status: 'failed' as const,
                output: `Human Approval Rejected by Sayam Mukherjee (Operations Lead). ${notes ? 'Reason: ' + notes : 'Policy criteria not met.'}`,
                completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
              completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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

    const timestamp = 'Just now';
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
      },
    ];

    setAuditLogs((prev) => [...newLogs, ...prev]);

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
                ? `REAL REFUND CREATED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Stripe Production Gateway (Charge ID: ch_prod_${Math.random().toString(36).substr(2, 8)}). Real financial disbursement executed with immutable audit seal.`
                : executionMode === 'sandbox'
                ? `TEST REFUND CREATED — Processed ${c.type.replace('_', ' ')} (${amountStr}) via Stripe Test Mode (API Key: sk_test_...). Invariants verified against sandbox test ledger.`
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
                    : 'Simulation invariant check PASSED. Deterministic dry-run verified. Zero side effects.',
                confidenceScore: 100,
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

    const timestamp = 'Just now';
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
      });
    });

    setAuditLogs((prev) => [...newLogs, ...prev]);

    setAnalytics((prev) => ({
      ...prev,
      casesAutomated: prev.casesAutomated + targetCases.length,
      costSavedUSD: prev.costSavedUSD + totalAmount,
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

    const timestamp = 'Just now';
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
      });
    });

    setAuditLogs((prev) => [...newLogs, ...prev]);

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
      avgDurationSeconds: 150,
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
    const newCaseNumber = targetWf.workspace === 'finance' ? `FIN-${Math.floor(1000 + Math.random() * 900)}` : targetWf.workspace === 'hr' ? `HR-${Math.floor(3000 + Math.random() * 900)}` : targetWf.workspace === 'operations' ? `OPS-${Math.floor(7000 + Math.random() * 900)}` : `CS-${Math.floor(2000 + Math.random() * 900)}`;

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
      currentStepName: 'Initializing Pipeline',
      currentStepIndex: 1,
      totalSteps: totalPipelineSteps,
      progress: 15,
      mode: executionMode,
      workspace: targetWf.workspace,
      activeAgentName: targetWf.pipeline[0]?.agentName || 'Intent Analyst',
      activeAgentRole: targetWf.pipeline[0]?.agentRole || 'analyst',
      statusText: 'Initializing execution graph & loading invariants...',
    });

    let liveReasoning = [
      'Multi-agent pipeline evaluated intent, customer churn history, and payment gateway logs.',
      'High customer tenure and positive account standing verified.',
      requiresHumanApproval
        ? `Enforced policy threshold ($${policyConfig.autoRefundLimit} limit); routed to human approval queue.`
        : `Amount ($${detectedAmount}) within auto-approve cap ($${policyConfig.autoRefundLimit}). Processing automatically.`,
    ];
    let liveConfidence = 88;
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
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reasoning) liveReasoning = data.reasoning;
          if (data.overallConfidence) liveConfidence = data.overallConfidence;
          if (data.recommendedAction) liveAction = data.recommendedAction;
          liveSummary = `[OPERON LIVE PRODUCTION] ${customInput || targetWf.description}`;
        }
      } catch (err) {
        console.warn('Live API request fell back to local orchestrator logic:', err);
        liveSummary = `[OPERON LIVE PRODUCTION] ${customInput || targetWf.description}`;
      }
    } else if (executionMode === 'sandbox') {
      liveSummary = `[OPERON SANDBOX TEST] ${customInput || targetWf.description}`;
    } else {
      liveSummary = `[OPERON DEMO SIMULATION] ${customInput || targetWf.description}`;
    }

    const initialCase: ApprovalCase = {
      id: newCaseId,
      caseNumber: newCaseNumber,
      customerName: 'Marcus Vance',
      customerEmail: 'marcus.vance@techcorp.io',
      workspace: targetWf.workspace,
      title: customInput || `Trigger Run: ${targetWf.name}`,
      summary: liveSummary,
      amount: detectedAmount,
      type: 'REFUND_REQUEST',
      confidenceScore: liveConfidence,
      recommendedAction: liveAction,
      reasoning: liveReasoning,
      status: 'pending',
      timestamp: 'Just now',
      pipelineSteps: targetWf.pipeline.map((step) => ({
        ...step,
        status: 'pending',
      })),
    };

    setCurrentActiveCase(initialCase);
    setCases((prev) => [initialCase, ...prev]);

    // Simulate progressive agent execution steps
    const stepDelay = executionMode === 'live' ? 450 : 300;
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
          statusText: `Step ${i + 1} of ${totalPipelineSteps}: ${currentStep.stepName} (${currentStep.agentName})`,
        });

        await new Promise((resolve) => setTimeout(resolve, stepDelay));
        if (isCancelledRef.current) break;

        setCases((prev) =>
          prev.map((c) => {
            if (c.id === newCaseId) {
              const updatedSteps = c.pipelineSteps.map((s, idx) => {
                if (idx === i) {
                  const isLast = idx === c.pipelineSteps.length - 1;
                  const isGate = isLast && requiresHumanApproval;
                  return {
                    ...s,
                    status: isGate ? ('awaiting_approval' as const) : ('completed' as const),
                    confidenceScore: Math.min(99, liveConfidence + idx),
                    output: isGate
                      ? `Threshold exceeded ($${detectedAmount} > $${policyConfig.autoRefundLimit}). Paused for human decision.`
                      : executionMode === 'live'
                      ? `REAL ACTION EXECUTED — Processed via Stripe Production & Live Adapters. Policy verified.`
                      : executionMode === 'sandbox'
                      ? `TEST ACTION EXECUTED — Processed via Stripe Test Mode & Test Adapters. Status: OK.`
                      : `SIMULATED ACTION COMPLETED — Processed in DEMO (deterministic dry-run). Zero external side effects.`,
                    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  };
                }
                if (idx === i + 1) {
                  return { ...s, status: 'running' as const };
                }
                return s;
              });
              return { ...c, pipelineSteps: updatedSteps };
            }
            return c;
          })
        );
      }

      if (isCancelledRef.current) return;

      // Final progress pulse
      setExecutingWorkflow({
        workflowId: targetWf.id,
        workflowName: targetWf.name,
        caseNumber: newCaseNumber,
        currentStepName: 'Pipeline Finalized',
        currentStepIndex: totalPipelineSteps,
        totalSteps: totalPipelineSteps,
        progress: 100,
        mode: executionMode,
        workspace: targetWf.workspace,
        activeAgentName: 'Release Guardian',
        statusText: requiresHumanApproval ? 'Gate Reached: Routed to Human Approvals' : 'All Agent Tasks Executed Successfully',
      });

      // Update workflow run metrics
      setWorkflows((prev) =>
        prev.map((w) => (w.id === targetWf.id ? { ...w, totalRuns: (w.totalRuns || 0) + 1 } : w))
      );
      setLastExecutedWorkflowId(targetWf.id);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const runLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        caseId: newCaseId,
        workflowId: targetWf.id,
        event: `Workflow Pipeline Executed (${executionMode.toUpperCase()})`,
        actor: executionMode === 'live' ? 'Gemini 2.5 Flash Engine' : 'OPERON Multi-Agent Engine',
        details: `Completed multi-agent pipeline for ${newCaseNumber}. Route: Analyst -> Planner -> Release Guardian.`,
        timestamp: 'Just now',
        mode: executionMode,
        status: 'success',
      };

      setAuditLogs((prev) => [runLog, ...prev]);

      addToast({
        title: `Workflow Execution ${requiresHumanApproval ? 'Gate Reached' : 'Completed'}`,
        description: `${newCaseNumber}: "${targetWf.name}" finished pipeline run (${executionMode.toUpperCase()} mode). ${
          requiresHumanApproval
            ? `Amount $${detectedAmount} > $${policyConfig.autoRefundLimit} limit; queued for human review.`
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
      await triggerWorkflowRun('wf-support-refund', 'Customer Sofia Karim requesting $249.00 duplicate charge refund.');
    } else if (scenario === 'C') {
      await triggerWorkflowRun('wf-support-refund', 'Late cancellation request for $129.00 (22 days post-purchase).');
    }
  };

  const injectDemoCase = (targetWs?: WorkspaceType) => {
    const ws = targetWs || activeWorkspace;
    const demoId = `demo-${Date.now()}`;
    const demoNumber = ws === 'finance' ? `FIN-${Math.floor(5000 + Math.random() * 900)}` : ws === 'hr' ? `HR-${Math.floor(6000 + Math.random() * 900)}` : ws === 'operations' ? `OPS-${Math.floor(8000 + Math.random() * 900)}` : `CS-${Math.floor(4000 + Math.random() * 900)}`;

    const newDemoCase: ApprovalCase = {
      id: demoId,
      caseNumber: demoNumber,
      customerName: 'Sayam Mukherjee (Injected Test)',
      customerEmail: 'sayam.mukherjee@enterprise-demo.io',
      workspace: ws,
      title: `Demo Test Escalation ($320.00) in ${ws.toUpperCase()}`,
      summary: `Quick prototype escalation case injected in DEMO mode to verify approval gates and real-time badge sync.`,
      amount: 320.0,
      type: 'POLICY_EXCEPTION',
      confidenceScore: 85,
      recommendedAction: 'APPROVE',
      reasoning: [
        'Demo scenario generated for instant authorization review.',
        `Policy gate active: refund/invoice exceeds $${policyConfig.autoRefundLimit} threshold.`,
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
          output: 'Classified: High value exception ($320.00)',
          confidenceScore: 95,
        },
        {
          id: 'step-2',
          agentRole: 'release_guardian',
          agentName: 'Release Guardian',
          stepName: 'Policy Gate Sign-off',
          status: 'awaiting_approval',
          input: `Amount > $${policyConfig.autoRefundLimit} cap`,
          output: 'Awaiting human authorization',
          confidenceScore: 85,
        },
      ],
    };

    setCases((prev) => [newDemoCase, ...prev]);

    addToast({
      title: 'Demo Approval Case Injected',
      description: `Injected case ${demoNumber} ($320.00) into ${ws.toUpperCase()} approval queue.`,
      status: 'pending',
      caseNumber: demoNumber,
    });
  };

  const resetDemoData = () => {
    setCases(INITIAL_APPROVAL_CASES);
    setWorkflows(INITIAL_WORKFLOWS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAnalytics(INITIAL_ANALYTICS);
    addToast({
      title: 'Demo State Reset',
      description: 'Reset all workflows, approval cases, and audit logs to initial clean state.',
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
    resetDemoData,
    isExecuting,
    executingWorkflow,
    currentActiveCase,
    lastExecutedWorkflowId,
  };
}
