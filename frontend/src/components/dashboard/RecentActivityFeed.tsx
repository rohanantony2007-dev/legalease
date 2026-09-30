'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, Cpu, Edit, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ActivityItem {
  id: string;
  action: string;
  document_title: string;
  user_name: string;
  details: any;
  timestamp: string;
}

interface RecentActivityFeedProps {
  activity: ActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activity }) => {
  const getActionMeta = (action: string) => {
    switch (action) {
      case 'DOCUMENT_UPLOADED':
        return { icon: FileUp, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40', label: 'Uploaded Document' };
      case 'AI_RISK_EVALUATED':
        return { icon: Cpu, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40', label: 'AI Risk Evaluated' };
      case 'CLAUSE_MODIFIED':
        return { icon: Edit, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40', label: 'Clause Revised' };
      case 'STATUS_CHANGED':
        return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40', label: 'Status Updated' };
      default:
        return { icon: Clock, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800', label: action.replace(/_/g, ' ') };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Real-Time Audit Trail
        </h3>
        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          Live Sync
        </span>
      </div>

      <div className="space-y-3">
        {activity.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded.</p>
        ) : (
          activity.map((item, index) => {
            const meta = getActionMeta(item.action);
            const Icon = meta.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
              >
                <div className={`p-2 rounded-lg shrink-0 ${meta.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {meta.label}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.document_title} &bull; <span className="font-medium">{item.user_name}</span>
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
