'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: 'PASS' | 'ATTENTION' | 'HIGH_RISK' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'sm', showIcon = true }) => {
  const normLevel = level.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let Icon = ShieldCheck;
  let label = level;

  if (normLevel === 'PASS' || normLevel === 'LOW') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
    Icon = ShieldCheck;
    label = normLevel === 'PASS' ? 'Standard Pass' : 'Low Risk';
  } else if (normLevel === 'ATTENTION' || normLevel === 'MEDIUM') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
    Icon = AlertTriangle;
    label = normLevel === 'ATTENTION' ? 'Needs Attention' : 'Medium Risk';
  } else if (normLevel === 'HIGH_RISK' || normLevel === 'HIGH' || normLevel === 'CRITICAL') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
    Icon = ShieldAlert;
    label = normLevel === 'HIGH_RISK' ? 'High Risk' : normLevel === 'CRITICAL' ? 'Critical Risk' : 'High Risk';
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        sizeClasses[size],
        styles
      )}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')} />}
      <span>{label}</span>
    </span>
  );
};
