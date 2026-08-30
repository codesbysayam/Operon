import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Plus,
  User,
  ShieldCheck,
  Check,
  Search,
  Cpu,
  Play,
  X,
  GitMerge,
  Activity,
  ArrowRight,
  Bell,
  AlertTriangle,
  ChevronDown,
  Layers,
  Key,
  ShieldAlert,
  FlaskConical,
} from 'lucide-react';
import { ExecutionMode, WorkspaceType, WorkflowDefinition, ApprovalCase, AuditLogEntry } from '../types';
import { PageTab } from './Sidebar';

interface HeaderProps {
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (ws: WorkspaceType) => void;
  executionMode: ExecutionMode;
  setExecutionMode: (mode: ExecutionMode) => void;
  pendingApprovalsCount: number;
  workflows?: WorkflowDefinition[];
  cases?: ApprovalCase[];
  auditLogs?: AuditLogEntry[];
  onSelectWorkflow?: (wf: WorkflowDefinition) => void;
  onNavigateToTab?: (tab: PageTab) => void;
  onOpenCreateWorkflow?: () => void;
  onRunDemoWorkflow?: () => void;
  onOpenSimulator?: () => void;
  onOpenArchitecture?: () => void;
  isProfileModalOpen?: boolean;
  setIsProfileModalOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeWorkspace,
  setActiveWorkspace,
  executionMode,
  setExecutionMode,
  pendingApprovalsCount,
  workflows = [],
  cases = [],
  auditLogs = [],
  onSelectWorkflow,
  onNavigateToTab,
  onOpenCreateWorkflow,
  onRunDemoWorkflow,
  onOpenSimulator,
  onOpenArchitecture,
  isProfileModalOpen,
  setIsProfileModalOpen,
}) => {
  const [internalProfileOpen, setInternalProfileOpen] = useState(false);
  const showProfile = isProfileModalOpen !== undefined ? isProfileModalOpen : internalProfileOpen;
  const setShowProfile = setIsProfileModalOpen || setInternalProfileOpen;

  const [showLiveConfirmModal, setShowLiveConfirmModal] = useState(false);
  const [liveTermsChecked, setLiveTermsChecked] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleModeToggle = (targetMode: ExecutionMode) => {
    if (targetMode === executionMode) return;
    if (targetMode === 'live') {
      setShowLiveConfirmModal(true);
      setLiveTermsChecked(false);
    } else if (targetMode === 'sandbox') {
      setExecutionMode('sandbox');
    } else {
      setExecutionMode('demo');
    }
  };

  const confirmEnterLiveMode = () => {
    setExecutionMode('live');
    setShowLiveConfirmModal(false);
  };

  // Close search dropdown on click outside or ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setSearchQuery('');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        input?.focus();
        setIsSearchFocused(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const hasQuery = q.length > 0;

  const matchingWorkflows = hasQuery
    ? workflows.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.workspace.toLowerCase().includes(q)
      )
    : [];

  const matchingCases = hasQuery
    ? cases.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q) ||
          c.workspace.toLowerCase().includes(q)
      )
    : [];

  const matchingLogs = hasQuery
    ? auditLogs.filter(
        (l) =>
          l.event.toLowerCase().includes(q) ||
          l.actor.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.status.toLowerCase().includes(q)
      )
    : [];

  const totalResults = matchingWorkflows.length + matchingCases.length + matchingLogs.length;

  return (
    <>
      <header
        id="app-header"
        className="h-16 border-b border-white/[0.08] bg-[#08090D] px-6 flex items-center justify-between sticky top-0 z-40 select-none gap-4 shrink-0 transition-colors"
      >
        {/* Left: Command Search Input */}
        <div ref={searchContainerRef} className="relative flex items-center space-x-3 flex-1 min-w-0 max-w-sm">
          <div className="relative flex-1 min-w-0">
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Search workflows, agents, approvals..."
                className="w-full pl-9 pr-10 py-1.5 bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-xl text-xs text-white placeholder:text-white/30 outline-none transition-colors h-9"
              />
              <div className="absolute right-2.5 flex items-center">
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="text-[10px] font-mono text-white/40 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] pointer-events-none">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Global Search Popup Dropdown */}
          {hasQuery && isSearchFocused && (
            <div className="absolute top-12 left-0 right-0 z-50 bg-[#101217] border border-white/[0.12] rounded-2xl p-3 shadow-2xl max-h-[75vh] overflow-y-auto space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <Search className="w-3.5 h-3.5 text-[#FFB000]" />
                  <span className="text-xs font-semibold text-white">
                    Results for &quot;{searchQuery}&quot;
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                    {totalResults}
                  </span>
                </div>
                <button
                  onClick={() => setIsSearchFocused(false)}
                  className="p-1 rounded text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {totalResults === 0 ? (
                <div className="py-6 text-center space-y-1">
                  <p className="text-xs text-white/60">No matches found.</p>
                  <p className="text-[11px] text-white/40 font-mono">Try searching &quot;support&quot;, &quot;refund&quot;, or &quot;CS-2487&quot;</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Matching Workflows */}
                  {matchingWorkflows.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Workflows ({matchingWorkflows.length})
                      </div>
                      {matchingWorkflows.map((wf) => (
                        <div
                          key={wf.id}
                          onClick={() => {
                            onSelectWorkflow?.(wf);
                            onNavigateToTab?.('workflows');
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-semibold text-white group-hover:text-[#FFB000] transition-colors">
                                {wf.name}
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/[0.08] text-white/70">
                                {wf.workspace}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 line-clamp-1">{wf.description}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Approvals */}
                  {matchingCases.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Approvals ({matchingCases.length})
                      </div>
                      {matchingCases.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            onNavigateToTab?.('approvals');
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-semibold text-white group-hover:text-[#FFB000] transition-colors">
                                {c.caseNumber}: {c.customerName}
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/[0.08] text-white/70">
                                {c.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50">
                              {c.title} {c.amount ? `• $${c.amount}` : ''}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Environment Selector (Demo | Sandbox | Live) */}
        <div className="hidden lg:flex items-center bg-white/[0.04] p-1 rounded-full border border-white/[0.08]">
          <button
            id="mode-demo-btn"
            onClick={() => handleModeToggle('demo')}
            className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold tracking-tight transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
              executionMode === 'demo'
                ? 'bg-[#FFB000] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="DEMO: Simulated • Deterministic • Zero side effects"
          >
            <Zap className="w-3 h-3 text-current shrink-0" />
            <span>Demo</span>
          </button>
          <button
            id="mode-sandbox-btn"
            onClick={() => handleModeToggle('sandbox')}
            className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold tracking-tight transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
              executionMode === 'sandbox'
                ? 'bg-[#5EA0FF] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="SANDBOX: Test APIs • Test Data"
          >
            <FlaskConical className="w-3 h-3 text-current shrink-0" />
            <span>Sandbox</span>
          </button>
          <button
            id="mode-live-btn"
            onClick={() => handleModeToggle('live')}
            className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold tracking-tight transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
              executionMode === 'live'
                ? 'bg-[#22D3A7] text-[#08090D] shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="LIVE: Production Environment"
          >
            <Sparkles className="w-3 h-3 text-current shrink-0" />
            <span>Live</span>
          </button>
        </div>

        {/* Right: Operational Status, Approvals Bell, User Profile */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {onOpenSimulator && (
            <button
              id="header-open-simulator-btn"
              onClick={onOpenSimulator}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/30 text-[11px] font-mono text-white/70 hover:text-[#FFB000] transition-colors cursor-pointer"
              title="Test policy boundaries and auto-refund caps in real-time sandbox"
            >
              <Zap className="w-3 h-3 text-[#FFB000]" />
              <span>Policy Simulator</span>
            </button>
          )}

          {onOpenArchitecture && (
            <button
              id="header-open-architecture-btn"
              onClick={onOpenArchitecture}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-purple-500/15 border border-white/[0.08] hover:border-purple-500/30 text-[11px] font-mono text-white/70 hover:text-purple-300 transition-colors cursor-pointer"
              title="View 8-agent topology and invariant data flow"
            >
              <Layers className="w-3 h-3 text-purple-400" />
              <span>Architecture</span>
            </button>
          )}

          {/* Operational Status Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A7]" />
            <span>Operational</span>
          </div>

          {/* Pending Approvals Bell */}
          <button
            onClick={() => onNavigateToTab?.('approvals')}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
              pendingApprovalsCount > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08]'
            }`}
            title={`${pendingApprovalsCount} pending approvals`}
          >
            <Bell className="w-4 h-4" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#FFB000] text-[#08090D]">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          {/* User Profile Trigger */}
          <div
            id="header-ops-lead-widget"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer group"
            title="OPERON: Sayam Mukherjee (Root Administrator)"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFB000] text-[#08090D] font-bold text-[10px]">
              OP
            </div>
            <span className="text-xs font-semibold text-white/90 hidden sm:inline">
              Sayam M.
            </span>
          </div>
        </div>
      </header>

      {/* LIVE Confirmation Modal */}
      {showLiveConfirmModal && (
        <div
          id="live-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowLiveConfirmModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0E1015] border border-white/[0.12] rounded-[24px] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Enter Live Environment</h3>
                  <p className="text-xs text-white/50 font-mono">Production Execution Authorization</p>
                </div>
              </div>
              <button
                onClick={() => setShowLiveConfirmModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-white/70">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 leading-relaxed">
                You are switching to LIVE production mode. Workflows executed in this mode interact directly with live action adapters (Stripe, Slack, Jira) according to policy guardrails.
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-white/40">Workspace:</span>
                  <span className="text-white uppercase">{activeWorkspace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Operator:</span>
                  <span className="text-white">Sayam Mukherjee (Root Admin)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Guardrails:</span>
                  <span className="text-[#22D3A7]">Release Guardian Active</span>
                </div>
              </div>

              <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] cursor-pointer">
                <input
                  type="checkbox"
                  checked={liveTermsChecked}
                  onChange={(e) => setLiveTermsChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#FFB000] cursor-pointer rounded"
                />
                <span className="text-xs text-white/80 leading-snug">
                  I acknowledge that live workflows trigger external mutations and produce immutable audit trail logs.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setShowLiveConfirmModal(false)}
                className="btn-secondary text-xs h-9 px-4"
              >
                Cancel
              </button>
              <button
                disabled={!liveTermsChecked}
                onClick={confirmEnterLiveMode}
                className={`btn-primary text-xs h-9 px-4 ${
                  !liveTermsChecked ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Confirm Live Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPERON Profile Sheet Drawer */}
      {showProfile && (
        <div
          id="operon-profile-sheet"
          className="fixed inset-0 z-50 flex justify-end bg-black/70"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-[#0E1015] border-l border-white/[0.12] p-6 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFB000] text-[#08090D] font-bold text-sm">
                    OP
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">OPERON Admin</h3>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-white/[0.08] text-white/70">
                        ROOT
                      </span>
                    </div>
                    <p className="text-xs text-white/50 font-mono mt-0.5">Sayam Mukherjee</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-white/40">Environment:</span>
                    <span className="text-white uppercase font-bold">{executionMode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-white/40">Workspace:</span>
                    <span className="text-white uppercase font-bold">{activeWorkspace}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-white/40">Separation of Duties:</span>
                    <span className="text-[#22D3A7]">Enforced</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-white/40">Pending Approvals:</span>
                    <span className="text-[#FFB000]">{pendingApprovalsCount} cases</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                    System Health
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <span className="text-white/50 text-[11px]">AI Gateway</span>
                      <span className="text-[10px] font-mono text-[#22D3A7]">ONLINE</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <span className="text-white/50 text-[11px]">Policy Engine</span>
                      <span className="text-[10px] font-mono text-[#22D3A7]">ACTIVE</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <span className="text-white/50 text-[11px]">Adapters</span>
                      <span className="text-[10px] font-mono text-[#22D3A7]">CONNECTED</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <span className="text-white/50 text-[11px]">Audit Logs</span>
                      <span className="text-[10px] font-mono text-[#22D3A7]">SYNCED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center space-x-2">
              <button
                className="btn-secondary text-xs h-9 flex-1"
                onClick={() => {
                  setShowProfile(false);
                  onNavigateToTab?.('settings');
                }}
              >
                System Settings
              </button>
              <button
                className="btn-primary text-xs h-9 px-4"
                onClick={() => setShowProfile(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
