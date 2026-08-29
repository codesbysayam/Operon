import React from 'react';
import { AnalyticsData } from '../types';
import { BarChart3, TrendingUp, DollarSign, Clock, CheckCircle2, Zap } from 'lucide-react';

interface AnalyticsPageProps {
  analytics: AnalyticsData;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ analytics }) => {
  return (
    <div
      id="analytics-page"
      className="flex-1 overflow-y-auto px-6 py-6 text-white space-y-6 select-none font-sans max-w-[1600px] mx-auto w-full"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[24px] bg-white/[0.04] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="meta-label text-[#FFB000]">ROI &amp; PERFORMANCE</span>
            <span className="text-white/20">•</span>
            <span className="meta-label">Telemetry Metrics</span>
          </div>
          <h1 className="page-title leading-tight">Analytics Dashboard</h1>
          <p className="text-xs text-white/50 mt-1">
            Real-time metrics on operational throughput, human oversight ratios, and cumulative cost savings.
          </p>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-2">
          <span className="meta-label">
            Total Cases Automated
          </span>
          <div className="stat-display text-white">
            {analytics.casesAutomated.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#22D3A7] font-semibold">+14.2% from last month</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-2">
          <span className="meta-label">
            Human Review Rate
          </span>
          <div className="stat-display text-[#FFB000]">
            {analytics.humanReviewRate}%
          </div>
          <p className="text-[11px] text-white/40">91.4% fully autonomous</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-2">
          <span className="meta-label">
            Avg Resolution Speed
          </span>
          <div className="stat-display text-white">
            4m 12s
          </div>
          <p className="text-[11px] text-[#22D3A7] font-semibold">88% faster than manual SLA</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-2">
          <span className="meta-label">
            Estimated Cost Saved
          </span>
          <div className="stat-display text-[#22D3A7]">
            ${analytics.costSavedUSD.toLocaleString()}
          </div>
          <p className="text-[11px] text-white/40">Based on $22/hr support cost</p>
        </div>
      </div>

      {/* Weekly Trend Chart Mock Visualizer */}
      <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.08] space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Weekly Case Volume vs Automation</h3>
            <p className="text-xs text-white/50 mt-0.5">
              Comparing total incoming operational tasks against automated resolutions.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#FFB000]" />
              <span className="text-white/70">Total Volume</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#22D3A7]" />
              <span className="text-white/70">Automated</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="h-52 flex items-end justify-between gap-4 pt-4 border-b border-white/[0.08] font-mono text-xs">
          {analytics.weeklyTrend.map((day) => {
            const totalHeight = (day.cases / 300) * 100;
            const autoHeight = (day.automated / 300) * 100;
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full max-w-[36px] flex items-end justify-center gap-1.5 h-full">
                  <div
                    className="w-1/2 bg-[#FFB000] rounded-t-sm transition-all hover:brightness-110"
                    style={{ height: `${totalHeight}%` }}
                    title={`Total: ${day.cases}`}
                  />
                  <div
                    className="w-1/2 bg-[#22D3A7] rounded-t-sm transition-all hover:brightness-110"
                    style={{ height: `${autoHeight}%` }}
                    title={`Automated: ${day.automated}`}
                  />
                </div>
                <span className="text-white/40 font-semibold text-[10px] uppercase">{day.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
