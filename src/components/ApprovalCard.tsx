import React, { useState } from 'react';
import { ApprovalCase } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Play,
  Award,
  Sparkles,
  ShieldCheck,
  Clock,
  Share2,
  AlertTriangle,
  User,
} from 'lucide-react';

interface ApprovalCardProps {
  caseItem: ApprovalCase;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isSelectable?: boolean;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onOpenReplay?: (caseItem: ApprovalCase) => void;
  onOpenCertificate?: (caseItem: ApprovalCase) => void;
  onInspect?: (caseItem: ApprovalCase) => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  caseItem,
  isSelected = false,
  onToggleSelect,
  isSelectable = caseItem.status === 'pending',
  onApprove,
  onReject,
  onOpenReplay,
  onOpenCertificate,
  onInspect,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');

  const isPending = caseItem.status === 'pending';
  const isApproved = caseItem.status === 'approved';
  const isRejected = caseItem.status === 'rejected';

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectable && onToggleSelect) {
      onToggleSelect(caseItem.id);
    }
  };

  return (
    <div
      id={`approval-card-${caseItem.id}`}
      className={`p-5 rounded-[20px] space-y-4 relative transition-all border ${
        isSelected
          ? 'border-[#FFB000] bg-[#FFB000]/[0.08] ring-1 ring-[#FFB000]/40'
          : 'bg-white/[0.04] hover:bg-white/[0.06] border-white/[0.08]'
      }`}
    >
      {/* Top Bar: Checkbox + Customer & Status Badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          {/* Custom Multi-Select Checkbox */}
          {isSelectable && onToggleSelect ? (
            <button
              type="button"
              id={`approval-checkbox-${caseItem.id}`}
              onClick={handleCheckboxClick}
              title={isSelected ? `Deselect ${caseItem.caseNumber}` : `Select ${caseItem.caseNumber} for batch action`}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#FFB000] text-[#08090D] border border-amber-300'
                  : 'bg-white/[0.04] border border-white/[0.2] hover:border-[#FFB000]/80 text-transparent'
              }`}
            >
              <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`} />
            </button>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              {isApproved ? (
                <CheckCircle2 className="w-4 h-4 text-[#22D3A7]" />
              ) : isRejected ? (
                <XCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
              )}
            </div>
          )}

          {/* Customer Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] font-mono text-xs font-semibold text-white">
            {caseItem.customerName
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-white">{caseItem.customerName}</h3>
              <span className="font-mono text-[10px] text-white/50 bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.08]">
                {caseItem.caseNumber}
              </span>
              {caseItem.priority && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    caseItem.priority === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : caseItem.priority === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {caseItem.priority}
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 mt-0.5">{caseItem.title}</p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-1 shrink-0">
          {caseItem.amount !== undefined && (
            <div className="text-base font-semibold text-white font-mono">
              ${caseItem.amount.toFixed(2)}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {caseItem.slaStatus && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  caseItem.slaStatus === 'breached'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : caseItem.slaStatus === 'at_risk'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <Clock className="w-2.5 h-2.5" />
                {caseItem.slaDeadline || 'SLA Active'}
              </span>
            )}
            <StatusBadge status={caseItem.status} size="xs" />
          </div>
        </div>
      </div>


      {/* Summary Box */}
      <p className="text-xs text-white/70 leading-relaxed bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06]">
        {caseItem.summary}
      </p>

      {/* AI Confidence & Recommendations */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-white/40 text-[11px]">AI Confidence:</span>
          <span className="text-[11px] font-mono text-[#22D3A7] px-2 py-0.5 rounded bg-[#22D3A7]/10 border border-[#22D3A7]/20">
            {caseItem.confidenceScore}%
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-white/40 text-[11px]">Recommendation:</span>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded ${
              caseItem.recommendedAction === 'APPROVE'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {caseItem.recommendedAction}
          </span>
        </div>
      </div>

      {/* Expanded Reasoning & Agent Logs */}
      {expanded && (
        <div className="space-y-4 pt-3 border-t border-white/[0.06] text-xs">
          {/* Policy Reasoning List */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white/50 uppercase tracking-wider text-[10px] font-mono">
              Policy Reasoning &amp; Evidence
            </h4>
            <ul className="space-y-1.5 pl-1">
              {caseItem.reasoning.map((r, i) => (
                <li key={i} className="flex items-start space-x-2 text-white/70 text-[11px] leading-relaxed">
                  <span className="text-[#FFB000] shrink-0 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pipeline Execution Audit */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white/50 uppercase tracking-wider text-[10px] font-mono">
              Multi-Agent Audit Trail
            </h4>
            <div className="space-y-2 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
              {caseItem.pipelineSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#22D3A7] font-bold">✓</span>
                    <span className="font-semibold text-white/90">{step.agentName}:</span>
                    <span className="text-white/50">{step.stepName}</span>
                  </div>
                  <StatusBadge status={step.status} size="xs" />
                </div>
              ))}
            </div>
          </div>

          {/* Add optional note input before deciding */}
          {caseItem.status === 'pending' && (
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add optional decision note or exception reason..."
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
            />
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-white/60 hover:text-white font-medium flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>{expanded ? 'Hide Audit Log' : 'View Reasoning & Audit Log'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {onInspect && (
            <button
              onClick={() => onInspect(caseItem)}
              className="text-[11px] font-mono text-white/70 hover:text-white px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors flex items-center space-x-1 cursor-pointer"
              title="Open deep case inspector & evidence graph"
            >
              <Share2 className="w-3 h-3 text-[#5EA0FF]" />
              <span>Inspect Case</span>
            </button>
          )}

          {onOpenReplay && (
            <button
              onClick={() => onOpenReplay(caseItem)}
              className="text-[11px] font-mono text-white/50 hover:text-[#FFB000] px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center space-x-1 cursor-pointer"
              title="Open step-by-step playback replay"
            >
              <Play className="w-3 h-3 fill-current text-[#FFB000]" />
              <span>Replay</span>
            </button>
          )}

          {isApproved && onOpenCertificate && (
            <button
              onClick={() => onOpenCertificate(caseItem)}
              className="text-[11px] font-mono text-emerald-400/80 hover:text-emerald-300 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center space-x-1 cursor-pointer"
              title="View cryptographic proof of governance"
            >
              <Award className="w-3 h-3" />
              <span>Certificate</span>
            </button>
          )}
        </div>

        {caseItem.status === 'pending' ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReject(caseItem.id, notes)}
              className="btn-secondary text-xs h-8 px-3 text-rose-400 hover:text-rose-300"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(caseItem.id, notes)}
              className="btn-primary text-xs h-8 px-3"
            >
              Approve
            </button>
          </div>
        ) : (
          <StatusBadge status={caseItem.status} size="xs" />
        )}
      </div>
    </div>
  );
};
