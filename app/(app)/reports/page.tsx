"use client";

import { useEffect, useState, useCallback } from 'react';
import { AppShellClient } from '@/components/client-shell';
import { Button, Card } from '@/components/ui';
import { FileText, Download, Sparkles, CalendarDays, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export interface ReportItem {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  generatedBy?: {
    name: string;
    email: string;
  };
}

export default function Reports() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'VIEWER';
  const canModify = userRole === 'ADMIN' || userRole === 'ANALYST';

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await fetch('/api/reports');
      const data = await r.json();
      if (!r.ok) {
        throw new Error(data.error || 'Failed to fetch reports');
      }
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generate() {
    if (!canModify) {
      alert('Viewers have read-only access. Analyst or Admin role required to generate reports.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ days }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Report generation failed');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <AppShellClient
      title="VoC Reports"
      subtitle="Leadership-ready executive summaries generated from real customer feedback"
    >
      {/* Hero Action Card */}
      <div
        className="mb-6 flex flex-col gap-5 rounded-3xl bg-[#17152b] p-7 text-white shadow-soft md:flex-row md:items-center md:justify-between"
        style={{
          backgroundColor: '#17152b',
          background: 'linear-gradient(135deg, #281d52 0%, #17152b 100%)',
        }}
      >
        <div>
          <div
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-violet-300"
            style={{ color: '#c4b5fd' }}
          >
            <Sparkles size={16} /> VOICE OF CUSTOMER
          </div>
          <h2 className="mt-2 text-2xl font-black text-white">
            Turn the last 30 days into a decision brief.
          </h2>
          <p
            className="mt-1 max-w-xl text-sm leading-relaxed text-slate-200"
            style={{ color: '#e2e8f0' }}
          >
            Stats are computed from actual workspace data before AI writes the narrative.
          </p>
        </div>


        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center gap-1 rounded-xl p-1 backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span className="px-2 text-xs font-semibold text-slate-200">Period:</span>
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  days === d ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/15'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          {canModify ? (
            <Button
              loading={generating}
              onClick={generate}
              className="bg-white text-[#17152b] hover:bg-slate-100 font-bold shadow-sm"
            >
              Generate report
            </Button>
          ) : (
            <div
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-white"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Read-only (VIEWER)
            </div>
          )}
        </div>
      </div>


      {/* Error Callout */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button onClick={load} className="border border-rose-200 bg-white text-xs text-rose-800 hover:bg-rose-50">
            <RefreshCw size={13} /> Retry
          </Button>
        </div>
      )}

      {/* Reports List / Skeleton / Empty State */}
      <div className="grid gap-4">
        {initialLoading ? (
          <>
            <Card className="h-24 animate-pulse bg-slate-100/70">{null}</Card>
            <Card className="h-24 animate-pulse bg-slate-100/70">{null}</Card>
          </>
        ) : reports.length > 0 ? (
          reports.map((r) => (
            <Card
              key={r.id}
              className="flex flex-col gap-4 transition hover:border-violet-200 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{r.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <CalendarDays size={13} />
                      {new Date(r.periodStart).toLocaleDateString()} — {new Date(r.periodEnd).toLocaleDateString()}
                    </span>
                    {r.generatedBy?.name && (
                      <>
                        <span>•</span>
                        <span>Generated by {r.generatedBy.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href={`/reports/${r.id}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm"
                >
                  View report
                </Link>
                <button
                  onClick={() => window.open(`/reports/${r.id}`, '_blank')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#17152b] px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm"
                >
                  <Download size={14} /> Export PDF
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText size={22} />
              </div>
              <h3 className="mt-4 text-base font-black text-slate-800">No reports generated yet</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                Generate your first Voice-of-Customer brief using the action panel above.
              </p>
            </div>
          </Card>
        )}
      </div>
    </AppShellClient>
  );
}

