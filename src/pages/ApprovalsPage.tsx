import React, { useState, useMemo } from 'react';
import { ApprovalCase, WorkspaceType } from '../types';
import { ApprovalCard } from '../components/ApprovalCard';
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
}) => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'all'>('pending');
  const [workspaceFilter, setWorkspaceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [batchNote, setBatchNote] = useState('');
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Helper to count pending cases by workspace
  const getWorkspacePendingCount = (ws: string) => {
    return cases.filter((c) => c.status === 'pending' && (ws === 'all' || c.workspace === ws)).length;
  };

  const totalPendingAll = getWorkspacePendingCount('all');
  const pendingCount = getWorkspacePendingCount(workspaceFilter);

  const handleWorkspaceSelect = (ws: string) => {
    setWorkspaceFilter(ws);
    if (ws !== 'all' && setActiveWorkspace) {
      setActiveWorkspace(ws as WorkspaceType);
    }
  };

  // Filter cases based on workspace, status, search, and type
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (workspaceFilter !== 'all' && c.workspace !== workspaceFilter) return false;
      if (filterStatus === 'pending' && c.status !== 'pending') return false;
      if (filterStatus === 'resolved' && c.status === 'pending') return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
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
  }, [cases, workspaceFilter, filterStatus, typeFilter, searchQuery]);

  // All pending cases currently visible in filtered view
  const pendingCasesInView = useMemo(() => {
    return filteredCases.filter((c) => c.status === 'pending');
  }, [filteredCases]);

  // Checkbox selection state calculations
  const selectedPendingInView = useMemo(() => {
    return pendingCasesInView.filter((c) => selectedCaseIds.includes(c.id));
  }, [pendingCasesInView, selectedCaseIds]);

  const isAllPendingSelected =
    pendingCasesInView.length > 0 && selectedPendingInView.length === pendingCasesInView.length;
  const isSomePendingSelected =
    selectedPendingInView.length > 0 && selectedPendingInView.length < pendingCasesInView.length;

  // Total monetary value of selected cases
  const totalSelectedAmount = useMemo(() => {
    return cases
      .filter((c) => selectedCaseIds.includes(c.id) && c.status === 'pending')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [cases, selectedCaseIds]);

  // Toggle individual case selection
  const handleToggleSelectCase = (id: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all visible pending cases
  const handleToggleSelectAll = () => {
    if (isAllPendingSelected) {
      const inViewIds = new Set(pendingCasesInView.map((c) => c.id));
      setSelectedCaseIds((prev) => prev.filter((id) => !inViewIds.has(id)));
    } else {
      const inViewIds = pendingCasesInView.map((c) => c.id);
      setSelectedCaseIds((prev) => Array.from(new Set([...prev, ...inViewIds])));
    }
  };

  // Select all AI Recommended Approve
  const handleSelectRecommendedApprove = () => {
    const recommendedIds = pendingCasesInView
      .filter((c) => c.recommendedAction === 'APPROVE')
      .map((c) => c.id);
    setSelectedCaseIds((prev) => Array.from(new Set([...prev, ...recommendedIds])));
  };

  // Select high value cases (> $200)
  const handleSelectHighValue = () => {
    const highValueIds = pendingCasesInView
      .filter((c) => (c.amount || 0) >= 200)
      .map((c) => c.id);
    setSelectedCaseIds((prev) => Array.from(new Set([...prev, ...highValueIds])));
  };

  // Invert selection in current view
  const handleInvertSelection = () => {
    const inViewIds = pendingCasesInView.map((c) => c.id);
    setSelectedCaseIds((prev) => {
      const currentSelected = new Set(prev);
      const newSelected = prev.filter((id) => !inViewIds.includes(id));
      inViewIds.forEach((id) => {
        if (!currentSelected.has(id)) {
          newSelected.push(id);
        }
      });
      return newSelected;
    });
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedCaseIds([]);
    setBatchNote('');
  };

  // Execute Batch Approve
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

  // Execute Batch Reject
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

  return (
    <div
      id="approvals-page"
      className="flex-1 overflow-y-auto px-6 py-6 text-white space-y-6 select-none font-sans relative pb-32 max-w-[1600px] mx-auto w-full"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-white/[0.04] border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="meta-label text-[#FFB000]">HUMAN GOVERNANCE</span>
            <span className="text-white/20">•</span>
            <span className="meta-label">Batch Policy Gates</span>
          </div>
          <h1 className="page-title leading-tight">Approval Queue &amp; Policy Gates</h1>
          <p className="text-xs text-white/50 mt-1 max-w-2xl">
            Review and batch-authorize cases where Release Guardian policies, financial caps, or confidence thresholds require human sign-off.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Demo Injection Actions */}
          {onInjectDemoCase && (
            <button
              id="btn-inject-demo-case"
              onClick={() => onInjectDemoCase(workspaceFilter === 'all' ? undefined : (workspaceFilter as WorkspaceType))}
              className="btn-primary text-xs h-9 px-3.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Inject Test Case</span>
            </button>
          )}

          {onResetDemoData && (
            <button
              id="btn-reset-demo-data"
              onClick={onResetDemoData}
              title="Reset Demo State"
              className="btn-secondary h-9 w-9 p-0 flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Stat Pill */}
          <div className="flex items-center space-x-3 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/[0.08] font-mono text-xs shrink-0">
            <div>
              <span className="text-[10px] text-white/40 uppercase block font-sans">Pending Gate</span>
              <span className="text-xs font-bold text-[#FFB000]">{pendingCount} Cases</span>
            </div>
            <div className="h-6 w-px bg-white/[0.08]" />
            <div>
              <span className="text-[10px] text-white/40 uppercase block font-sans">Workspace</span>
              <span className="text-xs font-semibold text-[#22D3A7] uppercase">{workspaceFilter}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Switcher Bar with Live Counts */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08]">
          <button
            id="ws-tab-all"
            type="button"
            onClick={() => handleWorkspaceSelect('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              workspaceFilter === 'all'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span>All</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                workspaceFilter === 'all' ? 'bg-black/20 text-[#08090D]' : 'bg-white/[0.08] text-white/70'
              }`}
            >
              {getWorkspacePendingCount('all')}
            </span>
          </button>

          <button
            id="ws-tab-support"
            type="button"
            onClick={() => handleWorkspaceSelect('support')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              workspaceFilter === 'support'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span>Support</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                workspaceFilter === 'support' ? 'bg-black/20 text-[#08090D]' : 'bg-white/[0.08] text-white/70'
              }`}
            >
              {getWorkspacePendingCount('support')}
            </span>
          </button>

          <button
            id="ws-tab-finance"
            type="button"
            onClick={() => handleWorkspaceSelect('finance')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              workspaceFilter === 'finance'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span>Finance</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                workspaceFilter === 'finance' ? 'bg-black/20 text-[#08090D]' : 'bg-white/[0.08] text-white/70'
              }`}
            >
              {getWorkspacePendingCount('finance')}
            </span>
          </button>

          <button
            id="ws-tab-hr"
            type="button"
            onClick={() => handleWorkspaceSelect('hr')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              workspaceFilter === 'hr'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span>HR</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                workspaceFilter === 'hr' ? 'bg-black/20 text-[#08090D]' : 'bg-white/[0.08] text-white/70'
              }`}
            >
              {getWorkspacePendingCount('hr')}
            </span>
          </button>

          <button
            id="ws-tab-operations"
            type="button"
            onClick={() => handleWorkspaceSelect('operations')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              workspaceFilter === 'operations'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span>General Ops</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                workspaceFilter === 'operations' ? 'bg-black/20 text-[#08090D]' : 'bg-white/[0.08] text-white/70'
              }`}
            >
              {getWorkspacePendingCount('operations')}
            </span>
          </button>
        </div>

        {/* Filter Status & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center space-x-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08]">
            <button
              id="filter-status-pending"
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                filterStatus === 'pending'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              id="filter-status-resolved"
              type="button"
              onClick={() => setFilterStatus('resolved')}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                filterStatus === 'resolved'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Resolved
            </button>
            <button
              id="filter-status-all"
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                filterStatus === 'all'
                  ? 'bg-white/[0.12] text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              All Statuses
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            <input
              id="approvals-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case # or customer..."
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Batch Operations Toolbar & Quick Selection Presets */}
      {pendingCasesInView.length > 0 && (
        <div
          id="batch-selection-toolbar"
          className="p-4 rounded-[18px] bg-white/[0.04] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Master Checkbox & Count info */}
          <div className="flex items-center space-x-3">
            <button
              id="select-all-checkbox-btn"
              type="button"
              onClick={handleToggleSelectAll}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isAllPendingSelected
                  ? 'bg-[#FFB000] text-[#08090D] border border-amber-300'
                  : isSomePendingSelected
                  ? 'bg-amber-400/30 text-amber-300 border border-amber-400'
                  : 'bg-white/[0.04] border border-white/[0.2] hover:border-[#FFB000] text-transparent'
              }`}
              title={
                isAllPendingSelected
                  ? 'Deselect all pending cases'
                  : 'Select all pending cases in current view'
              }
            >
              {isAllPendingSelected ? (
                <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : isSomePendingSelected ? (
                <MinusSquare className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Square className="w-3.5 h-3.5 text-transparent" />
              )}
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-white">
                  {selectedCaseIds.length > 0
                    ? `${selectedCaseIds.length} of ${pendingCasesInView.length} Pending Selected`
                    : `Select Pending Cases (${pendingCasesInView.length} in view)`}
                </span>
                {totalSelectedAmount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ${totalSelectedAmount.toFixed(2)} Total Value
                  </span>
                )}
              </div>
              <span className="text-[11px] text-white/40">
                Click checkboxes to select multiple cases for single-click batch approval or rejection.
              </span>
            </div>
          </div>

          {/* Quick Selection Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="btn-select-all-pending"
              onClick={handleToggleSelectAll}
              className="btn-secondary text-xs h-7 px-2.5"
            >
              {isAllPendingSelected ? 'Deselect All' : 'Select All'}
            </button>

            <button
              id="btn-select-recommended-approve"
              onClick={handleSelectRecommendedApprove}
              className="btn-secondary text-xs h-7 px-2.5 text-[#22D3A7]"
            >
              <Sparkles className="w-3 h-3 text-[#22D3A7]" />
              <span>AI Approve</span>
            </button>

            <button
              id="btn-select-high-value"
              onClick={handleSelectHighValue}
              className="btn-secondary text-xs h-7 px-2.5 text-[#FFB000]"
            >
              <DollarSign className="w-3 h-3 text-[#FFB000]" />
              <span>High Value (≥$200)</span>
            </button>

            <button
              id="btn-invert-selection"
              onClick={handleInvertSelection}
              className="btn-secondary text-xs h-7 px-2.5"
            >
              Invert
            </button>

            {selectedCaseIds.length > 0 && (
              <button
                id="btn-clear-selection"
                onClick={handleClearSelection}
                className="btn-secondary text-xs h-7 px-2.5 text-rose-400 hover:text-rose-300"
              >
                <X className="w-3 h-3" />
                <span>Clear ({selectedCaseIds.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cases List */}
      <div className="space-y-4 max-w-5xl">
        {filteredCases.length > 0 ? (
          filteredCases.map((c) => (
            <ApprovalCard
              key={c.id}
              caseItem={c}
              isSelected={selectedCaseIds.includes(c.id)}
              onToggleSelect={handleToggleSelectCase}
              isSelectable={c.status === 'pending'}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))
        ) : (
          <div className="p-10 rounded-[20px] bg-white/[0.04] border border-white/[0.08] text-center text-white/50 text-xs space-y-4">
            <ShieldCheck className="w-10 h-10 text-[#FFB000] mx-auto opacity-80" />
            <div>
              <p className="font-semibold text-white text-sm">
                No approval cases found for {workspaceFilter.toUpperCase()}
              </p>
              <p className="text-white/50 mt-1 max-w-md mx-auto">
                {filterStatus === 'pending'
                  ? 'All pending human authorization gates for this workspace are currently clear.'
                  : 'No cases match your current filter and search criteria.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onInjectDemoCase && (
                <button
                  id="btn-empty-inject-case"
                  onClick={() =>
                    onInjectDemoCase(
                      workspaceFilter === 'all' ? undefined : (workspaceFilter as WorkspaceType)
                    )
                  }
                  className="btn-primary text-xs h-8 px-3.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Inject Demo Case into {workspaceFilter === 'all' ? 'SUPPORT' : workspaceFilter.toUpperCase()}</span>
                </button>
              )}

              {totalPendingAll > 0 && workspaceFilter !== 'all' && (
                <button
                  id="btn-empty-view-all-pending"
                  onClick={() => setWorkspaceFilter('all')}
                  className="btn-secondary text-xs h-8 px-3.5"
                >
                  <span>View {totalPendingAll} Pending Cases Across All Workspaces</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#FFB000]" />
                </button>
              )}

              {onResetDemoData && (
                <button
                  id="btn-empty-reset-data"
                  onClick={onResetDemoData}
                  className="btn-secondary text-xs h-8 px-3.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Demo State</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Batch Action Toolbar */}
      {selectedCaseIds.length > 0 && (
        <div
          id="floating-batch-action-bar"
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="p-4 rounded-[20px] bg-[#101217]/95 backdrop-blur-2xl border border-[#FFB000]/60 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Left Info: Selected Count & Amount */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFB000] text-[#08090D] flex items-center justify-center font-mono font-bold text-xs">
                {selectedCaseIds.length}
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  {selectedCaseIds.length} Case{selectedCaseIds.length > 1 ? 's' : ''} Selected
                </span>
                <span className="font-mono text-xs text-[#FFB000]">
                  ${totalSelectedAmount.toFixed(2)} Total Value
                </span>
              </div>
            </div>

            {/* Optional Memo / Audit Reason Input */}
            <div className="flex-1 max-w-xs">
              <input
                id="batch-decision-notes-input"
                type="text"
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                placeholder="Add batch audit note..."
                className="w-full bg-white/[0.06] border border-white/[0.1] focus:border-[#FFB000]/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
              />
            </div>

            {/* Action Buttons: Batch Approve & Batch Reject */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                id="btn-batch-reject"
                disabled={isBatchProcessing}
                onClick={handleBatchReject}
                className="btn-secondary text-xs h-8 px-3 text-rose-400 hover:text-rose-300"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Reject ({selectedCaseIds.length})</span>
              </button>

              <button
                id="btn-batch-approve"
                disabled={isBatchProcessing}
                onClick={handleBatchApprove}
                className="btn-primary text-xs h-8 px-3"
              >
                <CheckCircle2 className="w-3.5 h-3.5 fill-current text-[#08090D]" />
                <span>Batch Approve</span>
              </button>

              <button
                id="btn-batch-cancel"
                onClick={handleClearSelection}
                className="btn-secondary h-8 w-8 p-0 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
