import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip, YAxis } from 'recharts';
import { AgentInfo } from '../types';
import { TrendingUp, Activity } from 'lucide-react';

interface AgentThroughputSparklineProps {
  agent: AgentInfo;
}

export const AgentThroughputSparkline: React.FC<AgentThroughputSparklineProps> = ({ agent }) => {
  const isActive = agent.status === 'active';

  // Generate 6 deterministic 10-minute intervals over the last 1 hour
  const data = useMemo(() => {
    if (!isActive) {
      return [
        { time: '50m ago', efficiency: 0 },
        { time: '40m ago', efficiency: 0 },
        { time: '30m ago', efficiency: 0 },
        { time: '20m ago', efficiency: 0 },
        { time: '10m ago', efficiency: 0 },
        { time: 'Now', efficiency: 0 },
      ];
    }

    const baseEff = agent.accuracyRate || 95;
    const charCodeSum = agent.id
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const offsets = [
      -3.5 + ((charCodeSum * 3) % 5) * 0.7,
      -1.2 + ((charCodeSum * 7) % 6) * 0.6,
      1.5 - ((charCodeSum * 11) % 4) * 0.5,
      -0.8 + ((charCodeSum * 5) % 5) * 0.4,
      1.8 - ((charCodeSum * 13) % 4) * 0.3,
      0,
    ];

    const labels = ['50m', '40m', '30m', '20m', '10m', 'Now'];

    return labels.map((label, idx) => {
      const val = Math.min(99.9, Math.max(75, baseEff + offsets[idx]));
      return {
        time: label,
        efficiency: Number(val.toFixed(1)),
      };
    });
  }, [agent.id, agent.accuracyRate, isActive]);

  const latestEff = data[data.length - 1].efficiency;
  const firstEff = data[0].efficiency;
  const isUp = latestEff >= firstEff;

  // Determine color scheme based on efficiency
  const strokeColor = !isActive
    ? '#64748b' // Slate-500
    : latestEff >= 96
    ? '#34d399' // Emerald-400
    : latestEff >= 92
    ? '#38bdf8' // Sky-400
    : '#fbbf24'; // Amber-400

  const gradientId = `agent-sparkline-grad-${agent.id}`;

  return (
    <div
      id={`agent-sparkline-${agent.id}`}
      className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 shrink-0 hover:border-white/20 transition-all cursor-help"
      title={`1h Throughput Efficiency Trend: ${isActive ? `${latestEff}% (${isUp ? '+' : ''}${(latestEff - firstEff).toFixed(1)}% in 1h)` : 'Inactive (0%)'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Miniature Recharts Sparkline */}
      <div className="w-[52px] h-[18px] flex items-center justify-center overflow-hidden">
        <AreaChart
          width={52}
          height={18}
          data={data}
          margin={{ top: 2, right: 1, bottom: 2, left: 1 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.45} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis domain={['dataMin - 5', 'dataMax + 2']} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-black/90 border border-white/20 px-2 py-1 rounded shadow-xl text-[10px] font-mono text-white pointer-events-none z-50 whitespace-nowrap">
                    <span className="text-slate-400">{item.time}: </span>
                    <span
                      className="font-extrabold"
                      style={{ color: strokeColor }}
                    >
                      {item.efficiency}% eff.
                    </span>
                  </div>
                );
              }
              return null;
            }}
            wrapperStyle={{ zIndex: 100 }}
            cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="efficiency"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 2.5, fill: strokeColor, stroke: '#000', strokeWidth: 1 }}
          />
        </AreaChart>
      </div>

      {/* Tiny Efficiency Delta Badge */}
      {isActive && (
        <span
          className="text-[9px] font-mono font-black"
          style={{ color: strokeColor }}
        >
          {latestEff.toFixed(0)}%
        </span>
      )}
    </div>
  );
};
