import {
  Incident,
  PolicyVersion,
  PolicyConflictInfo,
  WorkflowTemplate,
  WorkflowVersion,
  HumanDecisionHistoryItem,
  NotificationItem,
  SavedCaseView,
  ApprovalCase,
  PriorityBreakdown,
  AgentHandoffEvent,
  EvidenceNode,
} from '../types';

export const INITIAL_SAVED_VIEWS: SavedCaseView[] = [
  { id: 'view-all', name: 'All Active Cases', filter: {}, isDefault: true },
  { id: 'view-approvals', name: 'My Approval Queue', filter: { status: 'awaiting_approval' } },
  { id: 'view-high-risk', name: 'High Risk Cases (Risk > 60)', filter: { minRisk: 60 } },
  { id: 'view-sla-risk', name: 'SLA At Risk', filter: { status: 'pending' } },
  { id: 'view-high-value', name: 'High Value (> $500)', filter: { minAmount: 500 } },
  { id: 'view-blocked', name: 'Policy Blocks', filter: { status: 'rejected' } },
];

export const INITIAL_POLICY_VERSIONS: PolicyVersion[] = [
  {
    version: 'v3.2',
    name: 'Auto-Refund & Fraud Thresholds v3.2',
    status: 'ACTIVE',
    publishedAt: '30 Aug 2026, 09:00 UTC',
    previousVersion: 'v3.1',
    changes: [
      { field: 'autoRefundLimit', oldValue: '$50.00', newValue: '$100.00' },
      { field: 'fraudReviewThreshold', oldValue: '25 / 100', newValue: '30 / 100' },
    ],
    config: {
      autoRefundLimit: 100,
      fraudReviewThreshold: 30,
      fraudEscalationThreshold: 70,
      requireApprovalForPolicyExceptions: true,
      requireApprovalForHighValueInvoices: 1000,
      requireApprovalForAccessElevation: true,
    },
  },
  {
    version: 'v3.1',
    name: 'Governance Baseline v3.1',
    status: 'ARCHIVED',
    publishedAt: '15 Aug 2026, 14:20 UTC',
    previousVersion: 'v3.0',
    changes: [
      { field: 'requireApprovalForAccessElevation', oldValue: 'false', newValue: 'true' },
      { field: 'requireApprovalForHighValueInvoices', oldValue: '$2,500.00', newValue: '$1,000.00' },
    ],
    config: {
      autoRefundLimit: 50,
      fraudReviewThreshold: 25,
      fraudEscalationThreshold: 70,
      requireApprovalForPolicyExceptions: true,
      requireApprovalForHighValueInvoices: 1000,
      requireApprovalForAccessElevation: true,
    },
  },
  {
    version: 'v3.0',
    name: 'Initial Enterprise Policy v3.0',
    status: 'ARCHIVED',
    publishedAt: '01 Jul 2026, 08:00 UTC',
    changes: [
      { field: 'autoRefundLimit', oldValue: '$0.00', newValue: '$50.00' },
    ],
    config: {
      autoRefundLimit: 50,
      fraudReviewThreshold: 20,
      fraudEscalationThreshold: 75,
      requireApprovalForPolicyExceptions: true,
      requireApprovalForHighValueInvoices: 2500,
      requireApprovalForAccessElevation: false,
    },
  },
];

