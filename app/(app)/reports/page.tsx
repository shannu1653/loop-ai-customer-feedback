"use client";

import { useEffect, useState, useCallback } from 'react';
import { AppShellClient } from '@/components/client-shell';
import { Button, Card, Badge } from '@/components/ui';
import {
  FileText,
  Download,
  Sparkles,
  CalendarDays,
  AlertCircle,
  RefreshCw,
  Radio,
  Clock,
  User,
  ArrowRight,
  Printer,
  Compass,
  FileCheck,
  Shield,
  Layers,
} from 'lucide-react';
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
      {/* 0. Contextual Header Strip */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs lg:flex-row lg:items-center">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600/10 text-violet-600 border border-violet-200/60 shadow-xs">
            <Radio size={19} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-violet-700 uppercase bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                Voice of Customer
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Executive Briefing
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Transform raw feedback into decision-ready executive intelligence briefs for leadership, product, and customer success teams.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <Button
            onClick={load}
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
          >
            <RefreshCw size={13} className={initialLoading ? 'animate-spin text-violet-600' : 'text-slate-500'} />
            <span>Refresh Reports</span>
          </Button>
          {!canModify && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <Shield size={13} className="text-slate-400" />
              <span>Read-only (VIEWER)</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. Report Builder Hero Card */}
      <div className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#17152b] via-[#1f1b3d] to-[#121024] p-6 sm:p-8 text-white shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-violet-300">
              <Sparkles size={18} className="animate-pulse text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Executive Synthesis Engine
              </span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
              Turn customer feedback into a decision brief.
            </h2>
            <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-white/65 leading-relaxed">
              Statistics, sentiment shifts, and theme clusters are computed from your verified database before AI writes the narrative and recommended actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
            {/* Period Selector */}
            <div className="flex items-center gap-1 rounded-2xl bg-white/10 border border-white/15 p-1 backdrop-blur-md">
              <span className="px-2 text-xs font-semibold text-white/70">Period:</span>
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-150 active:scale-[0.97] ${
                    days === d
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>

            {/* Generate Action Button */}
            {canModify ? (
              <Button
                loading={generating}
                onClick={generate}
                variant="primary"
                size="md"
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-sm active:scale-[0.98]"
              >
                <FileCheck size={16} />
                <span>Generate VoC Report</span>
              </Button>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/60">
                Analyst or Admin required to generate
              </div>
            )}
          </div>
        </div>

        {/* Processing Indicator */}
        {generating && (
          <div className="mt-5 rounded-2xl border border-violet-400/30 bg-violet-600/20 p-4 text-xs font-semibold text-violet-200 backdrop-blur-md animate-fade-in flex items-center gap-3">
            <RefreshCw size={16} className="animate-spin text-violet-300" />
            <span>
              Aggregating verified customer records for the last {days} days and synthesizing executive narrative...
            </span>
          </div>
        )}
      </div>

      {/* 2. Error Callout */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-semibold text-rose-800 shadow-xs animate-slide-up">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button
            onClick={load}
            variant="secondary"
            size="sm"
            className="border-rose-200 bg-white text-xs text-rose-800 hover:bg-rose-50"
          >
            <RefreshCw size={12} /> Retry
          </Button>
        </div>
      )}

      {/* 3. Saved Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Generated Reports Library
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Access and export past Voice-of-Customer briefs.
            </p>
          </div>
          <Badge tone="violet" variant="subtle">
            {reports.length} Saved {reports.length === 1 ? 'Brief' : 'Briefs'}
          </Badge>
        </div>

        {initialLoading ? (
          // Skeletons
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-5 w-60 animate-pulse rounded bg-slate-200/70" />
                    <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </Card>
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="grid gap-4">
            {reports.map((r) => (
              <Card
                key={r.id}
                className="flex flex-col gap-4 p-5 transition-all duration-200 hover:border-violet-300 hover:shadow-card-hover md:flex-row md:items-center md:justify-between shadow-card"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700 border border-violet-100 shadow-xs">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">
                        {r.title}
                      </h4>
                      <Badge tone="violet" variant="subtle">Executive Brief</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <CalendarDays size={12} className="text-slate-400" />
                        {new Date(r.periodStart).toLocaleDateString()} — {new Date(r.periodEnd).toLocaleDateString()}
                      </span>
                      {r.generatedBy?.name && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <User size={11} className="text-slate-400" />
                            {r.generatedBy.name}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock size={11} />
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    href={`/reports/${r.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
                  >
                    <span>View Brief</span>
                    <ArrowRight size={13} className="text-slate-400" />
                  </Link>
                  <button
                    onClick={() => window.open(`/reports/${r.id}`, '_blank')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#17152b] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
                    title="Open print & PDF export view"
                  >
                    <Printer size={13} className="text-violet-300" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-16 text-center border-dashed border-slate-200 bg-slate-50/50 shadow-card">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 shadow-xs">
              <Compass size={24} />
            </div>
            <h4 className="mt-4 text-base font-black text-slate-800 tracking-tight">
              No Voice-of-Customer Reports Generated Yet
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Use the action panel above to generate your first executive brief summarizing customer sentiment, top themes, and action items.
            </p>
          </Card>
        )}
      </div>
    </AppShellClient>
  );
}
