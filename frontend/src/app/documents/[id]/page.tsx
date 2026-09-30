'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Download,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';
import { api, DocumentItem, Clause } from '@/lib/api-client';
import { ClauseCard } from '@/components/clauses/ClauseCard';
import { RiskBadge } from '@/components/clauses/RiskBadge';
import { formatBytes, formatDate } from '@/lib/utils';

export default function DocumentDetailPage() {
  const params = useParams();
  const docId = params.id as string;

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'HIGH_RISK' | 'ATTENTION' | 'PASS'>('ALL');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedSuccess, setAnalyzedSuccess] = useState(false);

  const loadDocumentData = async () => {
    try {
      const [doc, cls] = await Promise.all([
        api.getDocument(docId),
        api.getDocumentClauses(docId),
      ]);
      setDocument(doc);
      setClauses(cls);
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (docId) {
      loadDocumentData();
    }
  }, [docId]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const updatedDoc = await api.analyzeDocument(docId);
      const updatedClauses = await api.getDocumentClauses(docId);
      setDocument(updatedDoc);
      setClauses(updatedClauses);
      setAnalyzedSuccess(true);
      setTimeout(() => setAnalyzedSuccess(false), 3000);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading Document Workspace...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-semibold text-slate-600">Document not found.</p>
        <Link href="/documents" className="mt-3 inline-block text-xs text-indigo-600 hover:underline">
          &larr; Back to Document Vault
        </Link>
      </div>
    );
  }

  const filteredClauses = clauses.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.risk_rating === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="space-y-3">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Document Vault
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {document.title}
              </h1>
              <RiskBadge level={document.risk_level} size="md" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Client: <span className="font-semibold text-slate-700 dark:text-slate-300">{document.matter_client || 'Corporate'}</span> &bull; Matter: <span className="font-medium text-slate-600 dark:text-slate-300">{document.matter_title}</span>
            </p>
          </div>

          {/* Analysis Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                analyzedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              {analyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Clauses...
                </>
              ) : analyzedSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Analysis Complete
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Run AI Risk Scan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Split-Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contract Overview & Raw Text Inspector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Executive Summary Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Executive AI Summary
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {document.summary || 'Document uploaded and awaiting detailed legal analysis.'}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Risk Score</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                  {document.risk_score.toFixed(1)} / 100
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Evaluated Clauses</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                  {clauses.length} Sections
                </span>
              </div>
            </div>
          </div>

          {/* Contract File Metadata */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contract Specifications
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Format & Size</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {document.file_type} &bull; {formatBytes(document.file_size_bytes)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Ingested At</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatDate(document.uploaded_at)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Review Status</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {document.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Clause Risk Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {/* Clause Filter Tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Clauses ({clauses.length})
              </button>
              <button
                onClick={() => setActiveTab('HIGH_RISK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'HIGH_RISK'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                High Risk ({clauses.filter((c) => c.risk_rating === 'HIGH_RISK').length})
              </button>
              <button
                onClick={() => setActiveTab('ATTENTION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'ATTENTION'
                    ? 'bg-amber-500 text-white'
                    : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                Attention ({clauses.filter((c) => c.risk_rating === 'ATTENTION').length})
              </button>
              <button
                onClick={() => setActiveTab('PASS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'PASS'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                Passed ({clauses.filter((c) => c.risk_rating === 'PASS').length})
              </button>
            </div>
          </div>

          {/* Clause Cards List */}
          <div className="space-y-3">
            {filteredClauses.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <FileCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No clauses match the selected filter category.</p>
              </div>
            ) : (
              filteredClauses.map((clause) => (
                <ClauseCard
                  key={clause.id}
                  clause={clause}
                  onUpdate={loadDocumentData}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
