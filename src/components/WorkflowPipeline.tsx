import React from 'react';
import { PipelineStep, AgentRole } from '../types';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';

interface WorkflowPipelineProps {
  pipeline: PipelineStep[];
  isExecuting?: boolean;
}

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({ pipeline, isExecuting }) => {
  return (
    <div id="workflow-pipeline-visualizer" className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[#FFB000]" />
          <h3 className="text-sm font-semibold text-white">Multi-Agent Execution Pipeline</h3>
        </div>
        {isExecuting && (
          <div className="flex items-center space-x-2 text-xs font-mono text-[#FFB000] bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Live Agent Step Executing...</span>
          </div>
        )}
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Vertical Connecting Line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-0 border-l border-dashed border-white/[0.15]" />

        {pipeline.map((step, index) => {
          const isDone = step.status === 'completed';
          const isRunning = step.status === 'running';
          const isAwaiting = step.status === 'awaiting_approval';

          return (
            <div key={step.id || index} className="relative flex items-start gap-4 group">
              {/* Node Icon */}
              <div
                className={`absolute -left-6 flex h-[23px] w-[23px] items-center justify-center rounded-full text-xs font-bold ring-4 ring-[#08090D] z-10 transition-all ${
                  isDone
                    ? 'bg-[#22D3A7] text-[#08090D]'
                    : isRunning
                    ? 'bg-[#FFB000] text-[#08090D] animate-pulse'
                    : isAwaiting
                    ? 'bg-[#FFB000] text-[#08090D]'
                    : 'bg-white/[0.08] text-white/40 border border-white/[0.1]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isRunning ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : isAwaiting ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Step Card Content */}
              <div className="flex-1 p-4 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] space-y-3 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase bg-white/[0.06] text-white/70 px-2 py-0.5 rounded border border-white/[0.08]">
                      {step.agentRole.replace('_', ' ')}
                    </span>
                    <h4 className="text-xs font-semibold text-white">{step.agentName}</h4>
                  </div>
                  <StatusBadge status={step.status} size="xs" />
                </div>

                <p className="text-xs font-semibold text-white/90">{step.stepName}</p>

                {step.output && (
                  <p className="text-[11px] text-white/70 font-mono bg-white/[0.02] p-3 rounded-xl border border-white/[0.04] leading-relaxed">
                    {step.output}
                  </p>
                )}

                {step.confidenceScore !== undefined && (
                  <div className="flex items-center justify-between pt-1 text-[10px] text-white/40 font-mono">
                    <span>
                      Confidence: <strong className="text-[#22D3A7]">{step.confidenceScore}%</strong>
                    </span>
                    {step.reasoning && <span className="italic text-white/40">{step.reasoning}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
