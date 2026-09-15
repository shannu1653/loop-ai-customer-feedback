import { AppShell } from '@/components/app-shell';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { Card } from '@/components/ui';
import { MessageSquare, ThumbsDown, Plus, TrendingUp, Sparkles, ArrowUpRight, Inbox as InboxIcon, LucideIcon } from 'lucide-react';
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
      {/* 1. Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={MessageSquare}
          label="Total feedback"
          value={total.toLocaleString()}
          hint="Centralized across all channels"
          tone="violet"
        />
        <Stat
          icon={ThumbsDown}
          label="Negative rate"
          value={`${negativePct}%`}
          hint={negativePct > 35 ? 'Attention recommended' : 'Within normal range'}
          tone={negativePct > 35 ? 'red' : 'emerald'}
        />
        <Stat
          icon={Plus}
          label="New this week"
          value={newWeek.toLocaleString()}
          hint="Recent 7-day arrivals"
          tone="emerald"
        />
        <Stat
          icon={TrendingUp}
          label="Active themes"
          value={totalThemes.toLocaleString()}
          hint="AI-clustered feedback topics"
          tone="violet"
        />
      </div>

      {/* 2. Pulse & Channels */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-800">Feedback pulse</h2>
              <p className="text-xs text-slate-500">
                Top recurring topics driving customer conversations.
              </p>
            </div>
            <Link
              href="/trends"
              className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900"
            >
              View trends <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="mt-7 space-y-4">
            {topThemes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No themes identified yet. Ingest feedback to start clustering.
              </div>
            ) : (
              topThemes.map((t) => {
                const count = t._count.feedback;
                const percentage = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;
                return (
                  <div key={t.id}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-semibold text-slate-800">{t.name}</span>
                      <span className="text-xs font-semibold text-slate-400">
                        {count} items ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-600 transition-all duration-500"
                        style={{ width: `${Math.max(count > 0 ? 8 : 0, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-800">Channel distribution</h2>
                <p className="text-xs text-slate-500">Where customer voice enters LOOP.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {channels.length} Sources
              </span>
            </div>

            <div className="mt-6 space-y-2.5">
              {channels.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No channel data available yet.
                </div>
              ) : (
                channels.map((c) => {
                  const count = c._count.channel;
                  return (
                    <div
                      key={c.channel}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 transition hover:bg-slate-100/80"
                    >
                      <span className="text-xs font-semibold text-slate-700">{c.channel}</span>
                      <span className="text-xs font-black text-slate-900">{count}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link
            href="/inbox"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <InboxIcon size={14} /> Open inbox to triage
          </Link>
        </Card>
      </div>

      {/* 3. Recharts Analytics */}
      <DashboardCharts initialData={initialAnalytics} />

      {/* 4. AI Insight Banner */}
      <div className="mt-6 rounded-2xl bg-[#17152b] p-6 text-white shadow-soft">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-violet-300">
              <Sparkles size={16} />
              <span className="text-xs font-black tracking-widest uppercase">Grounded AI</span>
            </div>
            <h2 className="mt-2 text-xl font-black">Turn feedback into verified product action.</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/60">
              Ask questions backed strictly by your retrieved customer quotes, or generate an executive Voice-of-Customer brief.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/ask"
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 shadow-sm"
            >
              Ask LOOP
            </Link>
            <Link
              href="/reports"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Generate report
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
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: 'violet' | 'emerald' | 'red';
}) {
  const badgeClasses = {
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-rose-50 text-rose-700',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
          <Icon size={18} />
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClasses[tone]}`}>
          Live
        </span>
      </div>
      <div className="mt-4 text-3xl font-black tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-bold text-slate-700">{label}</div>
      <div className="mt-0.5 text-xs text-slate-400">{hint}</div>
    </Card>
  );
}