export const INITIAL_POLICY_CONFLICTS: PolicyConflictInfo[] = [
  {
    id: 'conf-1',
    ruleA: 'RULE_AUTO_REFUND_LIMIT: Auto-refund allowed for amounts <= $100.00',
    ruleB: 'RULE_VIP_TIER_EXCEPTION: VIP Enterprise customers may receive automated refunds <= $250.00',
    condition: 'Transaction amount = $249.00, Customer Tier = Enterprise VIP (24 months)',
    currentValue: '$249.00 USD',
    conflict: 'General rule prohibits auto-refund > $100, while VIP tier exception allows auto-refund up to $250.',
    resolution: 'ESCALATE TO HUMAN',
    priority: 'HIGH',
    source: 'Release Guardian Policy Engine (Resolver Engine v2.1)',
  },
  {
    id: 'conf-2',
    ruleA: 'RULE_INVOICE_TOLERANCE: Minor discrepancies < $50 allow autonomous ledger entry',
    ruleB: 'RULE_FREIGHT_PREAPPROVAL: Uncontracted shipping line items require written PO amendment',
    condition: 'Invoice #INV-8821 includes $45.00 unlisted fuel surcharge',
    currentValue: '$45.00 USD',
    conflict: 'Tolerance rule permits auto-posting, but Freight rule mandates explicit line item signoff.',
    resolution: 'ESCALATE TO HUMAN',
    priority: 'HIGH',
    source: 'Finance Ops Policy Guardian',
  },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-009',
    incidentNumber: 'INC-009',
    title: 'Fraud Sentinel elevated error rate & transient timeout',
    severity: 'MEDIUM',
    status: 'INVESTIGATING',
    detectedAt: '09:48:12 UTC',
    affectedWorkflows: ['Customer Support Refund Automation', 'Finance Invoice & Vendor Audit'],
    agents: ['Fraud & Anomaly Sentinel', 'Recovery Sentry'],
    summary: 'Third-party IP threat velocity microservice latency spiked from 310ms to 4,200ms, triggering automated retry with exponential backoff and safe human degradation.',
    eventCorrelationChain: [
      { time: '09:48:12.100', stage: 'Agent Started', status: 'ok', detail: 'Fraud Sentinel began evaluation for Case #CS-2045' },
      { time: '09:48:12.380', stage: 'Context Loaded', status: 'ok', detail: 'Context Memory injected 6 customer history records' },
      { time: '09:48:12.800', stage: 'Model Request', status: 'warning', detail: 'External risk database call dispatched' },
      { time: '09:48:17.000', stage: 'Timeout Detected', status: 'error', detail: 'HTTP 504 Gateway Timeout (exceeded 4,000ms threshold)' },
      { time: '09:48:17.150', stage: 'Automatic Retry #1', status: 'warning', detail: 'Exponential backoff delay (250ms) -> Retrying endpoint' },
      { time: '09:48:19.200', stage: 'Fallback Activated', status: 'info', detail: 'Routed payload to Fraud Sentinel Backup Local Model' },
      { time: '09:48:19.450', stage: 'Human Escalation', status: 'ok', detail: 'Safe degradation triggered: routed to Human Approval Cockpit without system collapse' },
    ],
  },
  {
    id: 'inc-008',
    incidentNumber: 'INC-008',
    title: 'SAP ERP connector rate-limit throttling',
    severity: 'LOW',
    status: 'MITIGATED',
    detectedAt: '08:12:00 UTC',
    affectedWorkflows: ['Finance Invoice & Vendor Audit'],
    agents: ['Task Executor'],
    summary: 'Rate limit 429 received from legacy SAP endpoint. Batch backpressure buffer safely queued 3 invoices.',
    eventCorrelationChain: [
      { time: '08:12:00.000', stage: 'Rate Limit Warning', status: 'warning', detail: 'Received HTTP 429 Too Many Requests' },
      { time: '08:12:01.200', stage: 'Backpressure Active', status: 'info', detail: 'Task Executor paused queue and notified Orchestrator' },
      { time: '08:12:15.000', stage: 'Queue Drained', status: 'ok', detail: 'Resumed processing at 1 req/sec throttle' },
    ],
  },
];

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-support-refund',
    name: 'Customer Refund Automation',
    description: 'Autonomous triage for refund disputes, duplicate billing, chargebacks, and goodwill credit issuance under strict policy boundaries.',
    workspace: 'support',
    complexity: 'Medium',
    agentsCount: 7,
    humanGatesCount: 1,
    estimatedSteps: 7,
    useCase: 'E-commerce, SaaS, and subscription platforms requiring sub-minute dispute turnaround while eliminating unauthorized disbursements.',
    defaultPipeline: [
      { id: 't1', agentRole: 'analyst', agentName: 'Intent Analyst', stepName: 'Intent & Entity Extraction', status: 'pending' },
      { id: 't2', agentRole: 'memory', agentName: 'Context Memory Agent', stepName: 'Customer Context Retrieval', status: 'pending' },
      { id: 't3', agentRole: 'fraud_sentinel', agentName: 'Fraud Sentinel', stepName: 'Risk & Anomaly Scoring', status: 'pending' },
      { id: 't4', agentRole: 'planner', agentName: 'Workflow Planner', stepName: 'DAG Policy Planning', status: 'pending' },
      { id: 't5', agentRole: 'release_guardian', agentName: 'Release Guardian', stepName: 'Release Guardian Policy Barrier', status: 'pending' },
      { id: 't6', agentRole: 'executor', agentName: 'Task Executor', stepName: 'Stripe Gateway Payout Action', status: 'pending' },
      { id: 't7', agentRole: 'tester', agentName: 'Validation Tester', stepName: 'Verify Invariants & Seal Audit', status: 'pending' },
    ],
  },
  {
    id: 'tpl-finance-invoice',
    name: 'Invoice Processing & 3-Way Match',
    description: 'Extracts line items from PDF invoices, verifies PO match against ERP, checks tax calculation, and prepares wire releases.',
    workspace: 'finance',
    complexity: 'High',
    agentsCount: 8,
    humanGatesCount: 2,
    estimatedSteps: 8,
    useCase: 'Accounts Payable teams processing 500+ vendor invoices/month with automated ledger posting and high-value wire guards.',
    defaultPipeline: [
      { id: 't11', agentRole: 'analyst', agentName: 'Intent Analyst', stepName: 'OCR Line Item Extraction', status: 'pending' },
      { id: 't12', agentRole: 'memory', agentName: 'Context Memory Agent', stepName: 'Vendor Contract Lookup', status: 'pending' },
      { id: 't13', agentRole: 'planner', agentName: 'Workflow Planner', stepName: '3-Way Match Reconciliation', status: 'pending' },
      { id: 't14', agentRole: 'release_guardian', agentName: 'Release Guardian', stepName: 'High Value Threshold Gate ($1,000)', status: 'pending' },
      { id: 't15', agentRole: 'executor', agentName: 'Task Executor', stepName: 'ERP Ledger Entry & Wire Prep', status: 'pending' },
      { id: 't16', agentRole: 'tester', agentName: 'Validation Tester', stepName: 'Post-Execution Audit Sealing', status: 'pending' },
    ],
  },
  {
    id: 'tpl-employee-onboarding',
    name: 'Employee Onboarding & SSO Provisioning',
    description: 'Provisions Okta roles, Google Workspace accounts, GitHub permissions, and Slack channels upon offer acceptance.',
    workspace: 'hr',
    complexity: 'Medium',
    agentsCount: 6,
    humanGatesCount: 1,
    estimatedSteps: 6,
    useCase: 'IT Ops and HR teams scaling new hire provisioning with automated least-privilege role assignment.',
    defaultPipeline: [
      { id: 't21', agentRole: 'analyst', agentName: 'Intent Analyst', stepName: 'Parse Offer Acceptance', status: 'pending' },
      { id: 't22', agentRole: 'planner', agentName: 'Workflow Planner', stepName: 'Role Scope & Privilege Check', status: 'pending' },
      { id: 't23', agentRole: 'release_guardian', agentName: 'Release Guardian', stepName: 'Elevated Access Gate', status: 'pending' },
      { id: 't24', agentRole: 'executor', agentName: 'Task Executor', stepName: 'SSO & OAuth Provisioning', status: 'pending' },
      { id: 't25', agentRole: 'tester', agentName: 'Validation Tester', stepName: 'Access Invariant Verification', status: 'pending' },
    ],
  },
  {
    id: 'tpl-ticket-triage',
    name: 'Support Ticket SLA Escalation',
    description: 'Real-time sentiment categorization, urgent issue routing, and automated tier-1 diagnostic dispatch.',
    workspace: 'support',
    complexity: 'Low',
    agentsCount: 5,
    humanGatesCount: 1,
    estimatedSteps: 5,
    useCase: 'Customer operations teams managing high-volume Zendesk/Intercom queues with SLA breach mitigation.',
    defaultPipeline: [
      { id: 't31', agentRole: 'analyst', agentName: 'Intent Analyst', stepName: 'Sentiment & Urgency Classification', status: 'pending' },
      { id: 't32', agentRole: 'memory', agentName: 'Context Memory Agent', stepName: 'Account SLA Tier Check', status: 'pending' },
      { id: 't33', agentRole: 'planner', agentName: 'Workflow Planner', stepName: 'Routing Plan Generation', status: 'pending' },
      { id: 't34', agentRole: 'executor', agentName: 'Task Executor', stepName: 'Ticket Reassignment & Auto-Response', status: 'pending' },
    ],
  },
  {
    id: 'tpl-access-request',
    name: 'Access Request & Privilege Elevation',
    description: 'Zero-trust just-in-time access requests for production databases, AWS IAM roles, and internal admin panels.',
    workspace: 'hr',
    complexity: 'High',
    agentsCount: 6,
    humanGatesCount: 2,
    estimatedSteps: 6,
    useCase: 'SecOps teams enforcing SOC2/ISO-27001 compliant privilege escalation with cryptographic audit trails.',
    defaultPipeline: [
      { id: 't41', agentRole: 'analyst', agentName: 'Intent Analyst', stepName: 'Parse IAM Scope Request', status: 'pending' },
      { id: 't42', agentRole: 'fraud_sentinel', agentName: 'Fraud Sentinel', stepName: 'User Risk & Anomaly Scoring', status: 'pending' },
      { id: 't43', agentRole: 'release_guardian', agentName: 'Release Guardian', stepName: 'Mandatory Security Review Gate', status: 'pending' },
      { id: 't44', agentRole: 'executor', agentName: 'Task Executor', stepName: 'Issue Ephemeral Token', status: 'pending' },
    ],
  },
  {
    id: 'tpl-expense-review',
    name: 'Corporate Expense Review & Policy Audit',
    description: 'Scans expense receipts, validates category limits, flags unreceipted charges, and submits for reimbursement.',
    workspace: 'finance',
    complexity: 'Medium',
    agentsCount: 6,
    humanGatesCount: 1,
    estimatedSteps: 6,
    useCase: 'Finance teams automating expense compliance across Ramp/Expensify with receipt OCR and policy checks.',
    defaultPipeline: [
      { id: 't51', agentRole: 'analyst', agentName: 'Intent Analyst', stepName: 'Receipt OCR & Category Tagging', status: 'pending' },
      { id: 't52', agentRole: 'planner', agentName: 'Workflow Planner', stepName: 'Policy Limit Validation', status: 'pending' },
      { id: 't53', agentRole: 'release_guardian', agentName: 'Release Guardian', stepName: 'Out-of-Policy Review Gate', status: 'pending' },
      { id: 't54', agentRole: 'executor', agentName: 'Task Executor', stepName: 'Reimbursement Batch Submit', status: 'pending' },
    ],
  },
];

