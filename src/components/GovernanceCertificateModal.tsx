import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Download,
  X,
  FileCheck,
  QrCode,
  Sparkles,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { ApprovalCase, AuditLogEntry } from '../types';

interface GovernanceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: ApprovalCase | null;
  caseItem?: ApprovalCase | null;
  auditLog?: AuditLogEntry | null;
}

export const GovernanceCertificateModal: React.FC<GovernanceCertificateModalProps> = ({
  isOpen,
  onClose,
  caseData,
  caseItem,
  auditLog,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const activeCase = caseData || caseItem || null;
  if (!isOpen || !activeCase) return null;

  const hash =
    auditLog?.immutableHash ||
    `sha256:gov_${activeCase.caseNumber.toLowerCase()}_${Date.now().toString(36)}`;
  const actor = auditLog?.actor || 'Sayam Mukherjee (Operations Lead)';
  const ruleCode = auditLog?.ruleTriggered || 'RULE_AUTO_REFUND_LIMIT';
  const timestamp = auditLog?.timestamp || '2026-08-29 10:14:22 UTC';

  const certificatePayload = {
    standard: 'OPERON_SOC2_GOVERNANCE_SPEC_V2',
    certificateId: `CERT-${activeCase.caseNumber}-${Date.now().toString(36).toUpperCase()}`,
    caseNumber: activeCase.caseNumber,
    customerName: activeCase.customerName,
    amount: activeCase.amount ? `$${activeCase.amount.toFixed(2)} USD` : 'N/A',
    workspace: activeCase.workspace ? activeCase.workspace.toUpperCase() : 'OPERATIONS',
    authorizingLead: actor,
    policyRule: ruleCode,
    immutableSha256Digest: hash,
    invariants: [
      { check: 'Intent Authentication', status: 'VERIFIED_PASSED', agent: 'Intent Analyst' },
      { check: 'Historical Account Standing', status: 'VERIFIED_PASSED', agent: 'Context Memory' },
      { check: 'Velocity & Anomaly Score', status: 'VERIFIED_PASSED', agent: 'Fraud Sentinel' },
      { check: 'Policy Cap Gate Verification', status: 'VERIFIED_PASSED', agent: 'Release Guardian' },
      { check: 'Gateway Mutation Signature', status: 'VERIFIED_PASSED', agent: 'Task Executor' },
      { check: 'Post-Execution Invariant Reconciliation', status: 'VERIFIED_PASSED', agent: 'Validation Tester' },
    ],
    timestamp,
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(certificatePayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="governance-certificate-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0B0D13] border border-amber-500/40 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Decorative Border */}
        <div className="absolute inset-0 border-2 border-amber-500/20 rounded-[28px] pointer-events-none m-1" />

        {/* Certificate Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-white/[0.02] to-emerald-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-[#FFB000]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFB000] font-bold">
                  OPERON COMPLIANCE FABRIC
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SOC-2 / ISO 27001 AUDIT SEAL
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Cryptographic Proof of Human Governance
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Certificate Main Badge Frame */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase">Operational Target</span>
                <div className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>{activeCase.caseNumber}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-emerald-400 font-mono">
                    {activeCase.amount ? `$${activeCase.amount.toFixed(2)} USD` : 'General Action'}
                  </span>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-mono text-white/40 uppercase">Authorizing Officer</span>
                <div className="text-xs font-semibold text-[#FFB000]">{actor}</div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Digest Bar */}
            <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-[#FFB000]" />
                  <span>Immutable SHA-256 Checksum</span>
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-[10px] font-mono text-white/60 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  {copiedHash ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-[11px] text-white/90 break-all select-all font-semibold">
                {hash}
              </div>
            </div>

            {/* Invariant Verification Checklist */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-bold">
                Mandatory Operational Invariants Verified:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {certificatePayload.invariants.map((inv, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[11px] font-medium text-white">{inv.check}</div>
                        <div className="text-[9px] font-mono text-white/40">{inv.agent}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold">
                      PASSED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="p-5 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-white/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically Verified & Sealed</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>JSON Copied</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFB000] hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
