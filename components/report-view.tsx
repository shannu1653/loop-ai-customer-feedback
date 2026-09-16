"use client";

import { Button, Card, Badge } from './ui';
import {
  ArrowLeft,
  Printer,
  FileText,
  CalendarDays,
  Sparkles,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  UserCheck,
  Building2,
  Clock,
  Radio,
} from 'lucide-react';
import Link from 'next/link';

export function ReportView({ report }: { report: any }) {
  const c = report.contentJson || {};
  const topThemes = c.topThemes || [];
  const quotes = c.quotes || [];
  const actions = c.actions || [];
  const totalFeedback = c.total || 0;
  const negativePct = c.negativePct ?? 0;
  const positivePct = c.positivePct ?? 0;
  const sentimentShift = c.sentimentShift;

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-16">
      {/* 1. Sticky Navigation Bar (Hidden during PDF print) */}
      <div className="no-print sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
        <Link
          href="/reports"
          className="group inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
          <span>Back to VoC Reports Library</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.print()}
            variant="primary"
            size="sm"
            className="bg-[#17152b] hover:bg-slate-800 text-white font-bold shadow-sm active:scale-[0.98]"
          >
            <Printer size={14} />
            <span>Save as PDF / Print</span>
          </Button>
        </div>
      </div>

      {/* 2. Executive Report Document Article */}
      <article className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 sm:pt-10 animate-fade-in">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-12 shadow-card print:border-0 print:shadow-none print:p-0">
          {/* Document Eyebrow & Brand */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-600/10 text-violet-700 border border-violet-200/60 font-black text-xs">
                L
              </span>
              <div>
                <div className="text-[10px] font-black tracking-widest text-violet-700 uppercase">
                  LOOP INTELLIGENCE
                </div>
                <div className="text-xs font-bold text-slate-800">Voice-of-Customer Brief</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck size={12} className="text-emerald-600" />
                Verified Database Synthesis
              </span>
            </div>
          </div>

          {/* Document Title & Period Metadata */}
          <div className="pt-6 pb-8 border-b border-slate-100">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              {report.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                <CalendarDays size={13} className="text-slate-500" />
                {new Date(report.periodStart).toLocaleDateString()} — {new Date(report.periodEnd).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                Generated on {new Date(report.createdAt).toLocaleDateString()}
              </span>
              {c.days && (
                <>
                  <span>•</span>
                  <span>{c.days}-Day Analysis Window</span>
                </>
              )}
            </div>
          </div>

          {/* 3. Report KPI Summary Cards */}
          <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4 border-b border-slate-100">
            {/* Total Feedback */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Feedback
              </div>
              <div className="mt-1.5 text-3xl font-black tracking-tight text-slate-900">
                {totalFeedback.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-500">
                Analyzed customer records
              </div>
            </div>

            {/* Negative Rate */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Negative Rate
                </span>
                {sentimentShift !== undefined && sentimentShift !== 0 && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-black ${
                      sentimentShift > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {sentimentShift > 0 ? (
                      <TrendingUp size={10} />
                    ) : (
                      <TrendingDown size={10} />
                    )}
                    {sentimentShift > 0 ? `+${sentimentShift}%` : `${sentimentShift}%`}
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-3xl font-black tracking-tight text-slate-900">
                {negativePct}%
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-500">
                {negativePct > 35 ? 'Attention recommended' : 'Healthy sentiment ratio'}
              </div>
            </div>

            {/* Positive Rate */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Positive Ratio
              </div>
              <div className="mt-1.5 text-3xl font-black tracking-tight text-slate-900">
                {positivePct}%
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-500">
                Praise & positive signals
              </div>
            </div>

            {/* Primary Driver */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Primary Theme
              </div>
              <div className="mt-1.5 text-lg font-black tracking-tight text-slate-900 truncate">
                {topThemes[0]?.name || 'Core Product'}
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-500">
                {topThemes[0]?.count ? `${topThemes[0].count} mentions` : 'General feedback'}
              </div>
            </div>
          </div>

          {/* 4. Executive Summary Narrative */}
          <div className="py-8 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-violet-700 mb-3">
              <Sparkles size={15} />
              <span>Executive Summary</span>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/60 via-slate-50/40 to-white p-6 shadow-xs">
              <p className="prose-loop whitespace-pre-wrap text-sm leading-7 text-slate-800 font-normal">
                {c.narrative}
              </p>
            </div>
          </div>

          {/* 5. Top Themes Ranked Grid */}
          <div className="py-8 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Top Themes & Recurring Topics
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Ranked by total historical feedback volume within the analysis window.
                </p>
              </div>
              <Badge tone="violet" variant="subtle">
                {topThemes.length} Drivers
              </Badge>
            </div>

            {topThemes.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-400">
                No themes identified in this reporting period.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {topThemes.map((t: any, idx: number) => {
                  const sharePct = totalFeedback > 0 ? Math.round((t.count / totalFeedback) * 100) : 0;
                  return (
                    <div
                      key={t.name || idx}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-700 shadow-xs">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{t.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">{t.count}</span>
                          <span className="text-[10px] font-semibold text-slate-400">({sharePct}%)</span>
                        </div>
                      </div>
                      <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-600 transition-all duration-500"
                          style={{ width: `${Math.max(t.count > 0 ? 6 : 0, sharePct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6. Representative Customer Quotes */}
          <div className="py-8 border-b border-slate-100">
            <div className="mb-4">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Representative Customer Quotes
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verbatim customer statements captured during the reporting period.
              </p>
            </div>

            {quotes.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-400">
                No customer quotes recorded in this reporting period.
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((q: string, i: number) => (
                  <blockquote
                    key={i}
                    className="relative rounded-2xl border-l-4 border-violet-500 bg-violet-50/50 p-4.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-800 italic"
                  >
                    &ldquo;{q}&rdquo;
                  </blockquote>
                ))}
              </div>
            )}
          </div>

          {/* 7. Recommended Actions & Next Steps */}
          <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#17152b] via-[#1f1b3d] to-[#121024] p-6 sm:p-8 text-white shadow-soft">
            <div className="flex items-center gap-2 text-violet-300 mb-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Strategic Recommendations
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white">
              Recommended Product & Operational Actions
            </h3>
            <p className="mt-1 text-xs text-white/60">
              Prioritized next steps derived from customer pain points and recurring feedback themes.
            </p>

            <div className="mt-6 space-y-3">
              {actions.map((a: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 rounded-2xl bg-white/[0.06] border border-white/10 p-4 text-xs font-medium leading-relaxed text-white/90"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/30 text-violet-300 text-[11px] font-black border border-violet-400/20">
                    0{i + 1}
                  </span>
                  <span className="pt-0.5">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
