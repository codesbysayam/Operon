import React, { useState } from 'react';
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Play,
  X,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  UserCheck,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PolicyConfig, WorkspaceType } from '../types';

interface PolicySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyConfig: PolicyConfig;
  onUpdatePolicyConfig?: (newConfig: Partial<PolicyConfig>) => void;
  onSavePolicy?: (newConfig: Partial<PolicyConfig>) => void;
  onInjectCase?: (customCaseData: {
    amount: number;
    riskScore: number;
    workspace: WorkspaceType;
    title: string;
    customerName: string;
  }) => void;
  onInjectDemoCase?: (
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
  activeWorkspace?: WorkspaceType;
}

export const PolicySimulatorModal: React.FC<PolicySimulatorModalProps> = ({
  isOpen,
  onClose,
  policyConfig,
  onUpdatePolicyConfig,
  onSavePolicy,
  onInjectCase,
  onInjectDemoCase,
  activeWorkspace = 'support',
}) => {
  const [simAmount, setSimAmount] = useState<number>(249);
  const [simRisk, setSimRisk] = useState<number>(18);
  const [simTenureMonths, setSimTenureMonths] = useState<number>(24);
  const [simWorkspace, setSimWorkspace] = useState<WorkspaceType>(activeWorkspace);
  const [simAutoCap, setSimAutoCap] = useState<number>(policyConfig?.autoRefundLimit || 100);

  if (!isOpen) return null;

  const handleUpdatePolicy = (newConfig: Partial<PolicyConfig>) => {
    if (onUpdatePolicyConfig) {
      onUpdatePolicyConfig(newConfig);
    } else if (onSavePolicy) {
      onSavePolicy(newConfig);
    }
  };

  // Real-time evaluation logic
  const isFraudEscalation = simRisk >= 70;
  const isHighValue = simAmount >= (policyConfig?.requireApprovalForHighValueInvoices || 1000);
  const exceedsAutoCap = simAmount > simAutoCap;

  let outcome: 'AUTONOMOUS' | 'HUMAN_GATE' | 'FRAUD_BLOCK';
  let outcomeTitle = '';
  let outcomeDesc = '';
  let triggeredRules: string[] = [];

  if (isFraudEscalation) {
    outcome = 'FRAUD_BLOCK';
    outcomeTitle = 'CRITICAL FRAUD ESCALATION — SECURITY LOCK';
    outcomeDesc = `Fraud Sentinel computed risk score of ${simRisk}/100 exceeding critical threshold (70/100). All automated execution halted. Mandatory Senior Lead investigation.`;
    triggeredRules.push('RULE_FRAUD_RISK_THRESHOLD_EXCEEDED (Risk >= 70)');
    if (exceedsAutoCap) triggeredRules.push('RULE_AUTO_REFUND_LIMIT');
  } else if (exceedsAutoCap || isHighValue) {
    outcome = 'HUMAN_GATE';
    outcomeTitle = 'HOLD AT HUMAN APPROVAL GATE — HARD BOUNDARY';
    outcomeDesc = `Transaction amount ($${simAmount.toFixed(2)}) breaches configured autonomous cap ($${simAutoCap.toFixed(2)}). Release Guardian pauses execution and dispatches decision card to Human Cockpit.`;
    if (exceedsAutoCap) triggeredRules.push(`RULE_AUTO_REFUND_LIMIT ($${simAmount} > $${simAutoCap} cap)`);
    if (isHighValue) triggeredRules.push(`RULE_HIGH_VALUE_TRANSACTION ($${simAmount} >= $1,000)`);
    if (simRisk >= 30) triggeredRules.push(`RULE_ELEVATED_RISK_REVIEW (Risk ${simRisk}/100)`);
  } else {
    outcome = 'AUTONOMOUS';
    outcomeTitle = 'AUTONOMOUS RELEASE CERTIFICATE GRANTED';
    outcomeDesc = `Amount ($${simAmount.toFixed(2)}) is within $${simAutoCap.toFixed(2)} safety threshold and Fraud Risk (${simRisk}/100) is low. Task Executor is authorized to perform mutation with zero human friction.`;
    triggeredRules.push('RULE_AUTONOMOUS_APPROVED (Within all safety invariants)');
  }

  // Presets
  const applyPreset = (amount: number, risk: number, tenure: number, ws: WorkspaceType) => {
    setSimAmount(amount);
    setSimRisk(risk);
    setSimTenureMonths(tenure);
    setSimWorkspace(ws);
  };

  const handleInject = () => {
    const payload = {
      amount: simAmount,
      riskScore: simRisk,
      workspace: simWorkspace,
      title: `Simulated ${simWorkspace.toUpperCase()} Case ($${simAmount.toFixed(2)} / Risk ${simRisk})`,
      customerName: 'Simulated User Profile',
    };

    if (onInjectCase) {
      onInjectCase(payload);
    } else if (onInjectDemoCase) {
      onInjectDemoCase(simWorkspace, payload);
    }
    onClose();
  };

  return (
    <div
      id="policy-simulator-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#0E1017] border border-white/[0.15] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-[#5EA0FF]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Interactive Policy Governance Simulator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-[#5EA0FF] border border-blue-500/30 font-semibold">
                  LIVE SANDBOX
                </span>
              </h2>
              <p className="text-xs text-white/50">
                Adjust operational parameters in real-time to inspect the Release Guardian decision boundary.
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-bold">
              Quick Test Scenario Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPreset(45, 12, 36, 'support')}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  simAmount === 45 && simRisk === 12
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                <div className="font-semibold text-xs text-emerald-400">$45 Safe Refund</div>
                <div className="text-[10px] text-white/40">Autonomous Pass</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(249, 18, 24, 'support')}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  simAmount === 249 && simRisk === 18
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                <div className="font-semibold text-xs text-[#FFB000]">$249 Duplicate</div>
                <div className="text-[10px] text-white/40">Human Gate ($100 Cap)</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(1450, 22, 18, 'finance')}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  simAmount === 1450 && simWorkspace === 'finance'
                    ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                <div className="font-semibold text-xs text-[#5EA0FF]">$1,450 Wire Invoice</div>
                <div className="text-[10px] text-white/40">Finance Gate ($1k)</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(3200, 85, 2, 'support')}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  simRisk === 85
                    ? 'bg-red-500/15 border-red-500/50 text-red-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                <div className="font-semibold text-xs text-[#FF5C6C]">$3.2k Fraud Spike</div>
                <div className="text-[10px] text-white/40">Risk 85/100 Security Lock</div>
              </button>
            </div>
          </div>

          {/* Interactive Sliders Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            {/* Slider 1: Transaction Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#FFB000]" />
                  <span>Transaction Amount</span>
                </span>
                <span className="font-mono text-sm font-bold text-[#FFB000]">
                  ${simAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={5000}
                step={10}
                value={simAmount}
                onChange={(e) => setSimAmount(Number(e.target.value))}
                className="w-full accent-[#FFB000] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>$10</span>
                <span>$500</span>
                <span>$1,000</span>
                <span>$5,000</span>
              </div>
            </div>

            {/* Slider 2: Configured Auto-Refund Cap */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Release Guardian Auto-Cap</span>
                </span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  ${simAutoCap.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={1000}
                step={25}
                value={simAutoCap}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSimAutoCap(val);
                  handleUpdatePolicy({ autoRefundLimit: val });
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>$25</span>
                <span>$100 (Default)</span>
                <span>$500</span>
                <span>$1,000</span>
              </div>
            </div>

            {/* Slider 3: Fraud Risk Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FF5C6C]" />
                  <span>Fraud Sentinel Risk Score</span>
                </span>
                <span
                  className={`font-mono text-sm font-bold ${
                    simRisk >= 70
                      ? 'text-[#FF5C6C]'
                      : simRisk >= 30
                      ? 'text-[#FFB000]'
                      : 'text-emerald-400'
                  }`}
                >
                  {simRisk} / 100
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={simRisk}
                onChange={(e) => setSimRisk(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>0 (Clean)</span>
                <span>30 (Review)</span>
                <span>70 (Escalate)</span>
                <span>100 (Critical)</span>
              </div>
            </div>

            {/* Slider 4: Customer Account Tenure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#5EA0FF]" />
                  <span>Customer Account Tenure</span>
                </span>
                <span className="font-mono text-sm font-bold text-[#5EA0FF]">
                  {simTenureMonths} Months
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={48}
                step={1}
                value={simTenureMonths}
                onChange={(e) => setSimTenureMonths(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>1 mo (New)</span>
                <span>12 mo</span>
                <span>24 mo (Loyal)</span>
                <span>48 mo (VIP)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Result Visualizer Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              outcome === 'AUTONOMOUS'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                : outcome === 'HUMAN_GATE'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                : 'bg-red-500/10 border-red-500/40 text-red-200'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              {outcome === 'AUTONOMOUS' ? (
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : outcome === 'HUMAN_GATE' ? (
                <div className="p-2 rounded-xl bg-amber-500/20 text-[#FFB000]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-red-500/20 text-[#FF5C6C]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-75">
                  OPERON Decision Engine Output
                </span>
                <h3 className="text-sm font-bold text-white tracking-wide">{outcomeTitle}</h3>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed pl-10 mb-3">{outcomeDesc}</p>

            {/* Triggered Rules Matrix */}
            <div className="pl-10 space-y-1.5 pt-2 border-t border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                Triggered Invariant Policy Rules:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {triggeredRules.map((rule, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-white/[0.08] text-white/90 border border-white/[0.12]"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="text-[11px] text-white/50 font-mono">
            Mode: Sandbox Simulation • Invariant Checks Verified
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleInject}
              className="px-4 py-2 rounded-xl bg-[#FFB000] hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Inject into Active Approval Queue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
