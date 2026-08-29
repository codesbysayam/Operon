export type WorkspaceType = 'support' | 'finance' | 'hr' | 'operations';

export type ExecutionMode = 'demo' | 'sandbox' | 'live';

export type WorkflowStatus = 'active' | 'paused' | 'running' | 'completed' | 'failed' | 'needs_approval';

export type AgentRole =
  | 'analyst'
  | 'planner'
  | 'executor'
  | 'tester'
  | 'reviewer'
  | 'memory'
  | 'release_guardian'
  | 'fraud_sentinel';

export interface AgentInfo {
  id: string;
  name: string;
  role: AgentRole;
  avatar: string;
  description: string;
  skills: string[];
  status: 'idle' | 'active' | 'evaluating' | 'error';
  totalTasks: number;
  accuracyRate: number;
}

export interface CustomSkill {
  id: string;
  name: string;
  category: string;
  description: string;
  inputSchema: string;
  outputSchema: string;
  usageCount: number;
}

export interface PipelineStep {
  id: string;
  agentRole: AgentRole;
  agentName: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval';
  input?: string;
  output?: string;
  confidenceScore?: number;
  reasoning?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ApprovalCase {
  id: string;
  caseNumber: string;
  customerName: string;
  customerEmail: string;
  workspace: WorkspaceType;
  title: string;
  summary: string;
  amount?: number;
  type: 'REFUND_REQUEST' | 'POLICY_EXCEPTION' | 'INVOICE_APPROVAL' | 'ACCESS_GRANT' | 'ESCALATION';
  confidenceScore: number;
  recommendedAction: 'APPROVE' | 'REJECT' | 'ESCALATE_TO_SENIOR';
  reasoning: string[];
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  timestamp: string;
  pipelineSteps: PipelineStep[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  workspace: WorkspaceType;
  status: WorkflowStatus;
  triggerType: 'webhook' | 'email_inbound' | 'schedule' | 'manual';
  totalRuns: number;
  automationRate: number;
  avgDurationSeconds: number;
  pipeline: PipelineStep[];
}

export interface AuditLogEntry {
  id: string;
  caseId?: string;
  workflowId?: string;
  workspace?: WorkspaceType;
  event: string;
  agentRole?: AgentRole;
  actor: string;
  details: string;
  timestamp: string;
  mode: ExecutionMode;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface PolicyConfig {
  autoRefundLimit: number;
  fraudReviewThreshold: number;
  fraudEscalationThreshold: number;
  requireApprovalForPolicyExceptions: boolean;
  requireApprovalForHighValueInvoices: number;
  requireApprovalForAccessElevation: boolean;
}

export interface AnalyticsData {
  casesAutomated: number;
  humanReviewRate: number;
  avgResolutionTimeSeconds: number;
  costSavedUSD: number;
  weeklyTrend: { day: string; cases: number; automated: number }[];
  workspaceBreakdown: { name: string; count: number; percentage: number }[];
}

export interface ExecutingWorkflowState {
  workflowId: string;
  workflowName: string;
  caseNumber: string;
  currentStepName: string;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  mode: ExecutionMode;
  workspace: WorkspaceType;
  activeAgentName?: string;
  activeAgentRole?: AgentRole;
  statusText?: string;
}
