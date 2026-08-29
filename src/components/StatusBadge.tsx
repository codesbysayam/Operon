import React from 'react';
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  XCircle,
  Pause,
  Play,
} from 'lucide-react';

export type StatusType =
  | 'pending'
  | 'pending_gate'
  | 'needs_approval'
  | 'awaiting_approval'
  | 'in-progress'
  | 'in_progress'
  | 'running'
  | 'active'
  | 'completed'
  | 'approved'
  | 'finished'
  | 'failed'
  | 'rejected'
  | 'blocked'
  | 'error'
  | 'paused'
  | 'idle';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  glass?: boolean;
  variant?: 'badge' | 'dot' | 'minimal';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  showIcon = true,
  variant = 'badge',
  className = '',
}) => {
  const normalizedStatus = (status || '').toLowerCase().replace('-', '_') as StatusType;

  // Dot only mode
  if (variant === 'dot') {
    switch (normalizedStatus) {
      case 'running':
      case 'in_progress':
      case 'active':
        return <span className="status-dot-running inline-block shrink-0" title="Running" />;
      case 'completed':
      case 'approved':
      case 'finished':
        return <span className="status-dot-completed inline-block shrink-0" title="Completed" />;
      case 'pending':
      case 'pending_gate':
      case 'needs_approval':
      case 'awaiting_approval':
        return <span className="status-dot-pending inline-block shrink-0" title="Pending Approval" />;
      case 'failed':
      case 'rejected':
      case 'blocked':
      case 'error':
        return <span className="status-dot-failed inline-block shrink-0" title="Failed" />;
      default:
        return <span className="status-dot-paused inline-block shrink-0" title="Idle" />;
    }
  }

  // Determine colors, icons, and human-readable label
  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'active':
        return {
          text: label || 'ACTIVE',
          bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          dotColor: 'bg-emerald-400',
          icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />,
        };

      case 'completed':
      case 'approved':
      case 'finished':
        return {
          text: label || 'COMPLETED',
          bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          dotColor: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />,
        };

      case 'running':
      case 'in_progress':
        return {
          text: label || 'RUNNING',
          bgColor: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
          dotColor: 'bg-sky-400',
          icon: <Loader2 className="w-3 h-3 text-sky-400 animate-spin shrink-0" />,
        };

      case 'pending':
      case 'pending_gate':
      case 'needs_approval':
      case 'awaiting_approval':
        return {
          text: label || (normalizedStatus === 'pending_gate' ? 'PENDING GATE' : 'PENDING'),
          bgColor: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
          dotColor: 'bg-amber-400',
          icon: <ShieldAlert className="w-3 h-3 text-amber-300 shrink-0" />,
        };

      case 'failed':
      case 'rejected':
      case 'blocked':
      case 'error':
        return {
          text: label || 'FAILED',
          bgColor: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
          dotColor: 'bg-rose-400',
          icon: <XCircle className="w-3 h-3 text-rose-400 shrink-0" />,
        };

      case 'paused':
      case 'idle':
      default:
        return {
          text: label || (normalizedStatus === 'paused' ? 'PAUSED' : 'IDLE'),
          bgColor: 'bg-white/5 text-white/60 border-white/10',
          dotColor: 'bg-white/40',
          icon: <Clock className="w-3 h-3 text-white/50 shrink-0" />,
        };
    }
  };

  const config = getStatusConfig();

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-[11px] px-2.5 py-1 gap-1.5 font-medium',
    md: 'text-xs px-3 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        font-mono tracking-tight select-none
        ${config.bgColor}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && config.icon}
      <span>{config.text}</span>
    </span>
  );
};
