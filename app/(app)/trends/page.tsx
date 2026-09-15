"use client";

import { useEffect, useState, useCallback } from 'react';
import { AppShellClient } from '@/components/client-shell';
import { Card, Badge, Button } from '@/components/ui';
import { TrendingUp, ArrowUpRight, AlertTriangle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
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

export default function Trends() {
  const [d, setD] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (error && !d) {
    return (
      <AppShellClient
        title="Themes & Trends"
        subtitle="Understand recurring customer voice patterns and emerging topic spikes"
      >
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle size={24} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">Trends Data Unavailable</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">{error}</p>
          <Button
            onClick={loadData}
            className="mt-5 border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Retry loading
          </Button>
        </Card>
      </AppShellClient>
    );
  }

  if (loading || !d) {
    return (
      <AppShellClient title="Themes & Trends" subtitle="Loading customer voice clusters...">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <Card className="h-96 animate-pulse bg-slate-100/70">{null}</Card>
          <Card className="h-96 animate-pulse bg-slate-100/70">{null}</Card>
        </div>
      </AppShellClient>
    );
  }

  const topThemes = d.topThemes || [];
  const timeline = d.timeline || [];

  return (
    <AppShellClient
      title="Themes & Trends"
      subtitle="Understand recurring customer voice patterns and emerging topic spikes"
    >
      {/* Charts Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        {/* Weekly Trend Line */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-800">Weekly Feedback Trajectory</h2>
              <p className="text-xs text-slate-500">
                Aggregated customer feedback volume over the last 8 weeks.
              </p>
            </div>
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700">
              8-Week View
            </span>
          </div>

          <div className="mt-6 h-80">
            {timeline.length === 0 ? (
              <div className="grid h-full place-items-center text-xs text-slate-400">
                No historical feedback timeline available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeline}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17152b',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Feedback items"
                    stroke="#6d5dfc"
                    strokeWidth={3}
                    dot={{ fill: '#6d5dfc', r: 4 }}
                    activeDot={{ r: 6, fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Top Themes Horizontal Bar Chart */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-800">Top Themes Ranked</h2>
              <p className="text-xs text-slate-500">Ranked by total historical feedback count.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              Clustered
            </span>
          </div>

          <div className="mt-6 h-80">
            {topThemes.length === 0 ? (
              <div className="grid h-full place-items-center text-xs text-slate-400">
                No themes identified yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topThemes.slice(0, 7)}
                  layout="vertical"
                  margin={{ top: 0, left: 20, right: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17152b',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Total Feedback" fill="#6d5dfc" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Theme Cards Drill-Down Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Topic Drill-Down & Spike Detection</h3>
            <p className="text-xs text-slate-500">
              Click any theme card to drill down and triage related feedback in the Inbox.
            </p>
          </div>
          <span className="text-xs font-bold text-violet-700">
            {topThemes.length} active {topThemes.length === 1 ? 'theme' : 'themes'}
          </span>
        </div>

        {topThemes.length === 0 ? (
          <Card className="py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Layers size={22} />
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-800">No Themes Clustered Yet</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Ingest feedback via the Inbox or CSV importer to let AI cluster customer topics automatically.
            </p>
            <Link
              href="/inbox/ingest"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-500 shadow-sm"
            >
              Add feedback
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topThemes.map((t) => {
              const hasSpike = t.spike > 15;
              const isNegativeAlert = t.negPct > 40;

              return (
                <Link
                  key={t.id}
                  href={`/inbox?theme=${encodeURIComponent(t.name)}`}
                  className="block group"
                >
                  <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                          <TrendingUp size={18} />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {isNegativeAlert && (
                            <Badge tone="red">
                              <span className="flex items-center gap-1">
                                <AlertTriangle size={11} /> {t.negPct}% neg
                              </span>
                            </Badge>
                          )}
                          <Badge tone={hasSpike ? 'red' : 'green'}>
                            {t.spike > 0 ? `+${t.spike}% spike` : `${t.spike}%`}
                          </Badge>
                        </div>
                      </div>

                      <h4 className="mt-4 font-black text-slate-900 group-hover:text-violet-700 transition">
                        {t.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-slate-900">{t.count}</span>
                        <span className="text-xs text-slate-400 ml-1.5 font-medium">total items</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 opacity-0 group-hover:opacity-100 transition">
                        Drill down <ArrowUpRight size={14} />
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

