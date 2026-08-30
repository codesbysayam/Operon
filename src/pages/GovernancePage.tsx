import React, { useState } from 'react';
import {
  ShieldCheck,
  History,
  GitBranch,
  RotateCcw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sliders,
  Sparkles,
  FileCode,
  Check,
  X,
  Layers,
  Scale,
  Eye,
} from 'lucide-react';
import { PolicyConfig, PolicyVersion, PolicyConflictInfo } from '../types';

interface GovernancePageProps {
  policyConfig: PolicyConfig;
  updatePolicyConfig: (newConfig: Partial<PolicyConfig>) => void;
  policyVersions: PolicyVersion[];
  policyConflicts: PolicyConflictInfo[];
  onRollback?: (version: string) => void;
  onPublishVersion?: (version: string, config: Partial<PolicyConfig>, name?: string) => void;
  onRollbackPolicy?: (version: string) => void;
  onPublishPolicy?: (version: string, config: Partial<PolicyConfig>, name?: string) => void;
}

export const GovernancePage: React.FC<GovernancePageProps> = ({
  policyConfig,
  updatePolicyConfig,
  policyVersions,
  policyConflicts,
  onRollback,
  onPublishVersion,
  onRollbackPolicy,
  onPublishPolicy,
}) => {
  const handleRollback = (version: string) => {
    if (onRollback) {
      onRollback(version);
    } else if (onRollbackPolicy) {
      onRollbackPolicy(version);
    }
  };

  const handlePublish = (version: string, config: Partial<PolicyConfig>, name?: string) => {
    if (onPublishVersion) {
      onPublishVersion(version, config, name);
    } else if (onPublishPolicy) {
      onPublishPolicy(version, config, name);
    }
  };

  const [activeTab, setActiveTab] = useState<'versions' | 'conflicts' | 'rules'>('versions');
  const [selectedVersion, setSelectedVersion] = useState<string>(
    policyVersions.find((p) => p.status === 'ACTIVE')?.version || 'v3.2'
  );
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Publish Form state
  const [pubVersion, setPubVersion] = useState('v3.3');
  const [pubName, setPubName] = useState('Dynamic Holiday Season Thresholds');
  const [pubRefundLimit, setPubRefundLimit] = useState(policyConfig.autoRefundLimit);
  const [pubFraudReview, setPubFraudReview] = useState(policyConfig.fraudReviewThreshold);
  const [pubInvoiceLimit, setPubInvoiceLimit] = useState(policyConfig.requireApprovalForHighValueInvoices);

  const activeVersionObj = policyVersions.find((p) => p.version === selectedVersion) || policyVersions[0];
  const currentActive = policyVersions.find((p) => p.status === 'ACTIVE') || policyVersions[0];

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePublish(
      pubVersion,
      {
        autoRefundLimit: Number(pubRefundLimit),
        fraudReviewThreshold: Number(pubFraudReview),
        requireApprovalForHighValueInvoices: Number(pubInvoiceLimit),
      },
      pubName
    );
    setIsPublishModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center text-[#FFB000]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                Governance & Policy Engine Hub
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#22D3A7]/10 text-[#22D3A7] border border-[#22D3A7]/20">
                  {currentActive?.version} ACTIVE
                </span>
              </h1>
              <p className="text-xs text-white/50">
                Immutable policy boundary versioning, automated conflict resolution, and audited human release gates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-3.5 py-2 bg-[#FFB000] hover:bg-[#E59E00] text-black font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FFB000]/10"
          >
            <Plus className="w-4 h-4" />
            Publish New Policy Version
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab('versions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'versions'
              ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Version History & Diff Matrix ({policyVersions.length})
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'conflicts'
              ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Conflict Resolution Matrix ({policyConflicts.length})
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Active Thresholds & Controls
        </button>
      </div>

      {/* TAB 1: Policy Versioning & Diffs */}
      {activeTab === 'versions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Version Stack */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Policy Releases
            </h3>

            {policyVersions.map((ver) => {
              const isSelected = ver.version === selectedVersion;
              const isActive = ver.status === 'ACTIVE';

              return (
                <div
                  key={ver.version}
                  onClick={() => setSelectedVersion(ver.version)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#141720] border-[#FFB000]/40 shadow-lg shadow-[#FFB000]/5'
                      : 'bg-[#0E1015] border-white/[0.08] hover:border-white/[0.16] hover:bg-[#12141A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">
                        {ver.version}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-[#22D3A7]/10 text-[#22D3A7] border-[#22D3A7]/30'
                            : 'bg-white/5 text-white/40 border-white/10'
                        }`}
                      >
                        {ver.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/40">{ver.publishedAt}</span>
                  </div>

                  <h4 className="text-xs font-medium text-white/90 mt-2">{ver.name}</h4>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-white/50 border-t border-white/[0.05] pt-2">
                    <span>Refund Cap: ${ver.config.autoRefundLimit}.00</span>
                    <span>Fraud Cap: {ver.config.fraudReviewThreshold}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Version Inspector & Diff Matrix */}
          <div className="lg:col-span-7">
            {activeVersionObj && (
              <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-white">
                        {activeVersionObj.version}
                      </span>
                      <span className="text-xs text-white/50">
                        {activeVersionObj.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      Published on {activeVersionObj.publishedAt}
                    </p>
                  </div>

                  {activeVersionObj.status !== 'ACTIVE' ? (
                    <button
                      onClick={() => handleRollback(activeVersionObj.version)}
                      className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Rollback to {activeVersionObj.version}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-[#22D3A7]/10 border border-[#22D3A7]/30 text-[#22D3A7] rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Currently Active
                    </span>
                  )}
                </div>

                {/* Diff Comparison Table */}
                <div>
                  <h4 className="text-xs font-semibold text-white/80 mb-3 flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-[#5EA0FF]" />
                    Changelog & Policy Modifications
                  </h4>

                  <div className="space-y-2">
                    {activeVersionObj.changes.map((change, idx) => (
                      <div
                        key={idx}
                        className="bg-[#12141A] border border-white/[0.06] rounded-lg p-3 flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-white/70">{change.field}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 line-through font-mono">
                            {change.oldValue}
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/40" />
                          <span className="text-[#22D3A7] font-bold font-mono">
                            {change.newValue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Config Dump */}
                <div>
                  <h4 className="text-xs font-semibold text-white/80 mb-2">
                    Policy Configuration Snapshot
                  </h4>
                  <div className="bg-black/40 border border-white/[0.06] rounded-lg p-3 font-mono text-[11px] text-white/70 space-y-1.5">
                    <div>
                      <span className="text-[#5EA0FF]">autoRefundLimit</span>:{' '}
                      <span className="text-[#22D3A7]">${activeVersionObj.config.autoRefundLimit}.00 USD</span>
                    </div>
                    <div>
                      <span className="text-[#5EA0FF]">fraudReviewThreshold</span>:{' '}
                      <span className="text-[#FFB000]">{activeVersionObj.config.fraudReviewThreshold} / 100</span>
                    </div>
                    <div>
                      <span className="text-[#5EA0FF]">fraudEscalationThreshold</span>:{' '}
                      <span className="text-red-400">{activeVersionObj.config.fraudEscalationThreshold} / 100</span>
                    </div>
                    <div>
                      <span className="text-[#5EA0FF]">requireApprovalForHighValueInvoices</span>:{' '}
                      <span className="text-[#22D3A7]">${activeVersionObj.config.requireApprovalForHighValueInvoices}.00 USD</span>
                    </div>
                    <div>
                      <span className="text-[#5EA0FF]">requireApprovalForPolicyExceptions</span>:{' '}
                      <span className="text-purple-400">true</span>
                    </div>
                    <div>
                      <span className="text-[#5EA0FF]">requireApprovalForAccessElevation</span>:{' '}
                      <span className="text-purple-400">true</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Conflict Resolution Matrix */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="w-5 h-5 text-[#FFB000]" />
              <h3 className="text-sm font-semibold text-white">
                Automated Policy Conflict Detection & Resolution Matrix
              </h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              When business rules produce overlapping or conflicting directives, the Release Guardian evaluates policy precedence. Any unresolved ambiguity is halted and escalated to the Operations Lead.
            </p>
          </div>

          <div className="space-y-3">
            {policyConflicts.map((conf) => (
              <div
                key={conf.id}
                className="bg-[#0E1015] border border-amber-500/20 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {conf.priority} PRIORITY CONFLICT
                    </span>
                    <span className="text-xs text-white/50">{conf.source}</span>
                  </div>
                  <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
                    {conf.resolution}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#12141A] border border-white/[0.06] rounded-lg p-3 text-xs">
                    <div className="text-white/40 text-[11px] font-mono mb-1">Rule A</div>
                    <div className="text-white/80">{conf.ruleA}</div>
                  </div>

                  <div className="bg-[#12141A] border border-white/[0.06] rounded-lg p-3 text-xs">
                    <div className="text-white/40 text-[11px] font-mono mb-1">Rule B</div>
                    <div className="text-white/80">{conf.ruleB}</div>
                  </div>
                </div>

                <div className="bg-black/30 border border-white/[0.06] rounded-lg p-3 text-xs">
                  <div className="text-white/50 mb-1">Trigger Condition & Valuation:</div>
                  <div className="text-white font-medium">{conf.condition} ({conf.currentValue})</div>
                  <div className="text-amber-400/90 mt-2 text-[11px]">
                    <span className="font-semibold text-amber-300">Conflict Explanation: </span>
                    {conf.conflict}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Active Threshold Controls */}
      {activeTab === 'rules' && (
        <div className="bg-[#0E1015] border border-white/[0.08] rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Live Policy Thresholds</h3>
            <p className="text-xs text-white/50 mt-1">
              Directly adjust the immutable threshold boundaries governing all 8 autonomous agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white flex items-center justify-between">
                <span>Customer Support Auto-Refund Limit</span>
                <span className="text-[#FFB000] font-mono font-bold">
                  ${policyConfig.autoRefundLimit}.00 USD
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="25"
                value={policyConfig.autoRefundLimit}
                onChange={(e) => updatePolicyConfig({ autoRefundLimit: Number(e.target.value) })}
                className="w-full accent-[#FFB000]"
              />
              <p className="text-[11px] text-white/40">
                Amounts exceeding this limit will automatically halt for Human Lead approval.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white flex items-center justify-between">
                <span>Fraud Review Risk Threshold</span>
                <span className="text-red-400 font-mono font-bold">
                  Score ≥ {policyConfig.fraudReviewThreshold}
                </span>
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={policyConfig.fraudReviewThreshold}
                onChange={(e) => updatePolicyConfig({ fraudReviewThreshold: Number(e.target.value) })}
                className="w-full accent-red-500"
              />
              <p className="text-[11px] text-white/40">
                Risk score at which Fraud Sentinel flags a transaction for mandatory manual review.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white flex items-center justify-between">
                <span>Finance High-Value Invoice Gate</span>
                <span className="text-[#5EA0FF] font-mono font-bold">
                  ${policyConfig.requireApprovalForHighValueInvoices}.00 USD
                </span>
              </label>
              <input
                type="range"
                min="250"
                max="5000"
                step="250"
                value={policyConfig.requireApprovalForHighValueInvoices}
                onChange={(e) =>
                  updatePolicyConfig({ requireApprovalForHighValueInvoices: Number(e.target.value) })
                }
                className="w-full accent-[#5EA0FF]"
              />
              <p className="text-[11px] text-white/40">
                Invoices exceeding this value require CFO/Finance Lead cryptographic sign-off.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white flex items-center justify-between">
                <span>HR Access Elevation Review</span>
                <span className="text-purple-400 font-mono font-bold">
                  {policyConfig.requireApprovalForAccessElevation ? 'ENFORCED' : 'DISABLED'}
                </span>
              </label>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() =>
                    updatePolicyConfig({
                      requireApprovalForAccessElevation: !policyConfig.requireApprovalForAccessElevation,
                    })
                  }
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    policyConfig.requireApprovalForAccessElevation
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                      : 'bg-white/5 text-white/40'
                  }`}
                >
                  {policyConfig.requireApprovalForAccessElevation
                    ? 'Elevated Roles Require Approval'
                    : 'Auto-Provision All Roles'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Version Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handlePublishSubmit}
            className="bg-[#0E1015] border border-[#FFB000]/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FFB000]" />
                <h2 className="text-base font-semibold text-white">
                  Publish New Policy Version
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-white/70 block mb-1">Version Identifier</label>
                <input
                  type="text"
                  value={pubVersion}
                  onChange={(e) => setPubVersion(e.target.value)}
                  className="w-full bg-[#12141A] border border-white/[0.08] rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1">Release Name / Description</label>
                <input
                  type="text"
                  value={pubName}
                  onChange={(e) => setPubName(e.target.value)}
                  className="w-full bg-[#12141A] border border-white/[0.08] rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-white/70 block mb-1">Auto-Refund Cap ($)</label>
                  <input
                    type="number"
                    value={pubRefundLimit}
                    onChange={(e) => setPubRefundLimit(Number(e.target.value))}
                    className="w-full bg-[#12141A] border border-white/[0.08] rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Fraud Threshold (0-100)</label>
                  <input
                    type="number"
                    value={pubFraudReview}
                    onChange={(e) => setPubFraudReview(Number(e.target.value))}
                    className="w-full bg-[#12141A] border border-white/[0.08] rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FFB000] hover:bg-[#E59E00] text-black font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-lg shadow-[#FFB000]/10"
              >
                Deploy Version
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
