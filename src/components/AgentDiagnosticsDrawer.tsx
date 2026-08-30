import React, { useState } from 'react';
import {
  X,
  Bot,
  Cpu,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Terminal,
  Activity,
  ShieldCheck,
  Code,
  Sliders,
  Check,
} from 'lucide-react';
import { AgentInfo } from '../types';

interface AgentDiagnosticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentInfo | null;
  onToggleStatus?: (agentId: string) => void;
}

export const AgentDiagnosticsDrawer: React.FC<AgentDiagnosticsDrawerProps> = ({
  isOpen,
  onClose,
  agent,
  onToggleStatus,
}) => {
  const [testPrompt, setTestPrompt] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  if (!isOpen || !agent) return null;

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Dynamic simulation based on agent role
    await new Promise((r) => setTimeout(r, 600));

    let simulatedOutput = '';
    let confidence = 98;
    let tokens = 142;

    switch (agent.role) {
      case 'analyst':
        simulatedOutput = `[INTENT ANALYST OUTPUT]\nIntent: DISPUTE_OR_REFUND_REQUEST\nEntities Extracted: { amount: "$249.00", currency: "USD", transactionType: "SUBSCRIPTION_RENEWAL" }\nSentiment: Frustrated (4.2/10)\nUrgency: HIGH`;
        break;
      case 'memory':
        simulatedOutput = `[CONTEXT MEMORY OUTPUT]\nAccount Age: 730 days (24 months)\nLifetime Value: $5,976.00\nHistorical Disputes: 0\nVIP Tier: Enterprise Gold`;
        break;
      case 'fraud_sentinel':
        simulatedOutput = `[FRAUD SENTINEL OUTPUT]\nComposite Anomaly Score: 18 / 100 (LOW)\nVelocity Check: 1 request in 30 days (NORMAL)\nRisk Verdict: PASS`;
        break;
      case 'planner':
        simulatedOutput = `[WORKFLOW PLANNER OUTPUT]\nDAG Execution Nodes: [Intent -> Memory -> Fraud -> Guardian -> Executor -> Tester]\nPolicy Bound: autoRefundLimit ($100.00)`;
        break;
      case 'release_guardian':
        simulatedOutput = `[RELEASE GUARDIAN OUTPUT]\nPolicy Evaluation: Amount exceeds $100 cap.\nSafety Action: Enforce Human Gate Barrier.\nStatus: HOLD_FOR_HUMAN_LEAD`;
        confidence = 99;
        break;
      case 'executor':
        simulatedOutput = `[TASK EXECUTOR OUTPUT]\nAdapter: Stripe Gateway API\nAction: POST /v1/refunds { charge: "ch_892114", amount: 24900 }\nResponse: 200 OK (Refund Succeeded)`;
        break;
      case 'tester':
        simulatedOutput = `[VALIDATION TESTER OUTPUT]\nInvariant Assertion: Double-entry ledger balanced.\nHTTP Code: 200 OK\nState Reconciliation: VERIFIED_SEALED`;
        break;
      default:
        simulatedOutput = `[${agent.name.toUpperCase()} OUTPUT]\nTask execution completed successfully. Zero safety invariants breached.`;
    }

    setTestResult({
      output: simulatedOutput,
      confidence,
      tokensUsed: tokens,
      latencyMs: 380,
    });
    setIsTesting(false);
  };

  return (
    <div
      id="agent-diagnostics-drawer"
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0E1017] border-l border-white/[0.15] h-full shadow-2xl overflow-y-auto flex flex-col p-6 space-y-6 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-[#FFB000]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">{agent.name}</h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                  {agent.role}
                </span>
              </div>
              <p className="text-xs text-white/50">{agent.domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Invariant Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-amber-200">
          <div className="flex items-center space-x-1.5 font-mono text-[10px] uppercase font-bold text-[#FFB000]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Primary Safety Invariant</span>
          </div>
          <p className="text-xs leading-relaxed font-medium text-white/90">
            {agent.safetyInvariant || 'Read-only access; zero unauthorized state mutations allowed.'}
          </p>
        </div>

        {/* Performance & Telemetry Matrix */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 font-bold">
            Runtime Telemetry & Benchmarks
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="text-[10px] font-mono text-white/40 uppercase">Accuracy Rate</div>
              <div className="text-sm font-mono font-bold text-emerald-400">
                {agent.accuracyRate || 99.2}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="text-[10px] font-mono text-white/40 uppercase">Avg Latency</div>
              <div className="text-sm font-mono font-bold text-[#5EA0FF]">
                {agent.avgLatencyMs || 320}ms
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="text-[10px] font-mono text-white/40 uppercase">Total Runs</div>
              <div className="text-sm font-mono font-bold text-white">
                {agent.totalExecutions?.toLocaleString() || '1,420'}
              </div>
            </div>
          </div>
        </div>

        {/* Bound Tool Registry */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 font-bold">
            Bound Tool Interfaces
          </span>
          <div className="space-y-1.5">
            {(agent.tools || [
              `${agent.role}_execute_task()`,
              `${agent.role}_validate_parameters()`,
            ]).map((toolName, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between font-mono text-[11px]"
              >
                <div className="flex items-center space-x-2 text-white/90">
                  <Code className="w-3.5 h-3.5 text-[#FFB000]" />
                  <span>{toolName}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.08] text-white/60">
                  Sandboxed
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Prompt Testing Sandbox */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-mono text-[10px] uppercase font-bold text-[#5EA0FF]">
              <Terminal className="w-3.5 h-3.5" />
              <span>Interactive Agent Sandbox</span>
            </div>
            <span className="text-[10px] font-mono text-white/40">Direct Model Test</span>
          </div>

          <textarea
            rows={3}
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder={`Enter test payload for ${agent.name}... e.g. "Customer requesting $249 refund due to double charge"`}
            className="w-full bg-black/40 border border-white/[0.08] focus:border-[#FFB000]/60 rounded-xl p-3 text-xs text-white placeholder:text-white/30 outline-none resize-none transition-colors"
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setTestPrompt(
                  'Customer Elena Rostova: "I was billed twice $249.00 for annual plan on August 28"'
                )
              }
              className="text-[10px] font-mono text-[#FFB000] hover:underline cursor-pointer"
            >
              + Load Sample Payload
            </button>

            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="px-4 py-1.5 rounded-xl bg-[#FFB000] hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isTesting ? 'Evaluating...' : 'Run Agent Test'}</span>
            </button>
          </div>

          {/* Test Output */}
          {testResult && (
            <div className="p-3 rounded-xl bg-black/60 border border-white/[0.1] space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                <span>Test Execution Succeeded</span>
                <span>Latency: {testResult.latencyMs}ms</span>
              </div>
              <pre className="font-mono text-[11px] text-white/90 whitespace-pre-wrap break-all leading-relaxed">
                {testResult.output}
              </pre>
            </div>
          )}
        </div>

        {/* Status Toggle & Close Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(agent.id)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all border cursor-pointer ${
                agent.status === 'active'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-white/[0.06] border-white/[0.1] text-white/60 hover:text-white'
              }`}
            >
              {agent.status === 'active' ? 'Status: Active (Online)' : 'Status: Idle (Paused)'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold transition-colors cursor-pointer ml-auto"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
