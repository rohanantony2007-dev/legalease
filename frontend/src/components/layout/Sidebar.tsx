'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ShieldCheck,
  Activity,
  ChevronRight,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Legal Matters', href: '/matters', icon: Briefcase },
    { name: 'Document Vault', href: '/documents', icon: FileText },
    { name: 'Audit & Playback', href: '/playback', icon: Activity },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 p-4 justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Practice Management
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600')} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-60" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Legal Intelligence Status Box */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              AI Review Engine
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Real-time clause analysis active with SQLite WAL synchronization.
          </p>
        </div>
      </div>

      {/* System footer badge */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>SQLite 3 &bull; WAL</span>
        </div>
        <span className="font-mono text-[10px]">FastAPI 1.0</span>
      </div>
    </aside>
  );
};
