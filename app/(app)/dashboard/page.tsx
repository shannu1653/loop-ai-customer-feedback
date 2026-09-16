import { AppShell } from '@/components/app-shell';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { Card, Badge } from '@/components/ui';
import {
  MessageSquare,
  ThumbsDown,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Inbox as InboxIcon,
  UploadCloud,
  FileText,
  Radio,
  Layers,
  LucideIcon,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardCharts } from '@/components/dashboard-charts';

export default async function Dashboard() {
  const u = await requireUser();

  const now = new Date();
  const [total, neg, newWeek, topThemes, totalThemes, channels, rows] = await Promise.all([
    db.feedback.count({ where: { workspaceId: u.workspaceId } }),
    db.feedback.count({ where: { workspaceId: u.workspaceId, sentiment: 'NEG' } }),
    db.feedback.count({
      where: {
        workspaceId: u.workspaceId,
        createdAt: { gte: new Date(Date.now() - 7 * 864e5) },
      },
    }),
    db.theme.findMany({
      where: { workspaceId: u.workspaceId },
      include: { _count: { select: { feedback: true } } },
      orderBy: { feedback: { _count: 'desc' } },
      take: 5,
    }),
    db.theme.count({ where: { workspaceId: u.workspaceId } }),
    db.feedback.groupBy({
      by: ['channel'],
      where: { workspaceId: u.workspaceId },
      _count: { channel: true },
      orderBy: { _count: { channel: 'desc' } },
    }),
    db.feedback.findMany({
      where: { workspaceId: u.workspaceId },
      select: { createdAt: true, sentiment: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const negativePct = total ? Math.round((neg / total) * 100) : 0;

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - (13 - i)
      )
    );
    const key = d.toISOString().slice(0, 10);
    const r = rows.filter(
      (x) => new Date(x.createdAt).toISOString().slice(0, 10) === key
    );
    return { date: key.slice(5), total: r.length };
  });

  const pos = rows.filter((x) => x.sentiment === 'POS').length;
  const neu = rows.filter((x) => x.sentiment === 'NEU').length;
  const initialAnalytics = {
    volume: days,
    sentiment: [
      { name: 'Positive', value: pos },
      { name: 'Neutral', value: neu },
      { name: 'Negative', value: neg },
    ],
    themes: topThemes.map((t) => ({
      name: t.name,
      value: t._count.feedback,
    })),
  };

  return (
    <AppShell title="Overview" subtitle={`Workspace: ${u.workspaceName}`}>
      {/* 0. Contextual Header Banner & Quick Actions */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs lg:flex-row lg:items-center">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600/10 text-violet-600 border border-violet-200/60">
            <Radio size={19} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-violet-700 uppercase bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                Customer Intelligence
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live Feed
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Aggregated telemetry and clustered topics for{' '}
              <strong className="font-bold text-slate-800">{u.workspaceName}</strong> across the last 14 days.
            </p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <Link
            href="/inbox/ingest"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
          >
            <UploadCloud size={14} className="text-violet-600" />
            <span>Ingest Feedback</span>
          </Link>
          <Link
            href="/ask"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
          >
            <Sparkles size={14} className="text-violet-600" />
            <span>Ask AI</span>
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#17152b] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <FileText size={14} className="text-violet-300" />
            <span>VoC Briefs</span>
          </Link>
        </div>
      </div>

      {/* 1. Stat KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={MessageSquare}
          label="Total feedback"
          value={total.toLocaleString()}
          hint="Centralized across all channels"
          pill="Live Telemetry"
          tone="violet"
          animDelay="animate-delay-1"
        />
        <Stat
          icon={ThumbsDown}
          label="Negative rate"
          value={`${negativePct}%`}
          hint={negativePct > 35 ? 'Attention recommended (>35%)' : 'Healthy sentiment ratio (≤35%)'}
          pill={negativePct > 35 ? 'Action Required' : 'Healthy'}
          tone={negativePct > 35 ? 'red' : 'emerald'}
          animDelay="animate-delay-2"
        />
        <Stat
          icon={TrendingUp}
          label="New this week"
          value={newWeek.toLocaleString()}
          hint="Recent 7-day ingestion volume"
          pill="7-Day Velocity"
          tone="emerald"
          animDelay="animate-delay-3"
        />
        <Stat
          icon={Layers}
          label="Active themes"
          value={totalThemes.toLocaleString()}
          hint="AI-clustered feedback topics"
          pill="Topic Clusters"
          tone="violet"
          animDelay="animate-delay-4"
        />
      </div>

      {/* 2. Pulse & Channels Grid */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Feedback Pulse Card */}
        <Card className="flex flex-col justify-between hover:border-slate-300/80 transition-all duration-200 shadow-card">
          <div>
            <div className="flex items-center justify-between pb-1">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Feedback pulse</h2>
                  <Badge tone="violet" variant="subtle">Top Topics</Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Top recurring topics driving customer conversations.
                </p>
              </div>
              <Link
                href="/trends"
                className="group inline-flex items-center gap-1 rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100 border border-violet-100/80"
              >
                <span>View trends</span>
                <ArrowUpRight size={13} className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {topThemes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-400">
                    <Compass size={20} />
                  </div>
                  <p className="mt-2.5 text-xs font-bold text-slate-700">No themes identified yet</p>
                  <p className="mt-0.5 text-[11px] text-slate-400 max-w-xs">
                    Ingest customer feedback via the inbox or ingest tool to generate AI topic clusters.
                  </p>
                  <Link
                    href="/inbox/ingest"
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-violet-700 border border-slate-200 shadow-xs hover:bg-slate-50"
                  >
                    <UploadCloud size={13} /> Ingest data now
                  </Link>
                </div>
              ) : (
                topThemes.map((t, index) => {
                  const count = t._count.feedback;
                  const percentage = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;
                  return (
                    <div
                      key={t.id}
                      className="group rounded-xl p-2.5 -mx-2.5 transition hover:bg-slate-50/90"
                    >
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-black text-slate-600">
                            #{index + 1}
                          </span>
                          <span className="font-bold text-slate-800 truncate group-hover:text-violet-700 transition-colors">
                            {t.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-slate-900">{count}</span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                          style={{ width: `${Math.max(count > 0 ? 6 : 0, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Showing top {topThemes.length} of {totalThemes} themes</span>
            <Link href="/trends" className="font-semibold text-violet-700 hover:text-violet-900 transition-colors">
              Explore all themes →
            </Link>
          </div>
        </Card>

        {/* Channel Distribution Card */}
        <Card className="flex flex-col justify-between hover:border-slate-300/80 transition-all duration-200 shadow-card">
          <div>
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Channel distribution</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Where customer voice enters LOOP.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/60">
                {channels.length} Sources
              </span>
            </div>

            <div className="mt-6 space-y-2.5">
              {channels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-400">
                    <InboxIcon size={20} />
                  </div>
                  <p className="mt-2.5 text-xs font-bold text-slate-700">No channel data available</p>
                  <p className="mt-0.5 text-[11px] text-slate-400 max-w-xs">
                    Feedback channels (e.g. Zendesk, Intercom, Email, Web) will be listed here.
                  </p>
                </div>
              ) : (
                channels.map((c) => {
                  const count = c._count.channel;
                  const sharePct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div
                      key={c.channel}
                      className="group rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:bg-slate-100/80 hover:border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-violet-500" />
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                            {c.channel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{count}</span>
                          <span className="text-[10px] font-semibold text-slate-400">({sharePct}%)</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-600/80 transition-all duration-500"
                          style={{ width: `${Math.max(count > 0 ? 4 : 0, sharePct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link
            href="/inbox"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
          >
            <InboxIcon size={14} className="text-slate-500" /> Open inbox to triage records
          </Link>
        </Card>
      </div>

      {/* 3. Recharts Analytics */}
      <DashboardCharts initialData={initialAnalytics} />

      {/* 4. AI Grounded Action Banner */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#17152b] via-[#1e1b38] to-[#121024] p-6 text-white shadow-soft">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-violet-300">
              <Sparkles size={16} className="animate-pulse text-violet-400" />
              <span className="text-[10px] font-black tracking-widest uppercase">Grounded AI Intelligence</span>
            </div>
            <h2 className="mt-2 text-xl font-black tracking-tight">Turn feedback into verified product action.</h2>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-white/60 leading-relaxed">
              Query your customer voice with citations backed strictly by retrieved verbatim quotes, or generate an executive Voice-of-Customer brief for stakeholders.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/ask"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-violet-500 shadow-sm active:scale-[0.98]"
            >
              <Sparkles size={14} /> Ask LOOP
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              <FileText size={14} /> Generate VoC report
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  pill,
  tone,
  animDelay = 'animate-delay-1',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  pill?: string;
  tone: 'violet' | 'emerald' | 'red';
  animDelay?: string;
}) {
  const badgeClasses = {
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const iconClasses = {
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <Card className={`flex flex-col justify-between hover:border-slate-300/80 hover:shadow-card-hover transition-all duration-200 animate-slide-up ${animDelay}`}>
      <div>
        <div className="flex items-start justify-between">
          <div className={`grid h-10 w-10 place-items-center rounded-xl border ${iconClasses[tone]} shadow-xs`}>
            <Icon size={18} />
          </div>
          {pill && (
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeClasses[tone]}`}>
              {pill}
            </span>
          )}
        </div>
        <div className="mt-4 text-3xl font-black tracking-tight text-slate-900">{value}</div>
        <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      </div>
      <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-400">
        {hint}
      </div>
    </Card>
  );
}
