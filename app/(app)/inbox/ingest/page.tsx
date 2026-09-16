"use client";

import { Suspense, useState, DragEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShellClient } from '@/components/client-shell';
import { Button, Card, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Upload,
  DatabaseZap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Plus,
  Radio,
  User,
  Headphones,
  Smartphone,
  ClipboardList,
  PhoneCall,
  Users,
  X,
  Inbox,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function IngestContent() {
  const sp = useSearchParams();
  const [mode, setMode] = useState<'single' | 'csv'>(sp.get('mode') === 'csv' ? 'csv' : 'single');
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('Support ticket');
  const [customer, setCustomer] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.type.includes('csv')) {
        setFile(droppedFile);
        setResult(null);
      } else {
        alert('Please drop a valid .csv file.');
      }
    }
  }

  async function submit() {
    if (mode === 'single' && !content.trim()) {
      alert('Please enter feedback content before submitting.');
      return;
    }
    if (mode === 'csv' && !file) {
      alert('Please select a CSV file to upload.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      let r: Response;
      if (mode === 'csv') {
        const fd = new FormData();
        if (file) fd.append('file', file);
        r = await fetch('/api/feedback/import', { method: 'POST', body: fd });
      } else {
        r = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ content, channel, customerLabel: customer }),
        });
      }
      const d = await r.json();
      setResult(d);
      if (r.ok && mode === 'single') {
        setContent('');
        setCustomer('');
      }
    } catch {
      setResult({ error: 'An unexpected network error occurred while submitting feedback.' });
    } finally {
      setLoading(false);
    }
  }

  async function simulate() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('/api/feedback/simulate', { method: 'POST' });
      const d = await r.json();
      setResult(d);
    } catch {
      setResult({ error: 'Failed to simulate incoming channel sample.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      {/* Primary Ingestion Form Card */}
      <Card className="p-6 shadow-card hover:border-slate-300/80 transition-all duration-200">
        {/* Segmented Mode Selector */}
        <div className="flex gap-2 rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/60">
          <button
            onClick={() => {
              setMode('single');
              setResult(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-150 ${
              mode === 'single'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus size={15} className={mode === 'single' ? 'text-violet-600' : 'text-slate-400'} />
            <span>Single Entry</span>
          </button>
          <button
            onClick={() => {
              setMode('csv');
              setResult(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-150 ${
              mode === 'csv'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet size={15} className={mode === 'csv' ? 'text-violet-600' : 'text-slate-400'} />
            <span>CSV Bulk Import</span>
          </button>
        </div>

        {/* Mode 1: Single Feedback Entry Form */}
        {mode === 'single' ? (
          <div className="mt-6 space-y-5 animate-fade-in">
            {/* Feedback Textarea */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Feedback Content <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-medium text-slate-400">
                  {content.length} characters
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={7}
                placeholder="Paste verbatim customer quote, support ticket message, NPS survey comment, or sales call notes..."
                className="mt-2 w-full rounded-2xl border border-slate-200/90 bg-white p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              />
            </div>

            {/* Channel & Customer Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Source Channel
                </label>
                <div className="mt-2 relative">
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-xs outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                  >
                    <option>Support ticket</option>
                    <option>App store review</option>
                    <option>NPS survey</option>
                    <option>Sales call note</option>
                    <option>Community post</option>
                    <option>Simulated channel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Customer Attribution (Optional)
                </label>
                <div className="mt-2 relative flex items-center">
                  <User size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 shadow-xs outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                    placeholder="e.g. Acme Corp, @jane_doe"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                loading={loading}
                onClick={submit}
                variant="primary"
                size="md"
                className="bg-[#17152b] hover:bg-slate-800 text-white font-bold"
              >
                <Sparkles size={16} className="text-violet-300" />
                <span>Ingest & AI Classify</span>
              </Button>
              <span className="text-[11px] font-medium text-slate-400">
                Auto-generates sentiment, themes & vector embeddings
              </span>
            </div>
          </div>
        ) : (
          /* Mode 2: CSV Bulk Import Area */
          <div className="mt-6 space-y-5 animate-fade-in">
            {/* Drag & Drop Upload Zone */}
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-violet-500 bg-violet-50/80 scale-[0.99]'
                  : 'border-violet-200/80 bg-violet-50/30 hover:border-violet-300 hover:bg-violet-50/50'
              }`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-violet-600 border border-violet-100 shadow-xs">
                <Upload size={22} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
              </div>
              <span className="mt-3.5 text-sm font-black text-slate-900">
                Choose CSV file or drag and drop
              </span>
              <span className="mt-1 text-xs font-medium text-slate-500 max-w-sm">
                Upload customer feedback files up to 250 rows per batch for automated categorization.
              </span>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                <span className="font-bold text-slate-400">Supported columns:</span>
                <span className="rounded-md bg-white px-2 py-0.5 font-bold text-violet-700 border border-violet-100 shadow-xs">
                  content*
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 font-medium text-slate-600 border border-slate-200/80">
                  channel
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 font-medium text-slate-600 border border-slate-200/80">
                  customer_label
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 font-medium text-slate-600 border border-slate-200/80">
                  created_at
                </span>
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setResult(null);
                }}
                className="hidden"
              />
            </label>

            {/* Selected File Card */}
            {file && (
              <div className="flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50/70 p-3.5 shadow-xs animate-slide-up">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-xs">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900">{file.name}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span className="font-semibold text-violet-700 uppercase">CSV Ready</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition shadow-xs"
                  title="Remove selected file"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                loading={loading}
                disabled={!file}
                onClick={submit}
                variant="primary"
                size="md"
                className="bg-[#17152b] hover:bg-slate-800 text-white font-bold"
              >
                <Upload size={16} className="text-violet-300" />
                <span>Import & Process CSV</span>
              </Button>
              <span className="text-[11px] font-medium text-slate-400">
                Parsed and classified server-side
              </span>
            </div>
          </div>
        )}

        {/* Ingestion Response & Feedback Status Card */}
        {result && (
          <div className="mt-6 border-t border-slate-100 pt-5 animate-slide-up">
            {result.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-semibold text-rose-800">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertCircle size={17} className="text-rose-600" />
                  <span>Ingestion Error</span>
                </div>
                <p className="mt-1 leading-relaxed text-rose-800">{result.error}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4.5 text-xs text-emerald-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-emerald-950">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>{result.message || 'Ingestion completed successfully'}</span>
                  </div>
                  <Link
                    href="/inbox"
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-950 transition-colors"
                  >
                    <span>View in Inbox</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Import breakdown if CSV */}
                {result.imported !== undefined && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Imported: {result.imported}
                    </span>
                    {result.failed !== undefined && result.failed > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-2.5 py-1 text-xs font-bold text-amber-800 shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Failed Rows: {result.failed}
                      </span>
                    )}
                  </div>
                )}

                {/* Detailed Errors if present */}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-3 rounded-xl bg-white/80 p-3 border border-emerald-100 text-[11px] text-slate-600">
                    <div className="font-bold text-slate-800 mb-1">Row processing notes:</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {result.errors.map((err: string, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Simulated Channel & Telemetry Card */}
      <Card className="h-fit flex flex-col justify-between p-6 shadow-card hover:border-slate-300/80 transition-all duration-200">
        <div>
          <div className="flex items-center justify-between pb-1">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-600/10 text-violet-600 border border-violet-200/60 shadow-xs">
              <DatabaseZap size={19} />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200/80 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
              <Radio size={11} className="animate-pulse" />
              Simulated Feed
            </span>
          </div>

          <h2 className="mt-4 text-base font-black text-slate-900 tracking-tight">Simulated Channel</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            For demonstration and testing, LOOP provides realistic customer feedback streaming directly into your active workspace without needing third-party API credentials.
          </p>

          <Button
            loading={loading}
            onClick={simulate}
            variant="secondary"
            className="mt-5 w-full font-bold text-slate-800 border-slate-200 bg-white hover:bg-slate-50 shadow-xs"
          >
            <DatabaseZap size={15} className="text-violet-600" />
            <span>Seed Channel Sample</span>
          </Button>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-3.5 text-[11px] leading-relaxed text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Sparkles size={13} className="text-violet-600" />
            <span>Automated AI Pipeline</span>
          </div>
          <p>
            Every ingested item is automatically analyzed for sentiment, assigned to relevant clustered topics, and indexed into the vector store for grounded retrieval.
          </p>
        </div>
      </Card>
    </div>
  );
}

function IngestSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="p-6">
        <div className="h-11 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-6 space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </Card>
      <Card className="h-fit p-6">
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-16 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-10 animate-pulse rounded-xl bg-slate-100" />
      </Card>
    </div>
  );
}

export default function Ingest() {
  return (
    <AppShellClient title="Ingest Feedback" subtitle="Bring customer voice into one workspace">
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/inbox"
          className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
          <span>Back to Feedback Inbox</span>
        </Link>
        <span className="text-[10px] font-black tracking-widest uppercase text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-full">
          Ingestion Center
        </span>
      </div>
      <Suspense fallback={<IngestSkeleton />}>
        <IngestContent />
      </Suspense>
    </AppShellClient>
  );
}
