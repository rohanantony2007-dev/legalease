'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Search, Plus, Filter, ArrowRight, ExternalLink } from 'lucide-react';
import { api, DocumentItem, Matter } from '@/lib/api-client';
import { RiskBadge } from '@/components/clauses/RiskBadge';
import { Modal } from '@/components/ui/Modal';
import { formatBytes, formatDate } from '@/lib/utils';

function DocumentsContent() {
  const searchParams = useSearchParams();
  const initialMatterId = searchParams.get('matter_id') || undefined;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docMatterId, setDocMatterId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const riskLevels = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const [docs, mats] = await Promise.all([
        api.getDocuments({
          matter_id: initialMatterId,
          risk_level: selectedRisk,
          search: search || undefined,
        }),
        api.getMatters(),
      ]);
      setDocuments(docs);
      setMatters(mats);
      if (mats.length > 0 && !docMatterId) {
        setDocMatterId(mats[0].id);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [selectedRisk, initialMatterId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocs();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docMatterId) return;
    setIsSubmitting(true);
    try {
      await api.createDocument({
        title: docTitle,
        matter_id: docMatterId,
        file_type: 'PDF',
        file_size_bytes: 1850000,
        risk_level: 'LOW',
        risk_score: 20.0,
        status: 'INGESTED',
        summary: 'Newly uploaded legal contract awaiting automated AI risk evaluation.',
      });
      setIsUploadOpen(false);
      setDocTitle('');
      fetchDocs();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Document Vault & Contract Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized legal contracts, NDAs, Master Service Agreements, and purchase orders.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Contract
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Risk:
          </span>
          {riskLevels.map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedRisk === risk
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {risk === 'ALL' ? 'All Risks' : risk}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search document title..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </form>
      </div>

      {/* Document Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Contract Document</th>
                  <th className="px-5 py-3">Client / Engagement</th>
                  <th className="px-5 py-3">Risk Assessment</th>
                  <th className="px-5 py-3">Review Status</th>
                  <th className="px-5 py-3">Uploaded</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                            {doc.title}
                          </p>
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
                        {doc.matter_title}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <RiskBadge level={doc.risk_level} size="sm" />
                        <span className="font-mono text-[11px] text-slate-500 font-medium">
                          {doc.risk_score.toFixed(0)}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {formatDate(doc.uploaded_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 transition-colors shadow-2xs"
                      >
                        Clause Inspector
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Contract Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Contract to Document Vault"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Title
            </label>
            <input
              type="text"
              required
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Master Consulting Services Agreement"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assign to Legal Matter
            </label>
            <select
              value={docMatterId}
              onChange={(e) => setDocMatterId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none"
            >
              {matters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.client_name})
                </option>
              ))}
            </select>
          </div>
          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Uploading...' : 'Ingest Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DocumentsContent />
    </Suspense>
  );
}
