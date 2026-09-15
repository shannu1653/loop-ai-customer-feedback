"use client";

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShellClient } from '@/components/client-shell';
import { Button, Card } from '@/components/ui';
import { ArrowLeft, Upload, DatabaseZap, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function IngestContent() {
  const sp = useSearchParams();
  const [mode, setMode] = useState<'single' | 'csv'>(sp.get('mode') === 'csv' ? 'csv' : 'single');
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('Support ticket');
  const [customer, setCustomer] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function submit() {
    setLoading(true);
    setResult(null);
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
    setLoading(false);
  }

  async function simulate() {
    setLoading(true);
    const r = await fetch('/api/feedback/simulate', { method: 'POST' });
    setResult(await r.json());
    setLoading(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold ${
              mode === 'single' ? 'bg-white shadow-sm' : ''
            }`}
          >
            Single entry
          </button>
          <button
            onClick={() => setMode('csv')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold ${
              mode === 'csv' ? 'bg-white shadow-sm' : ''
            }`}
          >
            CSV bulk import
          </button>
        </div>

        {mode === 'single' ? (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-bold">
              Feedback content
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={7}
                placeholder="Paste a customer comment..."
                className="mt-2 w-full rounded-xl border bg-white p-4 outline-none focus:border-violet-400"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold">
                Channel
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="mt-2 w-full rounded-xl border bg-white p-3"
                >
                  <option>Support ticket</option>
                  <option>App store review</option>
                  <option>NPS survey</option>
                  <option>Sales call note</option>
                  <option>Community post</option>
                </select>
              </label>
              <label className="block text-sm font-bold">
                Customer label
                <input
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="mt-2 w-full rounded-xl border bg-white p-3"
                  placeholder="e.g. Acme Corp"
                />
              </label>
            </div>
            <Button loading={loading} onClick={submit} className="bg-[#17152b] text-white">
              <Sparkles size={16} /> Ingest & classify
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 text-center">
              <Upload className="text-violet-600" />
              <span className="mt-3 font-bold">Choose CSV file</span>
              <span className="mt-1 text-xs text-slate-500">
                Columns: content, channel, customer_label, created_at
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {file && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold">
                {file.name}
              </div>
            )}
            <Button loading={loading} onClick={submit} className="mt-5 bg-[#17152b] text-white">
              <Upload size={16} /> Import CSV
            </Button>
          </div>
        )}

        {result && (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 size={17} />
              {result.message || 'Completed'}
            </div>
            {result.imported !== undefined && (
              <div className="mt-1">
                Imported: {result.imported} · Failed: {result.failed}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="h-fit">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
          <DatabaseZap size={18} />
        </div>
        <h2 className="mt-4 font-black">Simulated channel</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          For the internship scope, LOOP simulates a real external channel with realistic customer feedback instead of requiring third-party credentials.
        </p>
        <Button loading={loading} onClick={simulate} className="mt-5 w-full border bg-white">
          Seed channel sample
        </Button>
        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          Every new item is classified server-side, assigned to themes, and prepared for grounded retrieval.
        </div>
      </Card>
    </div>
  );
}

function IngestSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-6 h-48 animate-pulse rounded-xl bg-slate-100" />
      </Card>
      <Card className="h-fit">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-16 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-10 animate-pulse rounded-xl bg-slate-100" />
      </Card>
    </div>
  );
}

export default function Ingest() {
  return (
    <AppShellClient title="Ingest feedback" subtitle="Bring customer voice into one workspace">
      <Link
        href="/inbox"
        className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> Back to inbox
      </Link>
      <Suspense fallback={<IngestSkeleton />}>
        <IngestContent />
      </Suspense>
    </AppShellClient>
  );
}
