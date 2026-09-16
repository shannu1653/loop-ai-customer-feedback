"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { AppShellClient } from '@/components/client-shell';
import { Card, Badge, Button } from '@/components/ui';
import {
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles,
  Zap,
  Radio,
  FileText,
  Search,
  X,
  Compass,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export interface TrendTheme {
  id: string;
  name: string;
  description: string;
  count: number;
  recentCount: number;
  priorCount: number;
  spike: number;
  negPct: number;
}

export interface TimelineWeek {
  label: string;
  total: number;
}

export interface TrendsData {
  topThemes: TrendTheme[];
  timeline: TimelineWeek[];
  error?: string;
}

function TrajectoryTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const value = payload[0].value ?? 0;
    return (
      <div className="rounded-xl border border-white/10 bg-[#17152b] px-3.5 py-2.5 shadow-xl backdrop-blur-md animate-fade-in">
        <div className="text-[11px] font-semibold text-white/50">{label}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-400" />
          <span className="text-sm font-black text-white">
            {value} <span className="text-xs font-normal text-white/60">{value === 1 ? 'item' : 'feedback items'}</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
}

function ThemeRankTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-white/10 bg-[#17152b] px-3.5 py-2.5 shadow-xl backdrop-blur-md animate-fade-in max-w-xs">
        <div className="text-xs font-bold text-white truncate">{data.name}</div>
        <div className="mt-1.5 flex items-center gap-3 text-[11px]">
          <span className="text-violet-300 font-bold">{data.count} total items</span>
          <span className="text-white/50">•</span>
          <span className={data.negPct > 40 ? 'text-rose-300 font-bold' : 'text-slate-300'}>
            {data.negPct}% negative
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export default function Trends() {
  const [d, setD] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/themes/trends')
      .then(async (r) => {
        const res = await r.json();
        if (!r.ok || res.error) {
          throw new Error(res.error || `HTTP ${r.status}`);
        }
        setD(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load theme trends');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const topThemes = useMemo(() => d?.topThemes || [], [d]);
  const timeline = useMemo(() => d?.timeline || [], [d]);

  // Filtered themes for search
  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return topThemes;
    const q = searchQuery.toLowerCase();
    return topThemes.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [topThemes, searchQuery]);

  // Derived Summary Metrics
  const totalSignals = useMemo(() => {
    return topThemes.reduce((acc, t) => acc + t.count, 0);
  }, [topThemes]);

  const spikingThemesCount = useMemo(() => {
    return topThemes.filter((t) => t.spike > 15).length;
  }, [topThemes]);

  const negativeThemesCount = useMemo(() => {
    return topThemes.filter((t) => t.negPct > 40).length;
  }, [topThemes]);

  if (error && !d) {
    return (
      <AppShellClient
        title="Themes & Trends"
        subtitle="Understand recurring customer voice patterns and emerging topic spikes"
      >
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-rose-200 bg-rose-50/30">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
            <AlertCircle size={24} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">Trends Data Unavailable</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">{error}</p>
          <Button
            onClick={loadData}
            variant="secondary"
            size="sm"
            className="mt-5 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw size={14} className="text-slate-500" /> Retry loading analytics
          </Button>
        </Card>
      </AppShellClient>
    );
  }

  if (loading || !d) {
    return (
      <AppShellClient title="Themes & Trends" subtitle="Loading customer voice clusters...">
        {/* KPI Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="mt-4 h-7 w-20 animate-pulse rounded bg-slate-200/70" />
              <div className="mt-2 h-4 w-28 animate-pulse rounded bg-slate-100" />
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <Card className="h-96 p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-44 animate-pulse rounded-md bg-slate-200/70" />
                <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="mt-6 h-72 animate-pulse rounded-2xl bg-slate-50 border border-slate-100" />
          </Card>
          <Card className="h-96 p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-40 animate-pulse rounded-md bg-slate-200/70" />
                <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="mt-6 h-72 animate-pulse rounded-2xl bg-slate-50 border border-slate-100" />
          </Card>
        </div>
      </AppShellClient>
    );
  }

  return (
    <AppShellClient
      title="Themes & Trends"
      subtitle="Understand recurring customer voice patterns and emerging topic spikes"
    >
      {/* 0. Context Header Strip */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs lg:flex-row lg:items-center">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600/10 text-violet-600 border border-violet-200/60 shadow-xs">
            <Radio size={19} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-violet-700 uppercase bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                Customer Intelligence
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Topic Clusters
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              AI-generated semantic topic clusters, 8-week volume trajectories, and automated 14-day velocity spike detection.
            </p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-violet-600' : 'text-slate-500'} />
            <span>Refresh Analytics</span>
          </Button>
          <Link
            href="/ask"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#17152b] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Sparkles size={14} className="text-violet-300" />
            <span>Ask AI About Trends</span>
          </Link>
        </div>
      </div>

      {/* 1. Analytics KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {/* Total Themes */}
        <Card className="flex flex-col justify-between hover:border-slate-300/80 hover:shadow-card-hover transition-all duration-200 animate-slide-up animate-delay-1 shadow-card">
          <div>
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl border bg-violet-50 text-violet-700 border-violet-100 shadow-xs">
                <Layers size={18} />
              </div>
              <Badge tone="violet" variant="subtle">Clustered</Badge>
            </div>
            <div className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              {topThemes.length}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Topic Clusters
            </div>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-400">
            Automated semantic clusters
          </div>
        </Card>

        {/* Total Signals */}
        <Card className="flex flex-col justify-between hover:border-slate-300/80 hover:shadow-card-hover transition-all duration-200 animate-slide-up animate-delay-2 shadow-card">
          <div>
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl border bg-violet-50 text-violet-700 border-violet-100 shadow-xs">
                <BarChart3 size={18} />
              </div>
              <Badge tone="violet" variant="subtle">All-Time</Badge>
            </div>
            <div className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              {totalSignals.toLocaleString()}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              Categorized Signals
            </div>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-400">
            Assigned across all active themes
          </div>
        </Card>

        {/* Spiking Themes */}
        <Card className="flex flex-col justify-between hover:border-slate-300/80 hover:shadow-card-hover transition-all duration-200 animate-slide-up animate-delay-3 shadow-card">
          <div>
            <div className="flex items-start justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-xl border shadow-xs ${
                spikingThemesCount > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                <Flame size={18} />
              </div>
              <Badge tone={spikingThemesCount > 0 ? 'red' : 'green'} variant="subtle">
                {spikingThemesCount > 0 ? 'Surging' : 'Stable'}
              </Badge>
            </div>
            <div className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              {spikingThemesCount}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              Surging Velocity Spikes
            </div>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-400">
            {spikingThemesCount > 0 ? 'Topics surging >15% in last 14d' : 'No abnormal velocity surges'}
          </div>
        </Card>

        {/* Critical Negative Themes */}
        <Card className="flex flex-col justify-between hover:border-slate-300/80 hover:shadow-card-hover transition-all duration-200 animate-slide-up animate-delay-4 shadow-card">
          <div>
            <div className="flex items-start justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-xl border shadow-xs ${
                negativeThemesCount > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                <ShieldAlert size={18} />
              </div>
              <Badge tone={negativeThemesCount > 0 ? 'red' : 'green'} variant="subtle">
                {negativeThemesCount > 0 ? 'Action Req' : 'Healthy'}
              </Badge>
            </div>
            <div className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              {negativeThemesCount}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              Elevated Negative Topics
            </div>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-400">
            {negativeThemesCount > 0 ? 'Topics with >40% negative sentiment' : 'All topics within healthy ratio'}
          </div>
        </Card>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        {/* Weekly Feedback Trajectory Area Chart */}
        <Card className="flex flex-col justify-between hover:border-slate-300/80 transition-all duration-200 shadow-card">
          <div>
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Weekly Feedback Trajectory
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Aggregated customer feedback volume over the last 8 weeks.
                </p>
              </div>
              <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 border border-violet-100">
                8-Week View
              </span>
            </div>

            <div className="mt-5 h-80 w-full">
              {timeline.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Compass size={24} className="text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-500">No historical feedback timeline available</p>
                  <p className="text-[11px] text-slate-400">Ingest feedback to observe long-term trends</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeline}
                    margin={{ top: 12, right: 12, left: -24, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="trajGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6d5dfc" stopOpacity={0.24} />
                        <stop offset="100%" stopColor="#6d5dfc" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    />
                    <Tooltip content={<TrajectoryTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Feedback items"
                      stroke="#6d5dfc"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#trajGrad)"
                      activeDot={{ r: 5, fill: '#6d5dfc', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-2 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Aggregated 8-week telemetry window</span>
            <span className="text-slate-600 font-semibold">Weekly intervals</span>
          </div>
        </Card>

        {/* Top Themes Horizontal Bar Chart */}
        <Card className="flex flex-col justify-between hover:border-slate-300/80 transition-all duration-200 shadow-card">
          <div>
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Top Themes Ranked
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Ranked by total historical feedback volume.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/60">
                Top {Math.min(7, topThemes.length)}
              </span>
            </div>

            <div className="mt-5 h-80 w-full">
              {topThemes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Compass size={24} className="text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-500">No themes clustered yet</p>
                  <p className="text-[11px] text-slate-400">Themes generate automatically as data arrives</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topThemes.slice(0, 7)}
                    layout="vertical"
                    margin={{ top: 0, left: 10, right: 15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip content={<ThemeRankTooltip />} />
                    <Bar
                      dataKey="count"
                      name="Total Feedback"
                      fill="#6d5dfc"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-2 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Historical volume ranking</span>
            <span className="text-slate-600 font-semibold">Live ranking</span>
          </div>
        </Card>
      </div>

      {/* 3. Theme Cards Drill-Down & Spike Detection Grid */}
      <div className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Topic Drill-Down & Spike Detection
              </h3>
              <Badge tone="violet" variant="subtle">
                {topThemes.length} Active {topThemes.length === 1 ? 'Topic' : 'Topics'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Click any topic card to immediately triage and filter related verbatim quotes in the Inbox.
            </p>
          </div>

          {/* Quick Search Filter */}
          {topThemes.length > 0 && (
            <div className="relative flex items-center w-full sm:w-64">
              <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter topics..."
                className="w-full rounded-xl border border-slate-200/90 bg-white pl-8.5 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 shadow-xs outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 rounded-full p-1 text-slate-400 hover:text-slate-600 transition"
                  title="Clear topic filter"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {topThemes.length === 0 ? (
          <Card className="py-14 text-center border-dashed border-slate-200 bg-slate-50/50 shadow-card">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 shadow-xs">
              <Layers size={24} />
            </div>
            <h4 className="mt-4 text-base font-black text-slate-800 tracking-tight">
              No Themes Clustered Yet
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Ingest customer feedback via the Inbox or CSV importer to enable AI clustering and automated topic trend detection.
            </p>
            <Link
              href="/inbox/ingest"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-500 shadow-sm active:scale-[0.98]"
            >
              <Sparkles size={14} /> Ingest Feedback
            </Link>
          </Card>
        ) : filteredThemes.length === 0 ? (
          <Card className="py-10 text-center border-dashed border-slate-200 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-700">No topics match &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-bold text-violet-700 hover:text-violet-900"
            >
              Clear search filter
            </button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredThemes.map((t, index) => {
              const hasSpike = t.spike > 15;
              const hasVelocity = t.spike > 0;
              const isNegativeAlert = t.negPct > 40;

              return (
                <Link
                  key={t.id}
                  href={`/inbox?theme=${encodeURIComponent(t.name)}`}
                  className="block group"
                >
                  <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-card-hover flex flex-col justify-between p-5 border-slate-200/80 shadow-card">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-600">
                            #{index + 1}
                          </span>
                          <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-50 text-violet-700 border border-violet-100">
                            <TrendingUp size={15} />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {isNegativeAlert && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              <AlertTriangle size={10} />
                              <span>{t.negPct}% Neg</span>
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              hasSpike
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : hasVelocity
                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {hasSpike && <Zap size={10} className="text-rose-600" />}
                            {t.spike > 0 ? `+${t.spike}% surge` : `${t.spike}% stable`}
                          </span>
                        </div>
                      </div>

                      <h4 className="mt-4 text-sm font-black text-slate-900 group-hover:text-violet-700 transition-colors">
                        {t.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{t.count}</span>
                          <span className="text-[11px] text-slate-400 font-semibold">signals</span>
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">
                          {t.recentCount} in last 14 days
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-xs">
                        <span>Triage</span>
                        <ArrowUpRight size={13} className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShellClient>
  );
}
