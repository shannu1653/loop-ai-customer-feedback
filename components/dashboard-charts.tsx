"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, Badge } from './ui';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AlertCircle, RefreshCw, Activity, PieChart as PieIcon, BarChart3, Inbox } from 'lucide-react';

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#10b981',
  Neutral: '#64748b',
  Negative: '#f43f5e',
};

const SENTIMENT_BG_COLORS: Record<string, string> = {
  Positive: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
  Neutral: 'bg-slate-100 text-slate-700 border-slate-200/60',
  Negative: 'bg-rose-50 text-rose-700 border-rose-100/80',
};

export interface AnalyticsVolumeItem {
  date: string;
  total: number;
}

export interface AnalyticsSentimentItem {
  name: string;
  value: number;
}

export interface AnalyticsThemeItem {
  name: string;
  value: number;
}

export interface AnalyticsData {
  volume: AnalyticsVolumeItem[];
  sentiment: AnalyticsSentimentItem[];
  themes: AnalyticsThemeItem[];
  error?: string;
}

function VolumeTooltip({ active, payload, label }: any) {
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

function SentimentTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl border border-white/10 bg-[#17152b] px-3.5 py-2.5 shadow-xl backdrop-blur-md animate-fade-in">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: SENTIMENT_COLORS[data.name] || '#6d5dfc' }}
          />
          <span className="text-xs font-bold text-white">{data.name}</span>
        </div>
        <div className="mt-1 text-sm font-black text-white">
          {data.value} <span className="text-xs font-normal text-white/60">records</span>
        </div>
      </div>
    );
  }
  return null;
}

function ThemeTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const value = payload[0].value ?? 0;
    return (
      <div className="rounded-xl border border-white/10 bg-[#17152b] px-3.5 py-2.5 shadow-xl backdrop-blur-md animate-fade-in">
        <div className="text-[11px] font-semibold text-white/50">{label}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-400" />
          <span className="text-sm font-black text-white">
            {value} <span className="text-xs font-normal text-white/60">{value === 1 ? 'mention' : 'mentions'}</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function DashboardCharts({ initialData }: { initialData?: AnalyticsData }) {
  const [d, setD] = useState<AnalyticsData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/analytics')
      .then(async (r) => {
        const res = await r.json();
        if (!r.ok || res.error) {
          throw new Error(res.error || `HTTP ${r.status}`);
        }
        setD(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchData();
    }
  }, [initialData, fetchData]);

  if (error && !d) {
    return (
      <div className="mt-6">
        <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed border-rose-200 bg-rose-50/30">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs">
            <AlertCircle size={22} />
          </div>
          <h3 className="mt-3.5 text-sm font-bold text-slate-800">Analytics temporarily unavailable</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            We encountered a problem loading real-time charts. Please verify your connection or retry.
          </p>
          <button
            onClick={fetchData}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 border border-slate-200 active:scale-[0.98]"
          >
            <RefreshCw size={13} className="text-slate-500" /> Retry loading analytics
          </button>
        </Card>
      </div>
    );
  }

  if (loading && !d) {
    return (
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 animate-pulse rounded-md bg-slate-200/70" />
                  <div className="h-3 w-44 animate-pulse rounded-md bg-slate-100" />
                </div>
                <div className="h-5 w-14 animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="mt-6 h-60 animate-pulse rounded-xl bg-slate-50 border border-slate-100" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const sentimentData = d?.sentiment ?? [];
  const sentimentTotal = sentimentData.reduce((acc, item) => acc + (item.value || 0), 0);
  const volumeData = d?.volume ?? [];
  const themesData = d?.themes ?? [];

  const total14DayVolume = volumeData.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-3">
      {/* 1. Feedback Volume Over Time */}
      <Card className="flex flex-col justify-between hover:border-slate-300/80 transition-all duration-200 shadow-card">
        <div>
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-50 text-violet-700 border border-violet-100">
                <Activity size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Feedback volume</h3>
                <p className="text-[11px] font-medium text-slate-500">14-day ingestion timeline</p>
              </div>
            </div>
            <Badge tone="violet" variant="subtle">
              {total14DayVolume} Total
            </Badge>
          </div>

          <div className="mt-4 h-64 w-full">
            {total14DayVolume === 0 && volumeData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Inbox size={24} className="text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-500">No volume activity recorded</p>
                <p className="text-[11px] text-slate-400">Ingest feedback to observe trendline</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6d5dfc" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#6d5dfc" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip content={<VolumeTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Feedback"
                    stroke="#6d5dfc"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#volumeGrad)"
                    activeDot={{ r: 5, fill: '#6d5dfc', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>Telemetry window: 14 Days</span>
          <span className="text-slate-600 font-semibold">Live aggregation</span>
        </div>
      </Card>

      {/* 2. Sentiment Breakdown */}
      <Card className="flex flex-col justify-between hover:border-slate-300/80 transition-all duration-200 shadow-card">
        <div>
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <PieIcon size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Sentiment breakdown</h3>
                <p className="text-[11px] font-medium text-slate-500">Distribution across items</p>
              </div>
            </div>
            <Badge tone="green" variant="subtle">
              Classified
            </Badge>
          </div>

          <div className="mt-4 h-48 w-full">
            {sentimentTotal === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Inbox size={24} className="text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-500">No sentiment categorized</p>
                <p className="text-[11px] text-slate-400">Incoming records will appear here</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={74}
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {sentimentData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SENTIMENT_COLORS[entry.name] || '#6d5dfc'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<SentimentTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sentiment Legend Bar */}
        <div className="mt-2 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {sentimentData.map((item) => {
              const pct = sentimentTotal > 0 ? Math.round((item.value / sentimentTotal) * 100) : 0;
              const badgeCls = SENTIMENT_BG_COLORS[item.name] || 'bg-slate-100 text-slate-700';
              return (
                <div
                  key={item.name}
                  className={`rounded-xl border p-2 text-left transition ${badgeCls}`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {item.name}
                  </div>
                  <div className="mt-0.5 flex items-baseline justify-between">
                    <span className="text-xs font-black">{item.value}</span>
                    <span className="text-[10px] font-semibold opacity-75">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 3. Top Themes Volume */}
      <Card className="flex flex-col justify-between hover:border-slate-300/80 transition-all duration-200 shadow-card">
        <div>
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-50 text-violet-700 border border-violet-100">
                <BarChart3 size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Top themes</h3>
                <p className="text-[11px] font-medium text-slate-500">Highest volume topics</p>
              </div>
            </div>
            <Badge tone="violet" variant="subtle">
              {themesData.length} Clustered
            </Badge>
          </div>

          <div className="mt-4 h-64 w-full">
            {themesData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Inbox size={24} className="text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-500">No themes clustered yet</p>
                <p className="text-[11px] text-slate-400">Themes generate automatically as data arrives</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={themesData}
                  margin={{ top: 12, right: 12, left: -24, bottom: 28 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    angle={-22}
                    textAnchor="end"
                    interval={0}
                    height={40}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip content={<ThemeTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Feedback count"
                    fill="#6d5dfc"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>AI-generated topic clusters</span>
          <span className="text-slate-600 font-semibold">Sorted by volume</span>
        </div>
      </Card>
    </div>
  );
}
