import React, { useState } from 'react';
import {
  ApprovalCase,
  EvidenceNode,
  AgentHandoffEvent,
  ContextMemorySnapshot,
} from '../types';
import {
  X,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Layers,
  Database,
  ArrowRight,
  GitCommit,
  UserCheck,
  CheckCircle2,
  XCircle,
  Play,
  Award,
  Sparkles,
  FileText,
  TrendingUp,
  Cpu,
  Activity,
  User,
  Share2,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface CaseInspectorModalProps {
  caseItem: ApprovalCase | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onAssign?: (id: string, reviewer: string) => void;
  onEscalate?: (id: string) => void;
  onAddNote?: (id: string, note: string) => void;
  onOpenReplay?: (caseItem: ApprovalCase) => void;
  onOpenCertificate?: (caseItem: ApprovalCase) => void;
}

export const CaseInspectorModal: React.FC<CaseInspectorModalProps> = ({
  caseItem,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onAssign,
  onEscalate,
  onAddNote,
  onOpenReplay,
  onOpenCertificate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'evidence' | 'handoffs' | 'memory' | 'consensus' | 'audit'
  >('evidence');
  const [newNote, setNewNote] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState(
    caseItem?.assignedReviewer || 'Sayam Mukherjee (Operations Lead)'
  );

  if (!isOpen || !caseItem) return null;

  const isPending = caseItem.status === 'pending';

  // Fallback evidence nodes if none provided
  const evidenceNodes: EvidenceNode[] = caseItem.evidenceNodes || [
    {
      id: 'ev-cust',
      label: `Customer: ${caseItem.customerName}`,
      type: 'customer',
      confidence: 99,
      details: `Email: ${caseItem.customerEmail} | Enterprise Tier | High LTV Account`,
      source: 'CRM Profile',
    },
    {
      id: 'ev-tx',
      label: `Transaction Payload (${caseItem.amount ? '$' + caseItem.amount.toFixed(2) : 'N/A'})`,
      type: 'transaction',
      confidence: 98,
      details: `Gateway: Stripe Live | Ref: ${caseItem.caseNumber} | Method: Visa •••• 4242`,
      source: 'Stripe Gateway',
    },
    {
      id: 'ev-anomaly',
      label: `Anomaly / Risk Assessment`,
      type: 'pattern',
      confidence: caseItem.confidenceScore,
      details: `Risk Score: ${caseItem.riskScore ?? 18}/100 | Recommendation: ${caseItem.recommendedAction}`,
      source: 'Fraud & Anomaly Sentinel',
    },
    {
      id: 'ev-policy',
      label: `Policy Gate: Release Guardian`,
      type: 'policy',
      confidence: 100,
      details: `Threshold boundary breached. Held at Human Governance Gate.`,
      source: 'Release Guardian Policy Engine',
    },
  ];

  // Fallback memory snapshot if none provided
  const memorySnapshot: ContextMemorySnapshot = caseItem.memorySnapshot || {
    customerName: caseItem.customerName,
    customerTenureMonths: 28,
    previousRefundsCount: 0,
    transactionAmount: caseItem.amount || 189.5,
    previousChargeAmount: caseItem.amount || 189.5,
    detectedPattern: 'Duplicate rapid API invocation within 4m timeframe',
    retrievedContextCount: 6,
    contextConfidence: 99.2,
    retrievedRecords: [
      { key: 'Subscription Plan', value: 'Enterprise Plan ($4,200/yr)', source: 'Billing Engine' },
      { key: 'SSO Okta Status', value: 'Verified Active Org Member', source: 'Okta Directory' },
      { key: 'Dispute History', value: '0 chargebacks recorded across 28 months', source: 'Stripe Vault' },
    ],
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    if (onAddNote) {
      onAddNote(caseItem.id, newNote);
    }
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0E1015] border border-white/[0.12] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-[#12141A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center text-[#FFB000]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">
                  {caseItem.caseNumber}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white/5 text-white/70 border border-white/10 uppercase">
                  {caseItem.workspace}
                </span>
                {caseItem.priority && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      caseItem.priority === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                        : caseItem.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {caseItem.priority} PRIORITY
                  </span>
                )}
                {caseItem.slaStatus && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono rounded-full border flex items-center gap-1 ${
                      caseItem.slaStatus === 'breached'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : caseItem.slaStatus === 'at_risk'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {caseItem.slaDeadline || 'SLA Active'}
                  </span>
                )}
              </div>
              <h2 className="text-base font-semibold text-white mt-1">
                {caseItem.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0B0E] border-b border-white/[0.08] text-xs">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'evidence'
                ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Evidence Graph DAG
          </button>

          <button
            onClick={() => setActiveTab('handoffs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'handoffs'
                ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            Agent Handoff Chain ({caseItem.handoffs?.length || 3})
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Context Memory Snapshot
          </button>

          <button
            onClick={() => setActiveTab('consensus')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'consensus'
                ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Multi-Agent Consensus ({caseItem.agentConsensus?.length || 0})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Quick Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-3">
              <span className="text-[11px] text-white/40 block">Amount</span>
              <span className="text-lg font-bold font-mono text-white">
                {caseItem.amount ? `$${caseItem.amount.toFixed(2)}` : 'N/A'}
              </span>
            </div>

            <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-3">
              <span className="text-[11px] text-white/40 block">Risk Score</span>
              <span
                className={`text-lg font-bold font-mono ${
                  (caseItem.riskScore ?? 0) > 60
                    ? 'text-red-400'
                    : (caseItem.riskScore ?? 0) > 30
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {caseItem.riskScore ?? 18} / 100
              </span>
            </div>

            <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-3">
              <span className="text-[11px] text-white/40 block">AI Recommendation</span>
              <span
                className={`text-sm font-bold font-mono px-2 py-0.5 rounded inline-block mt-1 ${
                  caseItem.recommendedAction === 'APPROVE'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {caseItem.recommendedAction} ({caseItem.confidenceScore}%)
              </span>
            </div>

            <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-3">
              <span className="text-[11px] text-white/40 block">Assigned Lead</span>
              <span className="text-xs font-semibold text-white truncate block mt-1">
                {caseItem.assignedReviewer || 'Sayam Mukherjee'}
              </span>
            </div>
          </div>

          {/* TAB 1: Evidence Graph */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white/80 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#5EA0FF]" />
                  Cryptographically Proven Evidence Graph (Directed Acyclic Graph)
                </h3>
                <span className="text-[11px] text-white/40 font-mono">
                  {evidenceNodes.length} Verified Evidence Nodes
                </span>
              </div>

              {/* Visual Graph Layout */}
              <div className="bg-[#08090D] border border-white/[0.08] rounded-xl p-5 relative overflow-x-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                  {evidenceNodes.map((node, idx) => (
                    <React.Fragment key={node.id}>
                      <div className="w-full md:w-56 bg-[#12141A] border border-white/[0.1] rounded-xl p-3 relative z-10 shadow-lg group hover:border-[#FFB000]/50 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-white/60">
                            Node {idx + 1}: {node.type}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            {node.confidence}%
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white">{node.label}</h4>
                        <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                          {node.details || node.value || ''}
                        </p>
                      </div>

                      {idx < evidenceNodes.length - 1 && (
                        <div className="hidden md:flex items-center text-white/20">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Policy Reasoning bullets */}
              <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-white/80 block">
                  Policy Evaluation Directives:
                </span>
                <ul className="space-y-1.5 text-xs text-white/70">
                  {caseItem.reasoning.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#FFB000] font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Agent Handoff History */}
          {activeTab === 'handoffs' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white/80 flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-[#FFB000]" />
                Inter-Agent Context & Payload Handoff History
              </h3>

              <div className="space-y-3">
                {(caseItem.handoffs || [
                  {
                    id: 'h-1',
                    fromAgent: 'Intent Analyst',
                    fromRole: 'analyst',
                    toAgent: 'Context Memory',
                    toRole: 'memory',
                    reason: 'Transfer customer ID and transaction amount',
                    contextTransferred: ['Customer ID', 'transaction hash', 'amount: $189.50'],
                    confidence: 96,
                    timestamp: '00:00.120',
                    payloadSnippet: '{"intent": "REFUND_REQUEST", "amount": 189.50, "chargeCount": 2}',
                  },
                  {
                    id: 'h-2',
                    fromAgent: 'Context Memory',
                    fromRole: 'memory',
                    toAgent: 'Fraud Sentinel',
                    toRole: 'fraud_sentinel',
                    reason: 'Provide historical disputes and sentiment context',
                    contextTransferred: ['Tenure: 2.4y', 'LTV: $14,200', 'Disputes: 0'],
                    confidence: 98,
                    timestamp: '00:00.340',
                    payloadSnippet: '{"tenureYears": 2.4, "disputeCount": 0, "sentimentScore": 0.84}',
                  },
                  {
                    id: 'h-3',
                    fromAgent: 'Fraud Sentinel',
                    fromRole: 'fraud_sentinel',
                    toAgent: 'Release Guardian',
                    toRole: 'release_guardian',
                    reason: 'Signal policy limit breach to Release Guardian',
                    contextTransferred: ['Risk Score: 18', 'AutoLimit $100 breached'],
                    confidence: 94,
                    timestamp: '00:00.580',
                    payloadSnippet: '{"riskScore": 18, "exceedsAutoLimit": true, "gateRequired": true}',
                  },
                ]).map((h) => (
                  <div
                    key={h.id}
                    className="bg-[#12141A] border border-white/[0.08] rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{h.fromAgent}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#FFB000]" />
                        <span className="font-semibold text-white">{h.toAgent}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-mono text-[11px]">
                          {h.confidence}% confidence
                        </span>
                        <span className="font-mono text-white/40 text-[11px]">
                          +{h.timestamp}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-white/70">
                      {Array.isArray(h.contextTransferred)
                        ? h.contextTransferred.join(', ')
                        : `${h.contextTransferred} items transferred`}
                    </p>

                    {h.payloadSnippet && (
                      <pre className="bg-black/50 border border-white/[0.05] rounded-lg p-2 font-mono text-[10px] text-white/60 overflow-x-auto">
                        {h.payloadSnippet}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Memory Snapshot */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white/80 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                Episodic & Vector Memory State
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-3">
                  <span className="text-white/40 block mb-1">Customer Tenure</span>
                  <span className="font-semibold text-white">
                    {memorySnapshot.customerTenureMonths} months
                  </span>
                </div>

                <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-3">
                  <span className="text-white/40 block mb-1">Lifetime Disputes</span>
                  <span className="font-semibold text-white">
                    {memorySnapshot.previousRefundsCount} disputes
                  </span>
                </div>

                <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-3">
                  <span className="text-white/40 block mb-1">Detected Pattern</span>
                  <span className="font-semibold text-emerald-400 truncate block">
                    {memorySnapshot.detectedPattern}
                  </span>
                </div>

                <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-3">
                  <span className="text-white/40 block mb-1">Vector Chunks</span>
                  <span className="font-semibold text-[#5EA0FF]">
                    {memorySnapshot.retrievedContextCount} context docs
                  </span>
                </div>
              </div>

              {/* Historical records */}
              <div className="bg-[#12141A] border border-white/[0.06] rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-white/80 block">
                  Retrieved Historical Interactions & Ledger Proofs:
                </span>
                <div className="space-y-2">
                  {memorySnapshot.retrievedRecords.map((rec, i) => (
                    <div
                      key={i}
                      className="bg-black/30 border border-white/[0.04] rounded-lg p-2.5 text-xs text-white/70 font-mono flex items-center justify-between"
                    >
                      <span>
                        <strong className="text-white">{rec.key}:</strong> {rec.value}
                      </span>
                      <span className="text-[10px] text-white/40">{rec.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Multi-Agent Consensus */}
          {activeTab === 'consensus' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white/80 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#22D3A7]" />
                Multi-Agent Consensus Matrix & Individual Verdicts
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(caseItem.agentConsensus || []).map((ag, i) => (
                  <div
                    key={i}
                    className="bg-[#12141A] border border-white/[0.08] rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{ag.agent}</span>
                      <span className="font-mono text-xs font-bold text-[#22D3A7]">
                        {ag.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60">{ag.verdict}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Case Operations & Notes Bar */}
          <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/70">Reassign Reviewer:</span>
                <select
                  value={selectedReviewer}
                  onChange={(e) => {
                    setSelectedReviewer(e.target.value);
                    if (onAssign) onAssign(caseItem.id, e.target.value);
                  }}
                  className="bg-[#0E1015] border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="Sayam Mukherjee (Operations Lead)">Sayam Mukherjee (Operations Lead)</option>
                  <option value="Sarah Jenkins (Finance VP)">Sarah Jenkins (Finance VP)</option>
                  <option value="Elena Rostova (Compliance Director)">Elena Rostova (Compliance Director)</option>
                </select>
              </div>

              {onEscalate && (
                <button
                  onClick={() => onEscalate(caseItem.id)}
                  className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Escalate to CFO/VP
                </button>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNoteSubmit} className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add operator audit note to case..."
                className="flex-1 bg-[#0E1015] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FFB000]/50"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-white/[0.08] bg-[#12141A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenReplay && (
              <button
                onClick={() => onOpenReplay(caseItem)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#FFB000]" />
                Replay Theater
              </button>
            )}

            {caseItem.status === 'approved' && onOpenCertificate && (
              <button
                onClick={() => onOpenCertificate(caseItem)}
                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                Certificate
              </button>
            )}
          </div>

          {isPending ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onReject(caseItem.id);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Reject & Block Pipeline
              </button>
              <button
                onClick={() => {
                  onApprove(caseItem.id);
                  onClose();
                }}
                className="px-5 py-2 bg-[#FFB000] hover:bg-[#E59E00] text-black font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-[#FFB000]/10"
              >
                Approve & Execute Action
              </button>
            </div>
          ) : (
            <StatusBadge status={caseItem.status} size="md" />
          )}
        </div>
      </div>
    </div>
  );
};