export const INITIAL_DECISION_HISTORY: HumanDecisionHistoryItem[] = [
  {
    id: 'dec-1',
    reviewerName: 'Sayam Mukherjee',
    reviewerRole: 'Operations Lead',
    decision: 'APPROVED',
    caseNumber: 'CS-2038',
    caseTitle: 'Customer refund for minor service degradation',
    amount: 89.0,
    reason: 'Verified customer experienced 45min downtime on 07 August 2026. Within goodwill policy limits.',
    timestamp: '09:42:22 UTC',
    immutableHash: 'sha256:dec_a9128f001',
    isOverride: false,
  },
  {
    id: 'dec-2',
    reviewerName: 'Sayam Mukherjee',
    reviewerRole: 'Operations Lead',
    decision: 'APPROVED',
    caseNumber: 'FIN-1090',
    caseTitle: 'AWS Enterprise Cloud hosting invoice',
    amount: 12500.0,
    reason: 'Invoice matches PO #AWS-2026-Q3. Reserved instance commitment verified by DevOps team.',
    timestamp: '09:18:04 UTC',
    immutableHash: 'sha256:dec_b88231c02',
    isOverride: false,
  },
  {
    id: 'dec-3',
    reviewerName: 'Sarah Jenkins',
    reviewerRole: 'Senior Finance Reviewer',
    decision: 'REJECTED',
    caseNumber: 'FIN-1088',
    caseTitle: 'Duplicate consultant travel invoice',
    amount: 1450.0,
    reason: 'Rejected: Consultant flight was already reimbursed under expense report #EXP-4402.',
    timestamp: '08:55:10 UTC',
    immutableHash: 'sha256:dec_c77391a03',
    isOverride: false,
  },
  {
    id: 'dec-4',
    reviewerName: 'Sayam Mukherjee',
    reviewerRole: 'Operations Lead',
    decision: 'OVERRIDDEN',
    caseNumber: 'CS-2035',
    caseTitle: 'Goodwill credit for VIP churn prevention',
    amount: 350.0,
    reason: 'Human override authorized: Account renewal is worth $45,000 ARR. VP of Success explicitly approved exception.',
    timestamp: 'Yesterday, 16:40 UTC',
    immutableHash: 'sha256:dec_d66144e04',
    isOverride: true,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'APPROVAL',
    title: 'Human Review Required: Case #CS-2041',
    description: 'Duplicate charge refund ($249.00) paused by Release Guardian ($100 cap). Awaiting your decision.',
    timestamp: '10 mins ago',
    read: false,
    caseId: 'case-2041',
    actionLabel: 'Review Case',
  },
  {
    id: 'notif-2',
    category: 'CRITICAL',
    title: 'Incident INC-009: Fraud Sentinel latency spike',
    description: 'Safe degradation triggered. Third-party IP lookup timed out; fallback agent activated.',
    timestamp: '15 mins ago',
    read: false,
    actionLabel: 'View Incident',
  },
  {
    id: 'notif-3',
    category: 'SLA',
    title: 'Case #FIN-1092 approaching SLA deadline',
    description: 'Vendor Invoice verification has 00:14:21 remaining before SLA breach warning.',
    timestamp: '30 mins ago',
    read: false,
    caseId: 'case-2043',
    actionLabel: 'Open Invoice',
  },
  {
    id: 'notif-4',
    category: 'POLICY',
    title: 'Policy version v3.2 published',
    description: 'Auto-refund threshold updated from $50.00 to $100.00 by Operations Lead.',
    timestamp: '2 hours ago',
    read: true,
    actionLabel: 'View Diff',
  },
  {
    id: 'notif-5',
    category: 'SYSTEM',
    title: 'System Invariant Check: 100% Passed',
    description: '1,284 automated transactions verified against immutable ledger without drift.',
    timestamp: '3 hours ago',
    read: true,
    actionLabel: 'System Check',
  },
];

