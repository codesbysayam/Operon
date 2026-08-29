import React, { useState } from 'react';
import { WorkspaceType, WorkflowDefinition } from '../types';
import { X, Sparkles, Zap } from 'lucide-react';
import { WorkflowTipBanner, DeployButtonWithTip } from './WorkflowTipTooltip';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (wf: Partial<WorkflowDefinition>) => void;
  activeWorkspace: WorkspaceType;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  activeWorkspace,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workspace, setWorkspace] = useState<WorkspaceType>(activeWorkspace);
  const [triggerType, setTriggerType] = useState<'webhook' | 'email_inbound' | 'schedule' | 'manual'>('email_inbound');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      name,
      description,
      workspace,
      triggerType,
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div
      id="create-workflow-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="create-workflow-modal-content"
        className="w-full max-w-lg bg-[#0E1015] border border-white/[0.1] rounded-[24px] p-6 shadow-2xl space-y-5 relative select-none font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FFB000]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Create Operational Workflow</h3>
              <p className="text-xs text-white/50">Configure multi-agent pipeline parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block">
              Workflow Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Enterprise SLA Escalation & Refund Routing"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block">
              Operational Workspace
            </label>
            <select
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value as WorkspaceType)}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors cursor-pointer"
            >
              <option value="support" className="bg-[#0E1015]">Customer Support</option>
              <option value="finance" className="bg-[#0E1015]">Finance Ops</option>
              <option value="hr" className="bg-[#0E1015]">HR &amp; IT Onboarding</option>
              <option value="operations" className="bg-[#0E1015]">Operations &amp; Resilience</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block">
              Trigger Source
            </label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as any)}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors cursor-pointer"
            >
              <option value="email_inbound" className="bg-[#0E1015]">Inbound Customer Email</option>
              <option value="webhook" className="bg-[#0E1015]">Webhook Integration (Stripe / Zendesk / ERP)</option>
              <option value="schedule" className="bg-[#0E1015]">Scheduled Cron Batch</option>
              <option value="manual" className="bg-[#0E1015]">Manual Trigger</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block">
              Description &amp; Policy Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the business rules, threshold limits, and agent delegation plan..."
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FFB000]/60 rounded-xl p-3.5 text-xs text-white placeholder:text-white/30 resize-none outline-none transition-colors"
            />
          </div>

          {/* Contextual Workflow Tip based on selected workspace */}
          <WorkflowTipBanner workspace={workspace} />

          <DeployButtonWithTip workspace={workspace} className="w-full">
            <button
              type="submit"
              id="deploy-workflow-modal-btn"
              className="btn-primary w-full h-10 text-xs justify-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Deploy Workflow</span>
            </button>
          </DeployButtonWithTip>
        </form>
      </div>
    </div>
  );
};
