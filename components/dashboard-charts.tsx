"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AlertCircle, RefreshCw } from 'lucide-react';

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#10b981',
  Neutral: '#64748b',
  Negative: '#f43f5e',
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
        <Card className="flex flex-col items-center justify-center py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600">
            <AlertCircle size={24} />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-800">Analytics unavailable</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3.5 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
          >
            <RefreshCw size={13} /> Retry loading
          </button>
        </Card>
      </div>
    );
  }

  if (loading && !d) {
    return (
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="h-6 w-36 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="mt-5 h-64 animate-pulse rounded-xl bg-slate-50" />
        </Card>
        <Card>
          <div className="h-6 w-36 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="mt-5 h-64 animate-pulse rounded-xl bg-slate-50" />
        </Card>
        <Card>
          <div className="h-6 w-36 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="mt-5 h-64 animate-pulse rounded-xl bg-slate-50" />
        </Card>
      </div>
    );
  }

  const sentimentData = d?.sentiment ?? [];
  const sentimentTotal = sentimentData.reduce((acc, item) => acc + (item.value || 0), 0);
  const volumeData = d?.volume ?? [];
  const themesData = d?.themes ?? [];

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-3">
      {/* 1. Volume Over Time */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-800">Feedback volume</h3>
            <p className="text-xs text-slate-500">Daily arrivals across the last 14 days</p>
          </div>
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700">
            Trend
          </span>
        </div>
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
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
                name="Feedback"
                stroke="#6d5dfc"
                strokeWidth={3}
                dot={{ fill: '#6d5dfc', r: 3 }}
                activeDot={{ r: 5, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Sentiment Breakdown */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-800">Sentiment breakdown</h3>
            <p className="text-xs text-slate-500">
              {sentimentTotal} total categorized customer records
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
            Realtime
          </span>
        </div>
        <div className="mt-5 h-64">
          {sentimentTotal === 0 ? (
            <div className="grid h-full place-items-center text-xs text-slate-400">
              No feedback recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {sentimentData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={SENTIMENT_COLORS[entry.name] || '#6d5dfc'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17152b',
                    color: '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(val) => <span className="text-xs font-semibold text-slate-600">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* 3. Top Themes */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-800">Top themes</h3>
            <p className="text-xs text-slate-500">Highest volume clustered topics</p>
          </div>
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700">
            Volume
          </span>
        </div>
        <div className="mt-5 h-64">
          {themesData.length === 0 ? (
            <div className="grid h-full place-items-center text-xs text-slate-400">
              No themes clustered yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={themesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  height={50}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
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
                <Bar dataKey="value" name="Feedback items" fill="#6d5dfc" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}

