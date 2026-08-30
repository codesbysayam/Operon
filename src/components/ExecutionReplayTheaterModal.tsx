import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  X,
  FileCode,
  Check,
  ArrowRight,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';
import { ApprovalCase, PipelineStep, ExecutionMode } from '../types';

interface ExecutionReplayTheaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: ApprovalCase | null;
  caseItem?: ApprovalCase | null;
  onApprove?: (caseId: string, notes?: string) => void;
  onReject?: (caseId: string, notes?: string) => void;
  executionMode?: ExecutionMode;
}

export const ExecutionReplayTheaterModal: React.FC<ExecutionReplayTheaterModalProps> = ({
  isOpen,
  onClose,
  caseData,
  caseItem,
  onApprove,
  onReject,
  executionMode = 'demo',
}) => {
  const activeCase = caseData || caseItem || null;
  const steps = activeCase?.pipelineSteps || [];
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copiedTrace, setCopiedTrace] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(250, Math.floor(1200 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, steps.length]);

  if (!isOpen || !activeCase) return null;

  const currentStep = steps[currentStepIndex] || steps[0];
  const progressPercent = steps.length > 0 ? Math.round(((currentStepIndex + 1) / steps.length) * 100) : 0;

  const handleCopyTrace = () => {
    navigator.clipboard.writeText(JSON.stringify(activeCase, null, 2));
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  const getAgentColor = (role: string) => {
    switch (role) {
      case 'analyst':
        return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
      case 'memory':
        return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
      case 'fraud_sentinel':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'planner':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'release_guardian':
        return 'text-[#FFB000] border-amber-500/40 bg-amber-500/15';
      case 'executor':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'tester':
        return 'text-teal-400 border-teal-500/30 bg-teal-500/10';
      case 'recovery_sentry':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default:
        return 'text-white border-white/20 bg-white/10';
    }
  };

  return (
    <div
      id="execution-replay-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#0E1017] border border-white/[0.15] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#FFB000]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Execution Replay Theater</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70 border border-white/[0.1]">
                  {activeCase.caseNumber}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-[#FFB000] border border-amber-500/30">
                  {executionMode.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-white/50">{activeCase.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyTrace}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-semibold text-white/70 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {copiedTrace ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Copy Trace JSON</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Playback Controls & Progress Bar */}
        <div className="p-4 bg-white/[0.02] border-b border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Play/Pause & Step Jump Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                }}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Restart from Step 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                title="Previous Step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-[#FFB000] hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Replay</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                disabled={currentStepIndex === steps.length - 1}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                title="Next Step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center space-x-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              <span className="text-[10px] font-mono text-white/40 px-2">Speed:</span>
              {[0.5, 1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-[#FFB000] text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Step Status Summary */}
            <div className="text-xs font-mono text-white/70 flex items-center space-x-2">
              <span>
                Step <strong className="text-white">{currentStepIndex + 1}</strong> of{' '}
                <strong className="text-white">{steps.length}</strong>
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[#FFB000]">{progressPercent}% Replayed</span>
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden relative cursor-pointer">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Interactive Step Timeline Rail */}
        <div className="p-4 border-b border-white/[0.08] overflow-x-auto">
          <div className="flex items-center space-x-2 min-w-max">
            {steps.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;
              const isGate = step.agentRole === 'release_guardian';

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2 ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/50 scale-[1.02]'
                      : isPast
                      ? 'bg-white/[0.05] border-white/[0.12] text-white/80'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.04]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isPast
                        ? 'bg-emerald-500 text-black'
                        : isCurrent
                        ? 'bg-[#FFB000] text-black animate-pulse'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </span>
                  <div className="text-left">
                    <div className="text-[11px] font-semibold flex items-center space-x-1">
                      <span>{step.agentName}</span>
                      {isGate && <span className="text-[9px] text-[#FFB000]">🔒</span>}
                    </div>
                    <div className="text-[9px] font-mono text-white/50 max-w-[130px] truncate">
                      {step.stepName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Deep Inspector */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {currentStep && (
            <div className="space-y-4">
              {/* Step Title Header */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold border ${getAgentColor(
                      currentStep.agentRole
                    )}`}
                  >
                    {currentStep.agentRole.toUpperCase()}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{currentStep.stepName}</h3>
                    <p className="text-xs text-white/50">Executed by {currentStep.agentName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <div className="text-[10px] font-mono text-white/40 uppercase">Confidence</div>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {currentStep.confidenceScore || 98}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-white/40 uppercase">Latency</div>
                    <div className="text-xs font-mono font-bold text-[#5EA0FF]">
                      {currentStep.latencyMs || 340}ms
                    </div>
                  </div>
                </div>
              </div>

              {/* Input & Output Split View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step Input */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <div className="flex items-center space-x-2 text-white/60 font-mono text-[10px] uppercase font-bold">
                    <Terminal className="w-3.5 h-3.5 text-[#5EA0FF]" />
                    <span>Step Input Payload</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80 font-mono text-[11px] whitespace-pre-wrap break-all max-h-48 overflow-y-auto leading-relaxed">
                    {currentStep.input || 'No explicit input parameters recorded.'}
                  </pre>
                </div>

                {/* Step Output */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <div className="flex items-center space-x-2 text-white/60 font-mono text-[10px] uppercase font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Agent Output Response</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-emerald-300/90 font-mono text-[11px] whitespace-pre-wrap break-all max-h-48 overflow-y-auto leading-relaxed">
                    {currentStep.output || 'Awaiting agent output execution.'}
                  </pre>
                </div>
              </div>

              {/* Agent Reasoning & Policy Context */}
              {currentStep.reasoning && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-amber-200">
                  <div className="flex items-center space-x-2 font-mono text-[10px] uppercase font-bold text-[#FFB000]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Agent Reasoning & Constraint Invariant</span>
                  </div>
                  <p className="text-xs leading-relaxed text-white/90">{currentStep.reasoning}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-white/50 font-mono">
            <Activity className="w-3.5 h-3.5 text-[#FFB000]" />
            <span>Deterministic Graph Replay Mode Active</span>
          </div>

          <div className="flex items-center space-x-3">
            {activeCase?.status === 'pending' && onApprove && (
              <button
                onClick={() => {
                  onApprove(activeCase.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Execute Action</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Close Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
