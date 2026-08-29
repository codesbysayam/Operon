import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  Cpu,
  FlaskConical,
  Activity,
  Bot,
} from 'lucide-react';
import { ExecutingWorkflowState, ExecutionMode } from '../types';

export interface ToastNotification {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'info' | 'running';
  timestamp: string;
  workflowName?: string;
  caseNumber?: string;
  actionLabel?: string;
  onAction?: () => void;
  progress?: number;
  currentStep?: string;
  totalSteps?: number;
  currentStepIndex?: number;
  executionMode?: ExecutionMode;
}

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  executingWorkflow?: ExecutingWorkflowState | null;
  isExecuting?: boolean;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  executingWorkflow,
  isExecuting,
}) => {
  const hasContent = (toasts && toasts.length > 0) || (isExecuting && executingWorkflow);
  if (!hasContent) return null;

  return (
    <div
      id="toast-notifications-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm sm:max-w-md w-full pointer-events-none select-none"
    >
      {/* Active Executing Workflow Progress Bar Notification */}
      {isExecuting && executingWorkflow && (
        <ExecutingWorkflowToast workflow={executingWorkflow} />
      )}

      {/* Standard / Completed / Gate Approval Notifications */}
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

// ==========================================
// Executing Workflow Progress Toast Component
// ==========================================
interface ExecutingWorkflowToastProps {
  workflow: ExecutingWorkflowState;
}

const ExecutingWorkflowToast: React.FC<ExecutingWorkflowToastProps> = ({ workflow }) => {
  const isLive = workflow.mode === 'live';
  const isSandbox = workflow.mode === 'sandbox';

  const modeTheme = isLive
    ? {
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        barGradient: 'from-emerald-500 via-teal-400 to-cyan-300',
        glow: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        tag: 'LIVE PRODUCTION',
      }
    : isSandbox
    ? {
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        barGradient: 'from-cyan-500 via-sky-400 to-blue-400',
        glow: 'bg-cyan-500/15',
        border: 'border-cyan-500/40',
        iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        tag: 'SANDBOX TEST',
      }
    : {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        barGradient: 'from-amber-500 via-yellow-400 to-amber-300',
        glow: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        tag: 'DEMO RUN',
      };

  const progressPercent = Math.max(5, Math.min(100, workflow.progress));

  return (
    <div
      id="executing-workflow-toast"
      className={`pointer-events-auto relative overflow-hidden bg-[#0a0c13]/95 backdrop-blur-2xl border ${modeTheme.border} rounded-3xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-5 fade-in duration-300 transition-all`}
    >
      {/* Background Mode Glow */}
      <div
        className={`absolute -top-12 -right-12 w-40 h-40 ${modeTheme.glow} rounded-full blur-3xl pointer-events-none`}
      />

      <div className="space-y-3 relative z-10">
        {/* Top Header: Badge, Mode, Progress Percent */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-xl border ${modeTheme.iconBg}`}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span
                className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border shadow-sm ${modeTheme.badge}`}
              >
                {modeTheme.tag}
              </span>
              {workflow.caseNumber && (
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {workflow.caseNumber}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 font-mono">
            <span className="text-xs font-black text-white">{progressPercent}%</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block ml-1" />
          </div>
        </div>

        {/* Workflow Title & Active Step Header */}
        <div>
          <h4 className="text-xs font-extrabold text-white truncate leading-tight">
            {workflow.workflowName}
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 flex items-center space-x-1.5">
            <span className="text-amber-300 font-semibold">
              Step {workflow.currentStepIndex}/{workflow.totalSteps}:
            </span>
            <span className="truncate text-slate-200">{workflow.currentStepName}</span>
          </p>
        </div>

        {/* Dynamic Progress Bar Container */}
        <div className="space-y-1.5">
          <div className="relative w-full h-2.5 rounded-full bg-black/60 border border-white/15 overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${modeTheme.barGradient} transition-all duration-300 ease-out relative overflow-hidden shadow-sm`}
              style={{ width: `${progressPercent}%` }}
            >
              {/* Active Scanner Shimmer Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-24 h-full animate-shimmer" />
            </div>
          </div>

          {/* Active Agent Info & Live Telemetry */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
            <div className="flex items-center space-x-1 truncate max-w-[220px]">
              <Bot className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate text-slate-300">
                {workflow.activeAgentName || 'Agent Engine'}
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 shrink-0">
              {progressPercent === 100 ? 'Finalizing' : 'Processing'}
            </span>
          </div>
        </div>

        {/* Status Text Details */}
        {workflow.statusText && (
          <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] text-slate-300 font-mono flex items-center space-x-1.5">
            <Activity className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
            <span className="truncate">{workflow.statusText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// Standard Toast Item Component
// ==========================================
interface ToastItemProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const isRunning = toast.status === 'running';

  useEffect(() => {
    // Only auto-dismiss non-running toasts
    if (isRunning) return;

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.status, isRunning, onDismiss]);

  const getStatusIcon = () => {
    switch (toast.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'pending':
        return <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBadgeStyle = () => {
    switch (toast.status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'failed':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'running':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  const getTimerGradient = () => {
    switch (toast.status) {
      case 'completed':
        return 'from-emerald-500 to-emerald-300';
      case 'pending':
        return 'from-amber-500 to-amber-300';
      case 'failed':
        return 'from-rose-500 to-rose-300';
      default:
        return 'from-cyan-500 to-cyan-300';
    }
  };

  return (
    <div
      className="pointer-events-auto relative overflow-hidden bg-[#0d0f17]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-5 fade-in duration-300 transition-all hover:border-amber-500/40 group"
    >
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-2xl bg-white/5 border border-white/10 shadow-inner mt-0.5">
            {getStatusIcon()}
          </div>

          <div className="space-y-1 pr-2">
            <div className="flex items-center space-x-2">
              <span
                className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border shadow-sm ${getBadgeStyle()}`}
              >
                {toast.status === 'completed'
                  ? 'SUCCESS'
                  : toast.status === 'pending'
                  ? 'AWAITING APPROVAL'
                  : toast.status === 'running'
                  ? 'EXECUTING'
                  : toast.status.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{toast.timestamp}</span>
            </div>

            <h4 className="text-xs font-extrabold text-white leading-snug">{toast.title}</h4>
            <p className="text-[11px] text-slate-300 leading-normal">{toast.description}</p>

            {/* In-toast Progress Bar if defined */}
            {toast.progress !== undefined && (
              <div className="pt-2 space-y-1">
                <div className="relative w-full h-1.5 rounded-full bg-black/60 border border-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(5, Math.min(100, toast.progress))}%` }}
                  />
                </div>
                {toast.currentStep && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="truncate">{toast.currentStep}</span>
                    <span>{toast.progress}%</span>
                  </div>
                )}
              </div>
            )}

            {toast.onAction && toast.actionLabel && (
              <button
                onClick={toast.onAction}
                className="mt-2 inline-flex items-center space-x-1 text-[11px] font-extrabold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer group-hover:translate-x-0.5 duration-200"
              >
                <span>{toast.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-Dismiss Animated Progress Bar for completed/pending/failed items */}
      {!isRunning && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getTimerGradient()} w-full animate-[shrink_6s_linear_forwards]`}
          />
        </div>
      )}
    </div>
  );
};
