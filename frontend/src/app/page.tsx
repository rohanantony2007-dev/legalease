'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, ShieldCheck, Sparkles, FolderKanban } from 'lucide-react';
import { api, AnalyticsData, DocumentItem } from '@/lib/api-client';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { RiskBadge } from '@/components/clauses/RiskBadge';
import { formatBytes, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [anData, docData] = await Promise.all([
          api.getAnalytics(),
          api.getDocuments({ limit: '5' } as any),
        ]);
        setAnalytics(anData);
        setRecentDocs(docData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-400">Loading Legal Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contract Intelligence Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated clause analysis, risk assessment, and practice analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            AI Engine Operational
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      {analytics && <MetricsGrid analytics={analytics} />}

      {/* Main Grid: Risk Distribution + Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {analytics && <RiskDistributionChart distribution={analytics.risk_distribution} />}
        </div>
        <div>
          {analytics && <RecentActivityFeed activity={analytics.recent_activity} />}
        </div>
      </div>

      {/* Recent Contracts Under Review */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Contracts Under Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              High-priority documents requiring partner review
            </p>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View all documents
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Document Title</th>
                <th className="px-5 py-3">Client / Matter</th>
                <th className="px-5 py-3">Risk Assessment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <p className="truncate max-w-xs">{doc.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatBytes(doc.file_size_bytes)} &bull; {doc.file_type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {doc.matter_client || 'Corporate Client'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">
                      {doc.matter_title || 'General Matter'}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <RiskBadge level={doc.risk_level} size="sm" />
                      <span className="font-mono text-[11px] text-slate-500">
                        {doc.risk_score.toFixed(0)}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:text-indigo-400 transition-colors"
                    >
                      Inspect Clauses
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