export function calculatePriorityEngine(caseItem: Partial<ApprovalCase>): PriorityBreakdown {
  const amount = caseItem.amount || 0;
  const risk = caseItem.riskScore || 20;
  const remaining = caseItem.slaRemainingSeconds !== undefined ? caseItem.slaRemainingSeconds : 3600;

  const financialImpact: 'HIGH' | 'MEDIUM' | 'LOW' = amount >= 500 ? 'HIGH' : amount >= 100 ? 'MEDIUM' : 'LOW';
  const customerImpact: 'HIGH' | 'MEDIUM' | 'LOW' = (caseItem.customerName?.includes('Elena') || amount >= 200) ? 'HIGH' : 'MEDIUM';
  const riskImpact: 'HIGH' | 'MEDIUM' | 'LOW' = risk >= 70 ? 'HIGH' : risk >= 30 ? 'MEDIUM' : 'LOW';
  const slaUrgency: 'HIGH' | 'MEDIUM' | 'LOW' = remaining <= 900 ? 'HIGH' : remaining <= 3600 ? 'MEDIUM' : 'LOW';

  let finalPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let explanation = 'Standard operational request with moderate priority.';

  if (slaUrgency === 'HIGH' && (financialImpact === 'HIGH' || riskImpact === 'HIGH')) {
    finalPriority = 'CRITICAL';
    explanation = 'Critical SLA urgency coupled with significant financial or anomaly risk exposure.';
  } else if (financialImpact === 'HIGH' || customerImpact === 'HIGH' || slaUrgency === 'HIGH') {
    finalPriority = 'HIGH';
    explanation = `High ${financialImpact === 'HIGH' ? 'financial value ($' + amount.toFixed(0) + ')' : 'customer impact'} and approaching SLA window.`;
  } else if (financialImpact === 'LOW' && riskImpact === 'LOW' && slaUrgency === 'LOW') {
    finalPriority = 'LOW';
    explanation = 'Low financial impact within automated bounds with healthy SLA margin.';
  }

  return {
    financialImpact,
    customerImpact,
    risk: riskImpact,
    slaUrgency,
    finalPriority,
    explanation,
  };
}
