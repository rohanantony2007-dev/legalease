'use client';

import React, { useState } from 'react';
import '../styles/globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api-client';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNewMatterOpen, setIsNewMatterOpen] = useState(false);
  const [matterTitle, setMatterTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [practiceArea, setPracticeArea] = useState('Corporate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matterTitle || !clientName) return;
    setIsSubmitting(true);
    try {
      await api.createMatter({
        title: matterTitle,
        client_name: clientName,
        practice_area: practiceArea,
        status: 'OPEN',
      });
      setIsNewMatterOpen(false);
      setMatterTitle('');
      setClientName('');
      // reload or dispatch event
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>LegalEase &bull; Modern Legal Document & Contract Intelligence</title>
        <meta name="description" content="AI-assisted contract review, clause intelligence, and matter management." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
        <Navbar
          onOpenNewMatter={() => setIsNewMatterOpen(true)}
        />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-[calc(100vh-4rem)] p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto">
            {children}
          </main>
        </div>

        {/* New Matter Modal */}
        <Modal
          isOpen={isNewMatterOpen}
          onClose={() => setIsNewMatterOpen(false)}
          title="Create New Legal Matter"
        >
          <form onSubmit={handleCreateMatter} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Matter Title
              </label>
              <input
                type="text"
                required
                value={matterTitle}
                onChange={(e) => setMatterTitle(e.target.value)}
                placeholder="e.g. Acquisition of Horizon Cyber"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Organization
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Apex Global Ventures"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Practice Area
              </label>
              <select
                value={practiceArea}
                onChange={(e) => setPracticeArea(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Corporate">Corporate & Governance</option>
                <option value="M&A">Mergers & Acquisitions (M&A)</option>
                <option value="IP & Tech">IP & Technology Licensing</option>
                <option value="Commercial">Commercial Contracting</option>
                <option value="Compliance">Regulatory & Compliance</option>
                <option value="Employment">Employment Law</option>
              </select>
            </div>
            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewMatterOpen(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Matter'}
              </button>
            </div>
          </form>
        </Modal>
      </body>
    </html>
  );
}
