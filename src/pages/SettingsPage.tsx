import React from 'react';
import { ExecutionMode, PolicyConfig } from '../types';
import { Settings, Sparkles, Zap, ShieldAlert, Key, CheckCircle2, FlaskConical } from 'lucide-react';

interface SettingsPageProps {
  executionMode: ExecutionMode;
  setExecutionMode: (mode: ExecutionMode) => void;
  policyConfig?: PolicyConfig;
  updatePolicyConfig?: (newConfig: Partial<PolicyConfig>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  executionMode,
  setExecutionMode,
  policyConfig = {
    autoRefundLimit: 100,
    fraudReviewThreshold: 30,
    fraudEscalationThreshold: 70,
    requireApprovalForPolicyExceptions: true,
    requireApprovalForHighValueInvoices: 1000,
    requireApprovalForAccessElevation: true,
  },
  updatePolicyConfig,
}) => {
  return (
    <div
      id="settings-page"
      className="flex-1 overflow-y-auto px-6 py-6 text-white space-y-6 max-w-5xl select-none font-sans"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="meta-label text-[#FFB000]">SYSTEM CONFIGURATION</span>
            <span className="text-white/20">•</span>
            <span className="meta-label">Policy Governance</span>
          </div>
          <h1 className="page-title leading-tight">System Settings &amp; Governance</h1>
          <p className="text-xs text-white/50 mt-1">
            Manage orchestrator runtime modes, Release Guardian policy limits, and security thresholds.
          </p>
        </div>
      </div>

      {/* Execution Mode Selection */}
      <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Orchestrator Execution Mode
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Select an environment tier to control engine behavior, credentials, and external mutation scopes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* DEMO */}
          <div
            onClick={() => setExecutionMode('demo')}
            className={`p-4 rounded-[18px] cursor-pointer transition-all space-y-2 border ${
              executionMode === 'demo'
                ? 'border-[#FFB000] bg-[#FFB000]/[0.08] ring-1 ring-[#FFB000]/40'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-semibold text-xs text-[#FFB000]">
                <Zap className="w-4 h-4" />
                <span>DEMO MODE</span>
              </div>
              {executionMode === 'demo' && <CheckCircle2 className="w-4 h-4 text-[#FFB000]" />}
            </div>
            <p className="text-[11px] text-white/70 font-mono">
              Simulated • Zero side-effects
            </p>
            <div className="text-[10px] text-white/40 border-t border-white/[0.06] pt-2">
              Runs dry-run simulations with predictable outcomes.
            </div>
          </div>

          {/* SANDBOX */}
          <div
            onClick={() => setExecutionMode('sandbox')}
            className={`p-4 rounded-[18px] cursor-pointer transition-all space-y-2 border ${
              executionMode === 'sandbox'
                ? 'border-[#5EA0FF] bg-[#5EA0FF]/[0.08] ring-1 ring-[#5EA0FF]/40'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-semibold text-xs text-[#5EA0FF]">
                <FlaskConical className="w-4 h-4" />
                <span>SANDBOX MODE</span>
              </div>
              {executionMode === 'sandbox' && <CheckCircle2 className="w-4 h-4 text-[#5EA0FF]" />}
            </div>
            <p className="text-[11px] text-white/70 font-mono">
              Real engine • Test APIs
            </p>
            <div className="text-[10px] text-white/40 border-t border-white/[0.06] pt-2">
              Connects to sandbox endpoints and test webhooks.
            </div>
          </div>

          {/* LIVE */}
          <div
            onClick={() => setExecutionMode('live')}
            className={`p-4 rounded-[18px] cursor-pointer transition-all space-y-2 border ${
              executionMode === 'live'
                ? 'border-[#22D3A7] bg-[#22D3A7]/[0.08] ring-1 ring-[#22D3A7]/40'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-semibold text-xs text-[#22D3A7]">
                <Sparkles className="w-4 h-4" />
                <span>LIVE PRODUCTION</span>
              </div>
              {executionMode === 'live' && <CheckCircle2 className="w-4 h-4 text-[#22D3A7]" />}
            </div>
            <p className="text-[11px] text-white/70 font-mono">
              Live APIs • Real-world impact
            </p>
            <div className="text-[10px] text-white/40 border-t border-white/[0.06] pt-2">
              Protected by Release Guardian policy gates &amp; audit trail.
            </div>
          </div>
        </div>
      </div>

      {/* Release Guardian Thresholds */}
      <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Release Guardian Policy Limits
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Enforce strict monetary guardrails. Transactions above this value will strictly require human approval before execution.
          </p>
        </div>

        <div className="space-y-4 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white/90">Auto-Refund Approval Cap (USD)</span>
            <span className="text-sm font-mono font-bold text-[#FFB000] px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
              ${policyConfig.autoRefundLimit}.00
            </span>
          </div>
          <input
            type="range"
            min={25}
            max={500}
            step={25}
            value={policyConfig.autoRefundLimit}
            onChange={(e) => updatePolicyConfig?.({ autoRefundLimit: Number(e.target.value) })}
            className="w-full accent-[#FFB000] cursor-pointer"
          />
          <p className="text-[11px] text-white/50">
            Any refund request equal to or below <span className="text-[#FFB000] font-mono font-semibold">${policyConfig.autoRefundLimit}.00</span> will be automatically executed by Task Executor. Requests above <span className="text-[#FFB000] font-mono font-semibold">${policyConfig.autoRefundLimit}.00</span> will pause for Human Approval.
          </p>
        </div>
      </div>

      {/* Fraud & Anomaly Sentinel Risk Controls */}
      <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">
            Fraud &amp; Anomaly Sentinel Controls
          </h3>
        </div>
        <p className="text-xs text-white/50">
          Configure risk scoring thresholds for transaction pattern evaluation, account velocity checks, and automatic escalation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white/90">Medium Risk Threshold</span>
              <span className="text-xs font-mono font-semibold text-[#FFB000]">
                Score {policyConfig.fraudReviewThreshold ?? 30}/100
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={policyConfig.fraudReviewThreshold ?? 30}
              onChange={(e) => updatePolicyConfig?.({ fraudReviewThreshold: Number(e.target.value) })}
              className="w-full accent-[#FFB000] cursor-pointer"
            />
            <p className="text-[10px] text-white/40">
              Risk scores above <span className="text-[#FFB000] font-mono font-semibold">{policyConfig.fraudReviewThreshold ?? 30}</span> trigger secondary verification and policy flags.
            </p>
          </div>

          <div className="space-y-3 bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white/90">High Risk Escalation</span>
              <span className="text-xs font-mono font-semibold text-rose-400">
                Score {policyConfig.fraudEscalationThreshold ?? 70}/100
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={95}
              step={5}
              value={policyConfig.fraudEscalationThreshold ?? 70}
              onChange={(e) => updatePolicyConfig?.({ fraudEscalationThreshold: Number(e.target.value) })}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <p className="text-[10px] text-white/40">
              Risk scores equal to or above <span className="text-rose-400 font-mono font-semibold">{policyConfig.fraudEscalationThreshold ?? 70}</span> require mandatory human sign-off.
            </p>
          </div>
        </div>
      </div>

      {/* API Key Status */}
      <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-3">
        <div className="flex items-center space-x-2">
          <Key className="w-4 h-4 text-[#FFB000]" />
          <h3 className="text-sm font-semibold text-white">
            Gemini API Key
          </h3>
        </div>
        <p className="text-xs text-white/50">
          Managed via AI Studio secrets configuration (<code className="font-mono text-white/70">GEMINI_API_KEY</code>). Handled securely server-side.
        </p>
        <div className="flex items-center space-x-2 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs text-[#22D3A7] font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#22D3A7]" />
          <span>GEMINI_API_KEY server-side proxy active and healthy.</span>
        </div>
      </div>
    </div>
  );
};
