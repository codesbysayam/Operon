import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  Zap,
  Cpu,
  Bot,
  ArrowRight,
  X,
  Lock,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [selectedAgentNode, setSelectedAgentNode] = useState<string>('release_guardian');

  if (!isOpen) return null;

  const nodeDetails: Record<
    string,
    { title: string; codename: string; roleDesc: string; invariant: string; tools: string[] }
  > = {
    analyst: {
      title: 'Intent Analyst',
      codename: 'agent_analyst_01',
      roleDesc: 'Natural language parsing, intent classification, sentiment analysis, entity extraction.',
      invariant: 'Read-only access; zero external financial mutation privileges.',
      tools: ['intent_classify()', 'sentiment_evaluate()'],
    },
    memory: {
      title: 'Context Memory',
      codename: 'agent_memory_02',
      roleDesc: 'Queries customer account tenure, lifetime value (LTV), past dispute records, and support ticket history.',
      invariant: 'Ephemeral scratchpad access; PII masked in persistent audit logs.',
      tools: ['fetch_customer_history()', 'retrieve_embeddings()'],
    },
    fraud_sentinel: {
      title: 'Fraud & Anomaly Sentinel',
      codename: 'agent_fraud_03',
      roleDesc: 'Calculates multi-factor risk score (0-100), velocity patterns, geolocation, and charge anomaly indices.',
      invariant: 'Immediately halts pipeline if composite risk score >= 70.',
      tools: ['calculate_risk_score()', 'check_velocity_limits()'],
    },
    planner: {
      title: 'Workflow Planner',
      codename: 'agent_planner_04',
      roleDesc: 'Synthesizes intent, context, and risk into a Directed Acyclic Graph (DAG) execution plan.',
      invariant: 'Validates all required parameters before routing to Release Guardian.',
      tools: ['build_execution_graph()', 'evaluate_policy_rules()'],
    },
    release_guardian: {
      title: 'Release Guardian (Policy Gate)',
      codename: 'agent_guardian_05',
      roleDesc: 'Enforces hard monetary caps (e.g. $100 auto-refund cap) and human approval gate barriers.',
      invariant: 'Immutable Barrier: Never allows automated execution if criteria breached without human signature.',
      tools: ['enforce_policy_gate()', 'request_human_authorization()'],
    },
    executor: {
      title: 'Task Executor',
      codename: 'agent_executor_06',
      roleDesc: 'Executes approved API mutations against payment gateways (Stripe), IAM systems (Okta), or ERP ledgers.',
      invariant: 'Requires valid autonomous release certificate or human authorization signature.',
      tools: ['execute_refund()', 'provision_access()'],
    },
    tester: {
      title: 'Validation Tester',
      codename: 'agent_tester_07',
      roleDesc: 'Post-execution invariant verification, double-entry ledger reconciliation, HTTP response checking.',
      invariant: 'Triggers automated rollback via Recovery Sentry if response status != 200.',
      tools: ['verify_ledger_balance()', 'assert_http_response()'],
    },
    recovery_sentry: {
      title: 'Recovery Sentry',
      codename: 'agent_recovery_08',
      roleDesc: 'Compensating transaction execution, state rollbacks, and incident alerting in case of errors.',
      invariant: 'Executes compensating reversals upon failure detection.',
      tools: ['execute_rollback()', 'notify_operations_lead()'],
    },
  };

  const currentDetail = nodeDetails[selectedAgentNode] || nodeDetails.release_guardian;

  return (
    <div
      id="architecture-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#0E1017] border border-white/[0.15] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">OPERON Architecture & Data Fabric</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  TOPOLOGY SPEC
                </span>
              </div>
              <p className="text-xs text-white/50">
                8-Agent Sequential Orchestration with Immutable Release Guardian Gate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Pipeline Topology Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-bold flex items-center justify-between">
              <span>Interactive Pipeline DAG (Click node to inspect)</span>
              <span className="text-[#FFB000]">🔒 Release Guardian Safety Barrier</span>
            </div>

            {/* Pipeline Step Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'analyst', label: '1. Intent Analyst', color: 'sky' },
                { id: 'memory', label: '2. Context Memory', color: 'indigo' },
                { id: 'fraud_sentinel', label: '3. Fraud Sentinel', color: 'amber' },
                { id: 'planner', label: '4. Workflow Planner', color: 'blue' },
                { id: 'release_guardian', label: '5. Release Guardian', color: 'amber', isGate: true },
                { id: 'executor', label: '6. Task Executor', color: 'emerald' },
                { id: 'tester', label: '7. Validation Tester', color: 'teal' },
                { id: 'recovery_sentry', label: '8. Recovery Sentry', color: 'rose' },
              ].map((node) => {
                const isSelected = selectedAgentNode === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedAgentNode(node.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/40 scale-[1.02]'
                        : node.isGate
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/15'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/80 hover:bg-white/[0.06]'
                    }`}
                  >
                    {node.isGate && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-[#FFB000] text-black text-[8px] font-bold font-mono">
                        GATE
                      </span>
                    )}
                    <div className="font-semibold text-xs flex items-center space-x-1.5">
                      <span>{node.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Node Card */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-[#FFB000]/15 text-[#FFB000] border border-[#FFB000]/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{currentDetail.title}</h3>
                  <span className="font-mono text-[10px] text-white/40">{currentDetail.codename}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                SANDBOX VERIFIED
              </span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">{currentDetail.roleDesc}</p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-amber-200">
              <div className="font-mono text-[10px] uppercase font-bold text-[#FFB000]">
                Invariant Constraint:
              </div>
              <p className="text-xs text-white/90">{currentDetail.invariant}</p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-bold">
                Bound Function Signatures:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentDetail.tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-[11px] text-white/90"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tri-Tier Execution Mode Matrix */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-bold">
              Tri-Tier Guardrail Execution Modes
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <div className="font-mono text-xs font-bold text-[#FFB000]">1. DEMO MODE</div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Pure client/server simulation with zero external API calls. Safe for instant sandbox walkthroughs.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <div className="font-mono text-xs font-bold text-[#5EA0FF]">2. SANDBOX MODE</div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Connects to test environments (Stripe Test, Okta Preview) with mock ledger double-entry checks.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <div className="font-mono text-xs font-bold text-emerald-400">3. LIVE PRODUCTION</div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Production mutations guarded by mandatory Release Guardian gates and SHA-256 cryptographic audit logs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="font-mono text-[11px] text-white/40">
            Compliant with SOC2 Trust Principles & ISO 27001
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close Architecture View
          </button>
        </div>
      </div>
    </div>
  );
};
