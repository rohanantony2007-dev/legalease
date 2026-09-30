'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AnalyticsData } from '@/lib/api-client';

interface MetricsGridProps {
  analytics: AnalyticsData;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ analytics }) => {
  const cards = [
    {
      title: 'Active Matters',
      value: analytics.active_matters,
      subtext: `${analytics.total_matters} total matters registered`,
      icon: Briefcase,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/50',
    },
    {
      title: 'Analyzed Contracts',
      value: analytics.analyzed_documents,
      subtext: `${analytics.total_documents} contracts in repository`,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-100 dark:border-blue-900/50',
    },
    {
      title: 'High-Risk Clauses',
      value: analytics.high_risk_clauses,
      subtext: 'Requires partner attention',
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/50',
    },
    {
      title: 'Firm Compliance Score',
      value: `${analytics.compliance_score}%`,
      subtext: 'Market benchmark: > 85%',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {card.subtext}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
