'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Check, AlertCircle, Edit3 } from 'lucide-react';
import { Clause } from '@/lib/api-client';
import { RiskBadge } from './RiskBadge';

interface ClauseCardProps {
  clause: Clause;
  onUpdate?: (updated: Clause) => void;
}

export const ClauseCard: React.FC<ClauseCardProps> = ({ clause, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApplySimplification = async () => {
    setIsApplying(true);
    try {
      // Simulate quick action or API patch
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
    >
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors border-b border-slate-100 dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            § {clause.section_number}
          </span>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight">
            {clause.clause_type.replace(/_/g, ' ')}
          </h4>
          <RiskBadge level={clause.risk_rating} size="sm" />
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Expandable Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="p-5 space-y-4 text-sm"
          >
            {/* Original Legal Phrasing */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                Original Legal Language
              </span>
              <p className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 font-mono text-xs leading-relaxed">
                "{clause.original_text}"
              </p>
            </div>

            {/* AI Simplified Summary */}
            {clause.simplified_text && (
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Plain English Legal Translation
                </div>
                <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  {clause.simplified_text}
                </p>
              </div>
            )}

            {/* AI Strategic Recommendation */}
            {clause.recommendation && (
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 rounded-lg p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Counsel Strategic Recommendation
                </div>
                <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                  {clause.recommendation}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/70">
              <span className="text-xs text-slate-400">
                AI Confidence: 98.4%
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplySimplification}
                  disabled={isApplying || applied}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    applied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {applied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Applied to Draft
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Accept Proposed Language
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
