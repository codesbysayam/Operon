import React, { useState } from 'react';
import { ApprovalCase, PolicyConfig } from '../types';
import {
  Cpu,
  Shield,
  ShieldAlert,
  Zap,
  UserCheck,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowDown,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface DecisionFabricProps {
  currentCase?: ApprovalCase | null;
  policyConfig: PolicyConfig;
  onApproveCase?: (id: string) => void;
  onRejectCase?: (id: string) => void;
}

export const DecisionFabricVisualizer: React.FC<DecisionFabricProps> = ({
  currentCase,
  policyConfig,
  onApproveCase,
  onRejectCase,
}) => {
  const [expandedNode, setExpandedNode] = useState<string | null>('policy');

  // Fallback demo case if none active
  const activeCase: ApprovalCase = currentCase || {
    id: 'demo-fabric-case',
    caseNumber: 'CS-2490',
    customerName: 'Sofia Karim',
    customerEmail: 'sofia.karim@enterprise-corp.com',
    workspace: 'support',
    title: 'Duplicate Charge Refund Request ($249.00)',
    summary: 'Customer billed twice due to gateway retry timeout.',
    amount: 249.0,
    type: 'REFUND_REQUEST',
    confidenceScore: 94,
    recommendedAction: 'APPROVE',
    reasoning: [
      'Intent parsed: $249 duplicate transaction refund.',
      'Customer history: Sofia Karim, 3.2 year tenure, zero past disputes.',
      `Fraud Sentinel risk score: 18/100 (LOW RISK).`,
      `Policy Limit check: $249.00 > $${policyConfig.autoRefundLimit}.00 threshold. Escalating to Human Approval Gate.`,
    ],
    status: 'pending',
    timestamp: 'Just now',
    pipelineSteps: [],
  };

  const amount = activeCase.amount ?? 249.0;
  const requiresHumanGate = amount > policyConfig.autoRefundLimit;

  return (
    <section
      id="ai-decision-fabric"
      className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-6"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="meta-label text-[#FFB000]">OPERON Policy Engine</span>
            <span className="text-white/20">•</span>
            <span className="meta-label">Real-time Reasoning</span>
          </div>
          <h2 className="section-title">
            Visual AI Decision Flow &amp; Policy Routing
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Real-time multi-agent reasoning graph evaluating <span className="text-white font-mono font-semibold">{activeCase.caseNumber}</span> (${amount.toFixed(2)}) against centralized Policy Limit (<span className="text-[#FFB000] font-mono font-semibold">${policyConfig.autoRefundLimit}.00</span>).
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] font-mono text-xs shrink-0">
          <div>
            <span className="text-[10px] text-white/40 uppercase block font-sans">Policy Threshold</span>
            <span className="text-xs font-bold text-[#FFB000]">${policyConfig.autoRefundLimit}.00 Limit</span>
          </div>
          <div className="h-6 w-px bg-white/[0.08]" />
          <div>
            <span className="text-[10px] text-white/40 uppercase block font-sans">Active Route</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
              requiresHumanGate
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}>
              {requiresHumanGate ? 'HUMAN GATE' : 'AUTONOMOUS'}
            </span>
          </div>
        </div>
      </div>

      {/* Decision Fabric Flow Diagram */}
      <div className="space-y-3 py-1">
        <div className="flex flex-col items-center max-w-xl mx-auto space-y-2.5">

          {/* NODE 1: Incoming Operational Event */}
          <div
            onClick={() => setExpandedNode(expandedNode === 'event' ? null : 'event')}
            className={`w-full p-3.5 rounded-[16px] cursor-pointer transition-all border ${
              expandedNode === 'event'
                ? 'border-[#FFB000]/60 bg-[#FFB000]/[0.06]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[#5EA0FF]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#5EA0FF] font-semibold">STEP 1 • TRIGGER</span>
                    <span className="text-[10px] font-mono text-white/40">Payload Received</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">Operational Event: Refund Request</h4>
                </div>
              </div>
              <div className="text-right font-mono flex items-center space-x-2">
                <span className="text-xs font-semibold text-white">${amount.toFixed(2)}</span>
                {expandedNode === 'event' ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
              </div>
            </div>

            {expandedNode === 'event' && (
              <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] text-xs space-y-1 text-white/70 font-mono">
                <p>Case: <strong className="text-white">{activeCase.caseNumber}</strong> ({activeCase.customerName})</p>
                <p>Workspace: <span className="text-[#FFB000] uppercase">{activeCase.workspace}</span></p>
                <p className="text-[11px] text-white/50 italic">&quot;{activeCase.summary}&quot;</p>
              </div>
            )}
          </div>

          <ArrowDown className="w-3.5 h-3.5 text-white/30" />

          {/* NODE 2: Intent Analyst Agent */}
          <div
            onClick={() => setExpandedNode(expandedNode === 'intent' ? null : 'intent')}
            className={`w-full p-3.5 rounded-[16px] cursor-pointer transition-all border ${
              expandedNode === 'intent'
                ? 'border-[#FFB000]/60 bg-[#FFB000]/[0.06]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[#5EA0FF]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#5EA0FF] font-semibold">STEP 2 • ANALYST</span>
                    <span className="text-[10px] font-mono text-[#22D3A7]">98% Confidence</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">Intent Analyst Agent</h4>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                PASSED
              </span>
            </div>

            {expandedNode === 'intent' && (
              <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] text-xs space-y-1 text-white/70 font-mono">
                <p>Extracted Intent: <strong className="text-white">REFUND_REQUEST</strong></p>
                <p>Identified Amount: <strong className="text-[#FFB000]">${amount.toFixed(2)}</strong></p>
                <p>Customer Profile: <strong className="text-white">{activeCase.customerEmail}</strong></p>
              </div>
            )}
          </div>

          <ArrowDown className="w-3.5 h-3.5 text-white/30" />

          {/* NODE 3: Context Memory & Fraud Sentinel */}
          <div
            onClick={() => setExpandedNode(expandedNode === 'memory' ? null : 'memory')}
            className={`w-full p-3.5 rounded-[16px] cursor-pointer transition-all border ${
              expandedNode === 'memory'
                ? 'border-[#FFB000]/60 bg-[#FFB000]/[0.06]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-purple-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-purple-400 font-semibold">STEP 3 • FRAUD SENTINEL</span>
                    <span className="text-[10px] font-mono text-[#22D3A7]">Risk: 18/100 (LOW)</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">Fraud &amp; Anomaly Sentinel</h4>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                CLEARED
              </span>
            </div>

            {expandedNode === 'memory' && (
              <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] text-xs space-y-1 text-white/70 font-mono">
                <p>Account Tenure: <strong className="text-white">3.2 Years</strong> (Zero prior disputes)</p>
                <p>Fraud Anomaly Score: <strong className="text-[#22D3A7]">18 / 100 (LOW)</strong></p>
                <p>Recommendation: <strong className="text-white">PROCEED TO POLICY EVALUATION</strong></p>
              </div>
            )}
          </div>

          <ArrowDown className="w-3.5 h-3.5 text-white/30" />

          {/* NODE 4: Policy Gate (Branching Point) */}
          <div
            onClick={() => setExpandedNode(expandedNode === 'policy' ? null : 'policy')}
            className={`w-full p-3.5 rounded-[16px] cursor-pointer transition-all border ${
              expandedNode === 'policy'
                ? 'border-[#FFB000]/60 bg-[#FFB000]/[0.08]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[#FFB000]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#FFB000] font-semibold">STEP 4 • POLICY GATE</span>
                    <span className="text-[10px] font-mono text-white/50">Cap: ${policyConfig.autoRefundLimit}.00</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">Release Guardian &amp; Policy Gate</h4>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                requiresHumanGate
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {requiresHumanGate ? 'GATE TRIGGERED' : 'AUTO-APPROVE'}
              </span>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] text-xs space-y-1 text-white/70 font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span>Requested: <strong className="text-white">${amount.toFixed(2)}</strong></span>
                <span>Configured Limit: <strong className="text-[#FFB000]">${policyConfig.autoRefundLimit}.00</strong></span>
              </div>
              <p className="text-[11px] leading-relaxed text-white/50 pt-0.5">
                {requiresHumanGate
                  ? `Amount ($${amount.toFixed(2)}) exceeds Auto Refund Cap ($${policyConfig.autoRefundLimit}.00). Pipeline pauses for Human Sign-off.`
                  : `Amount ($${amount.toFixed(2)}) is within Auto Refund Cap ($${policyConfig.autoRefundLimit}.00). Proceeding to Auto Execution.`}
              </p>
            </div>
          </div>

          {/* BRANCHING DECISION CARDS */}
          <div className="w-full grid grid-cols-2 gap-3 pt-1">
            {/* BRANCH A: AUTO EXECUTION */}
            <div
              className={`p-3.5 rounded-[16px] text-center space-y-1.5 border transition-all ${
                !requiresHumanGate
                  ? 'border-emerald-500/50 bg-emerald-500/[0.08]'
                  : 'opacity-40 bg-white/[0.02] border-white/[0.06]'
              }`}
            >
              <Zap className="w-4 h-4 text-[#22D3A7] mx-auto" />
              <h5 className="text-xs font-semibold text-white">AUTO EXECUTION</h5>
              <p className="text-[10px] text-white/50">
                Amount ≤ ${policyConfig.autoRefundLimit}.00. Auto-processed.
              </p>
            </div>

            {/* BRANCH B: HUMAN APPROVAL GATE */}
            <div
              className={`p-3.5 rounded-[16px] text-center space-y-1.5 border transition-all ${
                requiresHumanGate
                  ? 'border-amber-500/50 bg-amber-500/[0.08]'
                  : 'opacity-40 bg-white/[0.02] border-white/[0.06]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#FFB000] mx-auto" />
              <h5 className="text-xs font-semibold text-white">HUMAN APPROVAL GATE</h5>
              <p className="text-[10px] text-white/50">
                Amount &gt; ${policyConfig.autoRefundLimit}.00. Paused for sign-off.
              </p>
            </div>
          </div>

          <ArrowDown className="w-3.5 h-3.5 text-white/30" />

          {/* NODE 5: Task Executor & Audit Log */}
          <div className="w-full p-3.5 rounded-[16px] bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl border text-xs ${
                  activeCase.status === 'approved'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : activeCase.status === 'rejected'
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-[#FFB000]'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#22D3A7] font-semibold">STEP 5 • COMPLETION</span>
                  <h4 className="text-xs font-semibold text-white">Task Executor &amp; Audit Trail</h4>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  activeCase.status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : activeCase.status === 'rejected'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {activeCase.status === 'approved'
                  ? 'EXECUTED'
                  : activeCase.status === 'rejected'
                  ? 'BLOCKED'
                  : 'AWAITING SIGN-OFF'}
              </span>
            </div>

            {/* Interactive Human Gate Control Bar */}
            {activeCase.status === 'pending' && onApproveCase && onRejectCase && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono text-white/40">Supervisor Action:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRejectCase(activeCase.id)}
                    className="btn-secondary text-xs h-8 px-3 text-rose-400 hover:text-rose-300"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApproveCase(activeCase.id)}
                    className="btn-primary text-xs h-8 px-3"
                  >
                    Approve &amp; Execute
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
