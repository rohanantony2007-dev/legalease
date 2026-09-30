'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RiskDistributionChartProps {
  distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ distribution }) => {
  const total = distribution.low + distribution.medium + distribution.high + distribution.critical || 1;

  const segments = [
    { label: 'Low Risk', count: distribution.low, color: 'bg-emerald-500', barColor: 'bg-emerald-500', pct: (distribution.low / total) * 100 },
    { label: 'Medium Risk', count: distribution.medium, color: 'bg-amber-500', barColor: 'bg-amber-500', pct: (distribution.medium / total) * 100 },
    { label: 'High Risk', count: distribution.high, color: 'bg-rose-500', barColor: 'bg-rose-500', pct: (distribution.high / total) * 100 },
    { label: 'Critical Risk', count: distribution.critical, color: 'bg-purple-600', barColor: 'bg-purple-600', pct: (distribution.critical / total) * 100 },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Contract Risk Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribution across {total} active contract documents
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500">
          Auto-Evaluated
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-1 p-0.5 mb-6">
        {segments.map((seg) => (
          <motion.div
            key={seg.label}
            initial={{ width: 0 }}
            animate={{ width: `${seg.pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${seg.barColor}`}
            title={`${seg.label}: ${seg.count} (${seg.pct.toFixed(0)}%)`}
          />
        ))}
      </div>

      {/* Metrics Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {seg.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {seg.count}
              </span>
              <span className="text-[11px] text-slate-400">
                ({seg.pct.toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
