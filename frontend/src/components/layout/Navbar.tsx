'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Scale, Plus, Moon, Sun, Bell, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  onOpenNewMatter?: () => void;
  onOpenUploadDoc?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewMatter, onOpenUploadDoc }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">
              Legal<span className="text-indigo-600 dark:text-indigo-400">Ease</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Intelligence v1.0
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contracts, clauses, matters..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Action Buttons */}
        {onOpenUploadDoc && (
          <button
            onClick={onOpenUploadDoc}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Upload Contract
          </button>
        )}

        {onOpenNewMatter && (
          <button
            onClick={onOpenNewMatter}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Matter
          </button>
        )}

        {/* Dark/Light toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User profile avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            EV
          </div>
          <div className="hidden lg:block text-left text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">Eleanor Vance</p>
            <p className="text-[10px] text-slate-500">Partner &bull; M&A</p>
          </div>
        </div>
      </div>
    </header>
  );
};
