import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  RotateCw,
  Zap,
  ShieldCheck,
  Eye,
  Check,
  HelpCircle,
  Sliders,
  Award,
} from 'lucide-react';
import { ApprovalCase, ExecutionMode, WorkspaceType } from '../types';

interface GuidedDemoTourBannerProps {
  currentCase?: ApprovalCase | null;
  pendingCasesCount?: number;
  onTriggerScenario?: (scenario: 'A' | 'B' | 'C') => void;
  onApproveCase?: (caseId: string) => void;
  onOpenApprovals?: () => void;
  onOpenSimulator?: () => void;
  onOpenCertificate?: (caseItem?: ApprovalCase) => void;
  executionMode?: ExecutionMode;
  activeWorkspace?: WorkspaceType;
  // Fallback aliases
  onLaunchScenario?: () => void;
  onOpenPolicySimulator?: () => void;
  onNavigateApprovals?: () => void;
}

export const GuidedDemoTourBanner: React.FC<GuidedDemoTourBannerProps> = ({
  currentCase = null,
  pendingCasesCount = 0,
  onTriggerScenario,
  onApproveCase,
  onOpenApprovals,
  onOpenSimulator,
  onOpenCertificate,
  executionMode = 'DEMO',
  activeWorkspace = 'support',
  onLaunchScenario,
  onOpenPolicySimulator,
  onNavigateApprovals,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Determine dynamic step based on case state
  const hasPendingCase = pendingCasesCount > 0;
  const isCaseApproved = currentCase && currentCase.status === 'approved';

  const handleScenario = (scenario: 'A' | 'B' | 'C') => {
    if (onTriggerScenario) {
      onTriggerScenario(scenario);
    } else if (onLaunchScenario) {
      onLaunchScenario();
    }
  };

  const handleOpenSim = () => {
    if (onOpenSimulator) {
      onOpenSimulator();
    } else if (onOpenPolicySimulator) {
      onOpenPolicySimulator();
    }
  };

  const handleOpenAppr = () => {
    if (onOpenApprovals) {
      onOpenApprovals();
    } else if (onNavigateApprovals) {
      onNavigateApprovals();
    }
  };

  const handleCert = (item?: ApprovalCase | null) => {
    if (onOpenCertificate) {
      onOpenCertificate(item || undefined);
    }
  };

  const handleStartAutoPlay = async () => {
    setIsAutoPlaying(true);
    setActiveStep(1);

    // Step 1: Trigger Scenario B ($249 duplicate charge)
    handleScenario('B');
    setActiveStep(2);

    // Wait 2 seconds for pipeline evaluation
    await new Promise((r) => setTimeout(r, 2200));
    setActiveStep(3);
    setIsAutoPlaying(false);
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-emerald-500/10 border border-white/[0.08] rounded-xl text-xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#FFB000]" />
          <span className="font-semibold text-white">Interactive 3-Minute Governance Tour</span>
          <span className="text-white/40 text-[11px]">• Experience how human oversight guards autonomous agents</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDismissed(false)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#FFB000] font-semibold text-[11px] cursor-pointer transition-colors"
          >
            Show Guided Tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="guided-demo-tour-banner"
      className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#12141C] via-[#0E1017] to-[#121820] border border-amber-500/30 p-5 shadow-2xl space-y-4"
    >
      {/* Background ambient subtle glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#FFB000] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#FFB000] font-bold">
                OPERATIONAL DEMO TOUR
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[#FFB000] text-[10px] font-mono font-semibold border border-amber-500/30">
                3-Minute Interactive Walkthrough
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-0.5">
              Experience Human Governance over Autonomous Multi-Agent Workflows
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleOpenSim}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Open Interactive Policy Simulator"
          >
            <Sliders className="w-3.5 h-3.5 text-[#5EA0FF]" />
            <span>Policy Simulator</span>
          </button>

          <button
            onClick={handleStartAutoPlay}
            disabled={isAutoPlaying}
            className="px-3.5 py-1.5 rounded-xl bg-[#FFB000] hover:bg-amber-400 text-black font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAutoPlaying ? 'Running Auto-Tour...' : 'Auto-Play Full Scenario'}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] text-xs transition-colors cursor-pointer"
            title="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 3 Step Interactive Progress Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
        {/* Step 1: Ingest Inbound Request */}
        <div
          onClick={() => setActiveStep(1)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
            activeStep === 1
              ? 'bg-white/[0.07] border-amber-500/50 shadow-lg'
              : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                  hasPendingCase
                    ? 'bg-emerald-500 text-black'
                    : 'bg-amber-500 text-black'
                }`}
              >
                {hasPendingCase ? '✓' : '1'}
              </span>
              <span className="text-xs font-semibold text-white">1. Ingest Inbound Request</span>
            </div>
            <span className="text-[10px] font-mono text-white/40">Scenario Triggers</span>
          </div>

          <p className="text-[11px] text-white/60 leading-tight">
            Trigger a real customer scenario. Intent Analyst & Fraud Sentinel parse request.
          </p>

          <div className="flex items-center space-x-1.5 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleScenario('B');
                setActiveStep(2);
              }}
              className="flex-1 py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[#FFB000] border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Zap className="w-3 h-3" />
              <span>Trigger $249 Duplicate</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleScenario('A');
              }}
              className="py-1 px-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/70 text-[11px] font-medium transition-colors cursor-pointer"
              title="Trigger Safe $45 Auto-Approved Request"
            >
              $45 Safe
            </button>
          </div>
        </div>

        {/* Step 2: Observe Policy Gate Hold */}
        <div
          onClick={() => setActiveStep(2)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
            activeStep === 2
              ? 'bg-white/[0.07] border-amber-500/50 shadow-lg'
              : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[11px] font-mono font-bold">
                2
              </span>
              <span className="text-xs font-semibold text-white">2. Hard Policy Boundary</span>
            </div>
            <span className="text-[10px] font-mono text-[#FFB000]">$100 Limit Check</span>
          </div>

          <p className="text-[11px] text-white/60 leading-tight">
            Release Guardian halts execution because $249 exceeds $100 auto-cap. Zero mutation occurs.
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {hasPendingCase ? `${pendingCasesCount} Cases Awaiting Lead Sign-off` : 'Awaiting Ingestion'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAppr();
                setActiveStep(3);
              }}
              className="py-1 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-[11px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Eye className="w-3 h-3 text-[#FFB000]" />
              <span>Inspect Gate</span>
            </button>
          </div>
        </div>

        {/* Step 3: Human Lead Cockpit Decision */}
        <div
          onClick={() => setActiveStep(3)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
            activeStep === 3
              ? 'bg-white/[0.07] border-emerald-500/50 shadow-lg'
              : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                  isCaseApproved ? 'bg-emerald-500 text-black' : 'bg-emerald-500/30 text-emerald-300'
                }`}
              >
                3
              </span>
              <span className="text-xs font-semibold text-white">3. Human Sign-off & Audit Seal</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">SHA-256 Provenance</span>
          </div>

          <p className="text-[11px] text-white/60 leading-tight">
            Human Lead authorizes request. Task Executor mutates gateway & seals cryptographic audit log.
          </p>

          <div className="flex items-center space-x-1.5 pt-1">
            {currentCase && currentCase.status === 'pending' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onApproveCase) onApproveCase(currentCase.id);
                }}
                className="flex-1 py-1 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>1-Click Authorize & Seal</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCert(currentCase);
                }}
                className="flex-1 py-1 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Award className="w-3 h-3" />
                <span>View SOC2 / Audit Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
