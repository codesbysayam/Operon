import React, { useState, useMemo } from 'react';
import {
  ApprovalCase,
  WorkspaceType,
  SavedCaseView,
  HumanDecisionHistoryItem,
} from '../types';
import { ApprovalCard } from '../components/ApprovalCard';
import { CaseInspectorModal } from '../components/CaseInspectorModal';
import {
  ShieldCheck,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Square,
  MinusSquare,
  PlusCircle,
  RotateCcw,
  Sparkles,
  DollarSign,
  X,
  ChevronRight,
  Sliders,
  Clock,
  AlertTriangle,
  Flame,
  Filter,
  History,
  Tag,
  Share2,
  UserCheck,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface ApprovalsPageProps {
  cases: ApprovalCase[];
  activeWorkspace?: WorkspaceType;
  setActiveWorkspace?: (ws: WorkspaceType) => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onBatchApprove?: (ids: string[], notes?: string) => Promise<void> | void;
  onBatchReject?: (ids: string[], notes?: string) => Promise<void> | void;
  onInjectDemoCase?: (ws?: WorkspaceType) => void;
  onResetDemoData?: () => void;
  onOpenReplay?: (caseItem: ApprovalCase) => void;
  onOpenCertificate?: (caseItem: ApprovalCase) => void;
  onOpenSimulator?: () => void;
  savedViews?: SavedCaseView[];
  activeSavedViewId?: string;
  onSelectSavedView?: (id: string) => void;
  decisionHistory?: HumanDecisionHistoryItem[];
  onAssignCase?: (caseId: string, reviewer: string) => void;
  onEscalateCase?: (caseId: string) => void;
  onAddCaseNote?: (caseId: string, note: string) => void;
  onBulkTag?: (caseIds: string[], tag: string) => void;
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({
  cases,
  activeWorkspace = 'support',
  setActiveWorkspace,
  onApprove,
  onReject,
  onBatchApprove,
  onBatchReject,
  onInjectDemoCase,
  onResetDemoData,
  onOpenReplay,
  onOpenCertificate,
  onOpenSimulator,
  savedViews = [],
  activeSavedViewId = 'view-all',
  onSelectSavedView,
  decisionHistory = [],
  onAssignCase,
  onEscalateCase,
  onAddCaseNote,
  onBulkTag,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'queue' | 'history'>('queue');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'all'>('pending');
  const [workspaceFilter, setWorkspaceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [batchNote, setBatchNote] = useState('');
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Inspector modal state
  const [inspectingCase, setInspectingCase] = useState<ApprovalCase | null>(null);

  // Count pending cases by workspace
  const getWorkspacePendingCount = (ws: string) => {
    return cases.filter(
      (c) => c.status === 'pending' && (ws === 'all' || c.workspace === ws)
    ).length;
  };

  const totalPendingAll = getWorkspacePendingCount('all');
  const pendingCount = getWorkspacePendingCount(workspaceFilter);

  const handleWorkspaceSelect = (ws: string) => {
    setWorkspaceFilter(ws);
    if (ws !== 'all' && setActiveWorkspace) {
      setActiveWorkspace(ws as WorkspaceType);
    }
  };

  // Filter cases based on filters
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (workspaceFilter !== 'all' && c.workspace !== workspaceFilter) return false;
      if (filterStatus === 'pending' && c.status !== 'pending') return false;
      if (filterStatus === 'resolved' && c.status === 'pending') return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.customerName.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          (c.amount !== undefined && c.amount.toString().includes(q))
        );
      }
      return true;
    });
  }, [cases, workspaceFilter, filterStatus, typeFilter, priorityFilter, searchQuery]);

  const pendingCasesInView = useMemo(() => {
    return filteredCases.filter((c) => c.status === 'pending');
  }, [filteredCases]);

  const selectedPendingInView = useMemo(() => {
    return pendingCasesInView.filter((c) => selectedCaseIds.includes(c.id));
  }, [pendingCasesInView, selectedCaseIds]);

  const isAllPendingSelected =
    pendingCasesInView.length > 0 &&
    selectedPendingInView.length === pendingCasesInView.length;

  const totalSelectedAmount = useMemo(() => {
    return cases
      .filter((c) => selectedCaseIds.includes(c.id) && c.status === 'pending')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [cases, selectedCaseIds]);

  const handleToggleSelectCase = (id: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllPendingSelected) {
      const inViewIds = new Set(pendingCasesInView.map((c) => c.id));
      setSelectedCaseIds((prev) => prev.filter((id) => !inViewIds.has(id)));
    } else {
      const inViewIds = pendingCasesInView.map((c) => c.id);
      setSelectedCaseIds((prev) => Array.from(new Set([...prev, ...inViewIds])));
    }
  };

  const handleSelectRecommendedApprove = () => {
    const recommendedIds = pendingCasesInView
      .filter((c) => c.recommendedAction === 'APPROVE')
      .map((c) => c.id);
    setSelectedCaseIds((prev) => Array.from(new Set([...prev, ...recommendedIds])));
  };

  const handleSelectHighValue = () => {
    const highValueIds = pendingCasesInView
      .filter((c) => (c.amount || 0) >= 200)
      .map((c) => c.id);
    setSelectedCaseIds((prev) => Array.from(new Set([...prev, ...highValueIds])));
  };

  const handleClearSelection = () => {
    setSelectedCaseIds([]);
    setBatchNote('');
  };

  const handleBatchApprove = async () => {
    const validPendingIds = selectedCaseIds.filter((id) => {
      const c = cases.find((item) => item.id === id);
      return c && c.status === 'pending';
    });

    if (validPendingIds.length === 0) return;

    setIsBatchProcessing(true);
    try {
      if (onBatchApprove) {
        await onBatchApprove(validPendingIds, batchNote || undefined);
      } else {
        for (const id of validPendingIds) {
          onApprove(id, batchNote || undefined);
        }
      }
      setSelectedCaseIds([]);
      setBatchNote('');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchReject = async () => {
    const validPendingIds = selectedCaseIds.filter((id) => {
      const c = cases.find((item) => item.id === id);
      return c && c.status === 'pending';
    });

    if (validPendingIds.length === 0) return;

    setIsBatchProcessing(true);
    try {
      if (onBatchReject) {
        await onBatchReject(validPendingIds, batchNote || undefined);
      } else {
        for (const id of validPendingIds) {
          onReject(id, batchNote || undefined);
        }
      }
      setSelectedCaseIds([]);
      setBatchNote('');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBulkTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim() || selectedCaseIds.length === 0) return;
    if (onBulkTag) {
      onBulkTag(selectedCaseIds, tagInput.trim());
    }
    setTagInput('');
    setIsTagModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center text-[#FFB000]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                Human-in-the-Loop Approval Cockpit
                {totalPendingAll > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#FFB000]/15 text-[#FFB000] border border-[#FFB000]/30 animate-pulse">
                    {totalPendingAll} PENDING
                  </span>
                )}
              </h1>
              <p className="text-xs text-white/50">
                Cryptographic release guardian gates, SLA countdown timers, dynamic priority matrix, and evidence graph verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onInjectDemoCase && (
            <button
              onClick={() => onInjectDemoCase()}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#FFB000]" />
              Inject Case
            </button>
          )}

          {onResetDemoData && (
            <button
              onClick={onResetDemoData}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset State
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Navigation: Queue vs Decision History */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'queue'
                ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Active Approval Queue ({totalPendingAll})
          </button>

          <button
            onClick={() => setActiveMainTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'history'
                ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Immutable Human Decision History ({decisionHistory.length})
          </button>
        </div>

        {/* Saved Views Pill Selector */}
        {savedViews.length > 0 && onSelectSavedView && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="text-white/40 text-[11px]">Saved View:</span>
            {savedViews.map((sv) => (
              <button
                key={sv.id}
                onClick={() => onSelectSavedView(sv.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  activeSavedViewId === sv.id
                    ? 'bg-[#5EA0FF]/20 text-[#5EA0FF] border border-[#5EA0FF]/30'
                    : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {sv.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeMainTab === 'queue' ? (
        <>
          {/* Filter Bar: Workspace, Status, Priority, Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E1015] border border-white/[0.08] p-3 rounded-xl">
            <div className="flex flex-wrap items-center gap-2">
              {/* Workspace pills */}
              <div className="flex items-center bg-[#12141A] rounded-lg p-1 border border-white/[0.06] text-xs">
                {(['all', 'support', 'finance', 'hr', 'operations'] as const).map((ws) => (
                  <button
                    key={ws}
                    onClick={() => handleWorkspaceSelect(ws)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all cursor-pointer ${
                      workspaceFilter === ws
                        ? 'bg-[#FFB000] text-black font-semibold shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {ws}
                  </button>
                ))}
              </div>

              {/* Status pills */}
              <div className="flex items-center bg-[#12141A] rounded-lg p-1 border border-white/[0.06] text-xs">
                {(['pending', 'resolved', 'all'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#12141A] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[#FFB000]/50"
              >
                <option value="all">All Priorities</option>
                <option value="CRITICAL">Critical Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search case, customer, amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12141A] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FFB000]/50"
              />
            </div>
          </div>

          {/* Batch Action Toolbar */}
          {selectedCaseIds.length > 0 && (
            <div className="bg-[#141720] border border-[#FFB000]/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-[#FFB000]/5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-[#FFB000]/20 text-[#FFB000] border border-[#FFB000]/30 rounded text-xs font-bold font-mono">
                  {selectedCaseIds.length} Selected
                </span>
                {totalSelectedAmount > 0 && (
                  <span className="text-xs text-white/70 font-mono">
                    Total: <strong className="text-white">${totalSelectedAmount.toFixed(2)}</strong>
                  </span>
                )}
                <button
                  onClick={handleClearSelection}
                  className="text-xs text-white/50 hover:text-white underline cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTagModalOpen(true)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Bulk Tag
                </button>

                <button
                  onClick={handleBatchReject}
                  disabled={isBatchProcessing}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batch Reject ({selectedCaseIds.length})
                </button>

                <button
                  onClick={handleBatchApprove}
                  disabled={isBatchProcessing}
                  className="px-4 py-1.5 bg-[#FFB000] hover:bg-[#E59E00] text-black font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-[#FFB000]/10"
                >
                  Batch Approve ({selectedCaseIds.length})
                </button>
              </div>
            </div>
          )}

          {/* Cases Grid */}
          <div className="space-y-3">
            {filteredCases.length > 0 ? (
              filteredCases.map((caseItem) => (
                <ApprovalCard
                  key={caseItem.id}
                  caseItem={caseItem}
                  isSelected={selectedCaseIds.includes(caseItem.id)}
                  onToggleSelect={handleToggleSelectCase}
                  isSelectable={caseItem.status === 'pending'}
                  onApprove={onApprove}
                  onReject={onReject}
                  onOpenReplay={onOpenReplay}
                  onOpenCertificate={onOpenCertificate}
                  onInspect={(c) => setInspectingCase(c)}
                />
              ))
            ) : (
              <div className="bg-[#0E1015] border border-white/[0.08] rounded-2xl p-12 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#22D3A7] mx-auto" />
                <h3 className="text-sm font-semibold text-white">All Clear! No Pending Approvals</h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto">
                  No cases matched your current workspace or filter settings. Inject a demo case to verify the approval workflow.
                </p>
                {onInjectDemoCase && (
                  <button
                    onClick={() => onInjectDemoCase()}
                    className="px-4 py-2 bg-[#FFB000] hover:bg-[#E59E00] text-black font-semibold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 mt-2"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Inject Demo Case ($320.00)
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* TAB 2: Immutable Human Decision History */
        <div className="space-y-4">
          <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <History className="w-5 h-5 text-[#22D3A7]" />
              <h3 className="text-sm font-semibold text-white">
                Cryptographically Sealed Human Decision Ledger
              </h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Every human approval, rejection, and exception override generates an immutable SHA-256 provenance entry for Sarbanes-Oxley (SOX) and SOC2 Type II compliance.
            </p>
          </div>

          <div className="space-y-3">
            {decisionHistory.map((item) => (
              <div
                key={item.id}
                className="bg-[#0E1015] border border-white/[0.08] hover:border-white/[0.14] rounded-xl p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.05] pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold font-mono rounded-full border ${
                        item.decision === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {item.decision}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {item.caseNumber}
                    </span>
                    <span className="text-xs text-white/70 font-medium truncate">
                      {item.caseTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="font-mono text-white font-semibold">
                      ${item.amount.toFixed(2)} USD
                    </span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-white/40">Reviewer: </span>
                    <span className="text-white font-semibold">{item.reviewerName}</span>{' '}
                    <span className="text-white/40">({item.reviewerRole})</span>
                    <div className="text-white/70 mt-1">{item.reason}</div>
                  </div>

                  <div className="bg-[#12141A] border border-white/[0.06] rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-white/50 flex items-center gap-1.5 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-[#22D3A7]" />
                    <span>{item.immutableHash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Case Inspector Modal */}
      <CaseInspectorModal
        caseItem={inspectingCase}
        isOpen={Boolean(inspectingCase)}
        onClose={() => setInspectingCase(null)}
        onApprove={onApprove}
        onReject={onReject}
        onAssign={onAssignCase}
        onEscalate={onEscalateCase}
        onAddNote={onAddCaseNote}
        onOpenReplay={onOpenReplay}
        onOpenCertificate={onOpenCertificate}
      />

      {/* Bulk Tag Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleBulkTagSubmit}
            className="bg-[#0E1015] border border-white/[0.12] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-semibold text-white">Apply Tag to Selected Cases</h3>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">Tag Label</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. VIP Customer, SOX Audit, Escalation"
                className="w-full bg-[#12141A] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB000]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#FFB000] hover:bg-[#E59E00] text-black font-semibold rounded-lg text-xs cursor-pointer"
              >
                Apply Tag ({selectedCaseIds.length})
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
