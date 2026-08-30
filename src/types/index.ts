export type WorkspaceType = 'support' | 'finance' | 'hr' | 'operations';

export type ExecutionMode = 'demo' | 'sandbox' | 'live';

export type WorkflowStatus = 'active' | 'paused' | 'running' | 'completed' | 'failed' | 'needs_approval';

export type CaseStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'modified'
  | 'open'
  | 'in_progress'
  | 'awaiting_approval'
  | 'completed'
  | 'blocked'
  | 'failed';

export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SlaStatus = 'on_track' | 'at_risk' | 'breached';

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
  avgLatencyMs?: number;
  failureRate?: number;
  mission?: string;
  recentDecisions?: string[];
  tasksPerMin?: number;
  currentLoad?: number;
  lastExecutionTime?: string;
  healthState?: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'RATE LIMITED' | 'ERROR';
  maxRetries?: number;
  backoffStrategy?: 'Exponential' | 'Linear' | 'Immediate';
  fallbackAgent?: string;
}

export interface CustomSkill {
  id: string;
  name: string;
  category: string;
  description: string;
  inputSchema: string;
  outputSchema: string;
  usageCount: number;
  successRate?: number;
  usedBy?: string[];
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
  latencyMs?: number;
  skillName?: string;
  retriesCount?: number;
  fallbackUsed?: boolean;
}

export interface EvidenceItem {
  id: string;
  section: 'input' | 'entities' | 'customer_context' | 'risk_signals' | 'policy_eval' | 'reasoning' | 'decision' | 'execution' | 'verification';
  title: string;
  timestamp: string;
  actor: string;
  confidence?: number;
  status: 'success' | 'warning' | 'error' | 'info';
  data: Record<string, any> | string;
}

export interface AgentHandoffEvent {
  id: string;
  fromAgent: string;
  fromRole: AgentRole;
  toAgent: string;
  toRole: AgentRole;
  reason: string;
  contextTransferred: string[] | number;
  confidence: number;
  timestamp: string;
  payloadSnippet?: string;
}

export interface PriorityBreakdown {
  financialImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  customerImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  slaUrgency: 'HIGH' | 'MEDIUM' | 'LOW';
  finalPriority: CasePriority;
  explanation: string;
}

export interface PolicyConflictInfo {
  id: string;
  ruleA: string;
  ruleB: string;
  condition: string;
  currentValue: string;
  conflict: string;
  resolution: 'ESCALATE TO HUMAN';
  priority: 'HIGH';
  source: string;
}

export interface EvidenceNode {
  id: string;
  label: string;
  type: 'customer' | 'transaction' | 'pattern' | 'history' | 'policy' | 'decision' | 'human';
  value?: string;
  details?: string;
  confidence?: number;
  source?: string;
  children?: EvidenceNode[];
}

export interface ContextMemorySnapshot {
  customerName: string;
  customerTenureMonths: number;
  previousRefundsCount: number;
  transactionAmount: number;
  previousChargeAmount: number;
  detectedPattern: string;
  retrievedContextCount: number;
  contextConfidence: number;
  retrievedRecords: { key: string; value: string; source: string }[];
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
  riskScore?: number;
  evidence?: EvidenceItem[];
  agentConsensus?: { agent: string; score: number; verdict: string; recommendation?: 'APPROVE' | 'REJECT' | 'HUMAN REVIEW' }[];
  
  // Advanced Case Fields
  source?: 'Email Inbound' | 'Webhook' | 'Zendesk' | 'Stripe Gateway' | 'Okta API' | 'SAP ERP' | 'Manual Dispatch';
  priority?: CasePriority;
  priorityBreakdown?: PriorityBreakdown;
  activeAgent?: string;
  workflowName?: string;
  workflowId?: string;
  slaStatus?: SlaStatus;
  slaRemainingSeconds?: number;
  slaDeadline?: string;
  createdAtTime?: string;
  lastActivityTime?: string;
  humanDecisionsCount?: number;
  agentsInvolvedCount?: number;
  
  // Deep Command View Relations
  handoffs?: AgentHandoffEvent[];
  policyConflict?: PolicyConflictInfo;
  evidenceNodes?: EvidenceNode[];
  memorySnapshot?: ContextMemorySnapshot;
  escalationLevel?: 'Level 1' | 'Senior Reviewer' | 'Operations Manager';
  escalationTimeRemaining?: string;
  assignedReviewer?: string;
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
  version?: string;
  healthState?: 'HEALTHY' | 'DEGRADED' | 'ATTENTION';
  failureRate?: number;
  humanReviewRate?: number;
  policyBlocksCount?: number;
  lastRunTime?: string;
  driftDetected?: boolean;
  driftReason?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  workspace: WorkspaceType;
  complexity: 'Low' | 'Medium' | 'High';
  agentsCount: number;
  humanGatesCount: number;
  estimatedSteps: number;
  useCase: string;
  defaultPipeline: PipelineStep[];
}

export interface WorkflowVersion {
  version: string;
  workflowId: string;
  workflowName: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  changes: string[];
  diffAdded: string[];
  diffRemoved: string[];
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
  immutableHash?: string;
  ruleTriggered?: string;
  executionDurationMs?: number;
  category?: 'AGENT' | 'POLICY' | 'CASE' | 'HUMAN' | 'SYSTEM';
}

export interface PolicyConfig {
  autoRefundLimit: number;
  fraudReviewThreshold: number;
  fraudEscalationThreshold: number;
  requireApprovalForPolicyExceptions: boolean;
  requireApprovalForHighValueInvoices: number;
  requireApprovalForAccessElevation: boolean;
}

export interface PolicyVersion {
  version: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  publishedAt: string;
  previousVersion?: string;
  changes: { field: string; oldValue: string; newValue: string }[];
  config: Partial<PolicyConfig>;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  detectedAt: string;
  affectedWorkflows: string[];
  agents: string[];
  summary: string;
  eventCorrelationChain: { time: string; stage: string; status: 'ok' | 'error' | 'warning' | 'info'; detail: string }[];
}

export interface AnalyticsData {
  casesAutomated: number;
  humanReviewRate: number;
  avgResolutionTimeSeconds: number;
  costSavedUSD: number;
  policyBlocksCount?: number;
  verifiedActionsCount?: number;
  slaComplianceRate?: number;
  atRiskCount?: number;
  breachedCount?: number;
  totalTokensEstimated?: number;
  estimatedCostUSD?: number;
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

export interface RunReplayStep {
  timeOffset: string;
  actor: string;
  role: AgentRole;
  title: string;
  detail: string;
  status: 'completed' | 'running' | 'awaiting_approval' | 'failed';
  confidence?: number;
  risk?: number;
  latencyMs?: number;
  safetyInvariant?: string;
}

export interface HumanDecisionHistoryItem {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'APPROVED' | 'REJECTED' | 'OVERRIDDEN' | 'ESCALATED';
  caseNumber: string;
  caseTitle: string;
  amount?: number;
  reason: string;
  timestamp: string;
  immutableHash: string;
  isOverride?: boolean;
}

export interface NotificationItem {
  id: string;
  category: 'CRITICAL' | 'APPROVAL' | 'POLICY' | 'SYSTEM' | 'AGENT' | 'SLA';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  caseId?: string;
  actionLabel?: string;
}

export interface SavedCaseView {
  id: string;
  name: string;
  filter: {
    status?: string;
    priority?: string;
    minRisk?: number;
    maxRisk?: number;
    minAmount?: number;
    search?: string;
  };
  isDefault?: boolean;
}
