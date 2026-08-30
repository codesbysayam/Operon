import React from 'react';
import {
  LayoutDashboard,
  GitMerge,
  ShieldCheck,
  Activity,
  BarChart3,
  Settings,
  Users,
  ChevronRight,
  Building2,
  AlertTriangle,
  Cpu,
  Sliders,
  Layers,
  Sparkles,
  Flame,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { WorkspaceType, AgentInfo } from '../types';

export type PageTab =
  | 'dashboard'
  | 'workflows'
  | 'agents'
  | 'skills'
  | 'approvals'
  | 'governance'
  | 'incidents'
  | 'activity'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activePage: PageTab;
  setActivePage: (page: PageTab) => void;
  pendingApprovalsCount: number;
  activeAgentsCount?: number;
  openIncidentsCount?: number;
  agents?: AgentInfo[];
  store?: { agents: AgentInfo[] };
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (ws: WorkspaceType) => void;
  onOpenCreateModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenSimulator?: () => void;
  onOpenArchitecture?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const {
    activePage,
    setActivePage,
    pendingApprovalsCount,
    activeAgentsCount: propActiveCount,
    openIncidentsCount = 1,
    agents,
    activeWorkspace,
    setActiveWorkspace,
    onOpenProfileModal,
    onOpenSimulator,
    onOpenArchitecture,
  } = props;

  const store = props.store || { agents: agents || [] };
  const activeAgentsCount =
    propActiveCount !== undefined
      ? propActiveCount
      : store.agents.filter((a) => a.status === 'active').length;

  const mainNavItems: {
    id: PageTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeVariant?: 'amber' | 'neutral' | 'success' | 'red';
  }[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'workflows',
      label: 'Workflows & Blueprints',
      icon: <GitMerge className="w-4 h-4" />,
      badge: 6,
      badgeVariant: 'neutral',
    },
    {
      id: 'agents',
      label: 'Agent Workforce',
      icon: <Users className="w-4 h-4" />,
      badge: `${activeAgentsCount} Online`,
      badgeVariant: activeAgentsCount > 0 ? 'success' : 'neutral',
    },
    {
      id: 'approvals',
      label: 'Approvals Queue',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: pendingApprovalsCount,
      badgeVariant: pendingApprovalsCount > 0 ? 'amber' : 'neutral',
    },
    {
      id: 'governance',
      label: 'Policy Governance',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: 'v2.4.0',
      badgeVariant: 'neutral',
    },
    {
      id: 'incidents',
      label: 'Incidents & Chaos',
      icon: <Flame className="w-4 h-4" />,
      badge: openIncidentsCount > 0 ? `${openIncidentsCount} Active` : undefined,
      badgeVariant: openIncidentsCount > 0 ? 'red' : 'neutral',
    },
    {
      id: 'activity',
      label: 'Activity Logs',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Analytics & SLA',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];


  return (
    <aside
      id="app-sidebar"
      className="w-[250px] min-w-[250px] max-w-[250px] bg-[#0B0C0F]/95 border-r border-white/[0.08] flex flex-col p-4 h-screen max-h-screen z-30 select-none shrink-0 font-sans backdrop-blur-2xl hidden md:flex"
    >
      {/* Scrollable Navigation Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 min-h-0">
        {/* Brand Banner */}
        <div className="flex items-center space-x-3 px-1 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFB000] text-[#08090D] font-bold text-sm shadow-[0_2px_10px_rgba(255,176,0,0.3)] shrink-0">
            Ω
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-white">
                OPERON
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white/70 border border-white/10">
                PRO
              </span>
            </div>
            <p className="text-[9px] text-white/40 font-mono uppercase tracking-wider leading-none mt-1">
              Autonomous Ops
            </p>
          </div>
        </div>

        {/* Workspace Organization Card */}
        <div className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] flex items-center justify-between group cursor-pointer transition-all duration-150">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] border border-white/10 text-white/80 shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-white truncate leading-tight">Acme Corp</h3>
              <p className="text-[10px] text-white/50 font-mono truncate">Enterprise Plan</p>
            </div>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-[#22D3A7] shrink-0" title="Active Organization" />
        </div>

        {/* Primary Navigation Items */}
        <div>
          <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-white/40 uppercase font-mono">
            Platform
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 text-left cursor-pointer gap-2 relative ${
                    isActive
                      ? 'bg-white/[0.085] text-white font-semibold border border-white/[0.10] shadow-sm'
                      : 'text-white/60 hover:bg-white/[0.04] hover:text-white/90 border border-transparent'
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#FFB000] rounded-r-full" />
                  )}

                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 pl-1">
                    <span className={`shrink-0 ${isActive ? 'text-[#FFB000]' : 'text-white/50'}`}>
                      {item.icon}
                    </span>
                    <span className="text-xs truncate">{item.label}</span>
                  </div>

                  {item.id === 'agents' ? (
                    <span
                      id="sidebar-active-agents-badge"
                      className={`flex items-center space-x-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium shrink-0 ${
                        activeAgentsCount === 0
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeAgentsCount === 0 ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                      <span>{`${activeAgentsCount} Online`}</span>
                    </span>
                  ) : (
                    item.badge !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium shrink-0 ${
                          item.badgeVariant === 'amber' && typeof item.badge === 'number' && item.badge > 0
                            ? 'bg-[#FFB000] text-[#08090D] font-bold shadow-[0_1px_6px_rgba(255,176,0,0.4)]'
                            : 'bg-white/[0.08] text-white/70 border border-white/10'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Governance & Sandboxing Tools */}
        {(onOpenSimulator || onOpenArchitecture) && (
          <div className="pt-3 border-t border-white/[0.08]">
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-white/40 uppercase font-mono">
              Governance Tools
            </p>
            <div className="space-y-1">
              {onOpenSimulator && (
                <button
                  id="sidebar-simulator-btn"
                  onClick={onOpenSimulator}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-[#FFB000] hover:bg-amber-500/10 border border-transparent hover:border-amber-500/25 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Sliders className="w-4 h-4 text-[#FFB000]" />
                    <span>Policy Simulator</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-[#FFB000] border border-amber-500/25">
                    Sandbox
                  </span>
                </button>
              )}

              {onOpenArchitecture && (
                <button
                  id="sidebar-architecture-btn"
                  onClick={onOpenArchitecture}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/25 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>DAG Architecture</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25">
                    8-Agent
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Operational Workspaces Quick Switcher */}
        <div className="pt-3 border-t border-white/[0.08]">
          <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-white/40 uppercase font-mono">
            Workspaces
          </p>
          <div className="space-y-1">
            <button
              onClick={() => setActiveWorkspace('support')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeWorkspace === 'support'
                  ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFB000]" />
                <span>Customer Support</span>
              </div>
            </button>

            <button
              onClick={() => setActiveWorkspace('finance')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeWorkspace === 'finance'
                  ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22D3A7]" />
                <span>Finance Ops</span>
              </div>
            </button>

            <button
              onClick={() => setActiveWorkspace('hr')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeWorkspace === 'hr'
                  ? 'bg-sky-500/15 text-sky-200 border border-sky-500/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5EA0FF]" />
                <span>HR &amp; IT Ops</span>
              </div>
            </button>

            <button
              onClick={() => setActiveWorkspace('operations')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeWorkspace === 'operations'
                  ? 'bg-purple-500/15 text-purple-200 border border-purple-500/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>General Ops</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Operon User Profile Card at Bottom */}
      <div className="pt-3 mt-auto border-t border-white/[0.08] shrink-0">
        <div
          id="sidebar-ops-lead-card"
          onClick={onOpenProfileModal}
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-between gap-2 transition-all duration-150 cursor-pointer group"
          title="OPERON: Sayam Mukherjee (Root Administrator & Policy Authority)"
        >
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFB000] text-[#08090D] font-bold text-xs">
                OP
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22D3A7] ring-2 ring-[#0B0C0F]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <h4 className="text-xs font-semibold text-white truncate leading-tight">
                  OPERON
                </h4>
                <span className="text-[9px] font-mono px-1 rounded bg-white/[0.08] text-white/60">
                  ROOT
                </span>
              </div>
              <p className="text-[10px] text-white/50 font-mono truncate leading-tight mt-0.5">
                Sayam Mukherjee
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
    </aside>
  );
};
