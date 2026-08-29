import React, { useState } from 'react';
import { WorkspaceType } from '../types';
import { Lightbulb, Sparkles, ShieldAlert, Zap, Info } from 'lucide-react';

export const WORKSPACE_TIPS: Record<
  WorkspaceType,
  { title: string; tip: string; highlight: string; icon: React.ReactNode }
> = {
  finance: {
    title: 'Finance Guardrails',
    tip: 'Ensure you have at least 2 agents assigned for finance workflows to satisfy Dual-Key verification and audit compliance.',
    highlight: '2+ agents required',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
  },
  support: {
    title: 'Support SLA Optimization',
    tip: 'Pair Sentiment Triage with Auto-Responder agents to maintain sub-2 minute Tier-1 resolution times.',
    highlight: 'Sentiment triage recommended',
    icon: <Zap className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
  },
  hr: {
    title: 'HR & IT Compliance',
    tip: 'Assign Compliance Auditor alongside IT Provisioner to ensure SOC2-compliant credential dispatching.',
    highlight: 'SOC2 guardrails active',
    icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
  },
  operations: {
    title: 'Operations Resilience',
    tip: 'Configure fallback retry steps and human-in-the-loop escalation thresholds for mission-critical jobs.',
    highlight: 'Fallback nodes advised',
    icon: <Lightbulb className="w-3.5 h-3.5 text-purple-400 shrink-0" />,
  },
};

interface WorkflowTipBannerProps {
  workspace: WorkspaceType;
  className?: string;
}

/**
 * Contextual inline tip banner displayed right above deploy actions in modal forms.
 */
export const WorkflowTipBanner: React.FC<WorkflowTipBannerProps> = ({
  workspace,
  className = '',
}) => {
  const tipData = WORKSPACE_TIPS[workspace] || WORKSPACE_TIPS.support;

  return (
    <div
      id={`workflow-tip-banner-${workspace}`}
      className={`rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 shadow-lg flex items-start space-x-2.5 transition-all duration-300 ${className}`}
    >
      <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 mt-0.5 shadow-xs">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-black uppercase text-amber-300 tracking-wider">
            Workflow Tip • {tipData.title}
          </span>
          <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
            {workspace.toUpperCase()}
          </span>
        </div>
        <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed font-sans font-medium">
          {tipData.tip}
        </p>
      </div>
    </div>
  );
};

interface DeployButtonWithTipProps {
  workspace: WorkspaceType;
  children: React.ReactNode;
  align?: 'center' | 'end' | 'start';
  className?: string;
  alwaysShowTip?: boolean;
}

/**
 * Wrapper for Deploy Workflow buttons that displays a floating contextual
 * 'Workflow Tip' tooltip above the button on hover/focus or always.
 */
export const DeployButtonWithTip: React.FC<DeployButtonWithTipProps> = ({
  workspace,
  children,
  align = 'center',
  className = '',
  alwaysShowTip = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const tipData = WORKSPACE_TIPS[workspace] || WORKSPACE_TIPS.support;

  const alignmentClass =
    align === 'end'
      ? 'right-0'
      : align === 'start'
      ? 'left-0'
      : 'left-1/2 -translate-x-1/2';

  const showTooltip = alwaysShowTip || isHovered;

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {/* Floating Contextual Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          id={`workflow-deploy-tip-tooltip-${workspace}`}
          className={`absolute bottom-full mb-3 ${alignmentClass} w-72 p-2.5 rounded-2xl bg-[#0e1017]/95 backdrop-blur-xl border border-amber-500/40 shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.25)] text-white z-50 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95`}
        >
          <div className="flex items-start space-x-2">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 mt-0.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[10px] font-mono font-black uppercase text-amber-300 tracking-wider">
                  Workflow Tip
                </span>
                <span className="text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded bg-white/10 text-slate-300 border border-white/10">
                  {workspace}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 font-sans leading-snug font-normal">
                {tipData.tip}
              </p>
            </div>
          </div>

          {/* Downward Caret Arrow */}
          <div
            className={`absolute top-full ${
              align === 'end'
                ? 'right-6'
                : align === 'start'
                ? 'left-6'
                : 'left-1/2 -translate-x-1/2'
            } -mt-px w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-amber-500/50`}
          />
        </div>
      )}

      {children}
    </div>
  );
};
