"use client";

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShellClient } from '@/components/client-shell';
import { Badge, Button, Card } from '@/components/ui';
import {
  Search,
  Upload,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Calendar,
  MessageSquare,
  Tag,
  SlidersHorizontal,
  Trash2,
  Headphones,
  Smartphone,
  ClipboardList,
  PhoneCall,
  Users,
  Mail,
  User,
  Radio,
  Clock,
  RotateCcw,
  CheckCircle2,
  Shield,
  Layers,
  LucideIcon,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

function getChannelMeta(channelName: string): { icon: LucideIcon; badgeClasses: string } {
  const normalized = (channelName || '').toLowerCase();
  if (normalized.includes('support') || normalized.includes('ticket') || normalized.includes('zendesk') || normalized.includes('intercom')) {
    return { icon: Headphones, badgeClasses: 'bg-indigo-50 text-indigo-700 border-indigo-200/70' };
  }
  if (normalized.includes('app') || normalized.includes('store') || normalized.includes('mobile')) {
    return { icon: Smartphone, badgeClasses: 'bg-sky-50 text-sky-700 border-sky-200/70' };
  }
  if (normalized.includes('survey') || normalized.includes('nps') || normalized.includes('csat')) {
    return { icon: ClipboardList, badgeClasses: 'bg-violet-50 text-violet-700 border-violet-200/70' };
  }
  if (normalized.includes('sales') || normalized.includes('call') || normalized.includes('crm')) {
    return { icon: PhoneCall, badgeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' };
  }
  if (normalized.includes('community') || normalized.includes('forum') || normalized.includes('discord') || normalized.includes('slack')) {
    return { icon: Users, badgeClasses: 'bg-amber-50 text-amber-700 border-amber-200/70' };
  }
  if (normalized.includes('email') || normalized.includes('mail') || normalized.includes('web')) {
    return { icon: Mail, badgeClasses: 'bg-blue-50 text-blue-700 border-blue-200/70' };
  }
  return { icon: MessageSquare, badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200/80' };
}

function InboxContent() {
  const sp = useSearchParams();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'VIEWER';
  const canModify = userRole === 'ADMIN' || userRole === 'ANALYST';

  const initialTheme = sp.get('theme') || '';
  const initialQ = sp.get('q') || '';

  const [data, setData] = useState<any>(null);
  const [themesList, setThemesList] = useState<string[]>([]);
  const [q, setQ] = useState(initialQ);
  const [appliedQ, setAppliedQ] = useState(initialQ);
  const [status, setStatus] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [channel, setChannel] = useState('');
  const [theme, setTheme] = useState(initialTheme);
  const [dateRange, setDateRange] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);

  // Selected feedback for detail view
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Load themes for dropdown
  useEffect(() => {
    fetch('/api/themes/trends')
      .then((r) => r.json())
      .then((res) => {
        if (res.topThemes) {
          setThemesList(res.topThemes.map((t: any) => t.name));
        }
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({
        page: String(page),
        pageSize: '12',
        q: appliedQ,
        status,
        sentiment,
        channel,
        theme,
        dateRange,
      });
      const r = await fetch('/api/feedback?' + p);
      const res = await r.json();
      setData(res);
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [page, appliedQ, status, sentiment, channel, theme, dateRange]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchSubmit() {
    setPage(1);
    setAppliedQ(q);
  }

  function handleResetFilters() {
    setQ('');
    setAppliedQ('');
    setStatus('');
    setSentiment('');
    setChannel('');
    setTheme('');
    setDateRange('');
    setPage(1);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    if (!canModify) {
      alert('Viewers cannot modify feedback status.');
      return;
    }
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(updated);
        }
        load();
      }
    } catch {
      alert('Failed to update status.');
    }
  }

  async function handleManualSentiment(id: string, newSentiment: string) {
    if (!canModify) return;
    setModalLoading(true);
    setFeedbackMsg('');
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sentiment: newSentiment,
          sentimentScore: newSentiment === 'POS' ? 0.8 : newSentiment === 'NEG' ? -0.8 : 0,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedItem(updated);
        setFeedbackMsg(`Sentiment manually changed to ${newSentiment}.`);
        load();
      }
    } finally {
      setModalLoading(false);
    }
  }

  async function handleReclassify(id: string) {
    if (!canModify) return;
    setModalLoading(true);
    setReclassifyingId(id);
    setFeedbackMsg('');
    try {
      const res = await fetch(`/api/feedback/${id}/classify`, { method: 'POST' });
      if (res.ok) {
        setFeedbackMsg('AI re-classification complete.');
        // Refresh modal data
        const singleRes = await fetch(`/api/feedback/${id}`);
        if (singleRes.ok) {
          setSelectedItem(await singleRes.json());
        }
        load();
      }
    } finally {
      setModalLoading(false);
      setReclassifyingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!canModify) return;
    if (!confirm('Are you sure you want to delete this customer feedback record?')) return;
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedItem(null);
        load();
      }
    } catch {
      alert('Failed to delete feedback.');
    }
  }

  const hasActiveFilters = Boolean(appliedQ || status || sentiment || channel || theme || dateRange);

  return (
    <>
      {/* 1. Header & Actions Strip */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs lg:flex-row lg:items-center">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600/10 text-violet-600 border border-violet-200/60 shadow-xs">
            <Radio size={19} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-violet-700 uppercase bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                Customer Feedback
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live Ingestion
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Centralized customer voice, AI sentiment analysis, and workflow triage across all connected channels.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {canModify ? (
            <>
              <Link
                href="/inbox/ingest"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#17152b] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
              >
                <Plus size={14} className="text-violet-300" />
                <span>Add Feedback</span>
              </Link>
              <Link
                href="/inbox/ingest?mode=csv"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
              >
                <Upload size={14} className="text-violet-600" />
                <span>Import CSV</span>
              </Link>
            </>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <Shield size={13} className="text-slate-400" />
              <span>Read-only Mode (VIEWER)</span>
            </div>
          )}
          <Button
            onClick={load}
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-violet-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Premium Filter & Search Bar */}
      <Card className="p-4 shadow-card hover:border-slate-300/80 transition-all duration-200">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Search Box */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 border border-slate-200/80 transition-all duration-150 focus-within:border-violet-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/15 sm:col-span-2">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => {
                const val = e.target.value;
                setQ(val);
                if (!val && appliedQ) {
                  setPage(1);
                  setAppliedQ('');
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              placeholder="Search customer feedback content..."
              className="w-full bg-transparent py-2.5 text-xs font-medium outline-none text-slate-800 placeholder:text-slate-400"
            />
            {q && (
              <button
                onClick={() => {
                  setQ('');
                  setAppliedQ('');
                  setPage(1);
                }}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                title="Clear search query"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Channel Dropdown */}
          <div className="relative">
            <select
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value);
                setPage(1);
              }}
              className={`w-full appearance-none rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border transition-all duration-150 ${
                channel
                  ? 'bg-violet-50/60 border-violet-200 text-violet-900 font-bold'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:border-violet-400'
              }`}
            >
              <option value="">All Channels</option>
              {[
                'Support ticket',
                'App store review',
                'NPS survey',
                'Sales call note',
                'Community post',
                'Simulated channel',
              ].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Dropdown */}
          <div className="relative">
            <select
              value={sentiment}
              onChange={(e) => {
                setSentiment(e.target.value);
                setPage(1);
              }}
              className={`w-full appearance-none rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border transition-all duration-150 ${
                sentiment
                  ? 'bg-violet-50/60 border-violet-200 text-violet-900 font-bold'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:border-violet-400'
              }`}
            >
              <option value="">All Sentiment</option>
              <option value="POS">Positive (POS)</option>
              <option value="NEU">Neutral (NEU)</option>
              <option value="NEG">Negative (NEG)</option>
            </select>
          </div>

          {/* Theme Dropdown */}
          <div className="relative">
            <select
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                setPage(1);
              }}
              className={`w-full appearance-none rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border transition-all duration-150 truncate ${
                theme
                  ? 'bg-violet-50/60 border-violet-200 text-violet-900 font-bold'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:border-violet-400'
              }`}
            >
              <option value="">All Themes</option>
              {themesList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={`w-full appearance-none rounded-xl px-3 py-2.5 text-xs font-semibold outline-none border transition-all duration-150 ${
                status
                  ? 'bg-violet-50/60 border-violet-200 text-violet-900 font-bold'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:border-violet-400'
              }`}
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ACTIONED">Actioned</option>
            </select>
          </div>
        </div>

        {/* Sub-Bar: Date Range & Active Filter Chips */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 font-semibold text-slate-400 mr-1 text-[11px] uppercase tracking-wider">
              <Calendar size={13} /> Period:
            </span>
            {[
              { label: 'All time', value: '' },
              { label: 'Last 7d', value: '7d' },
              { label: 'Last 30d', value: '30d' },
              { label: 'Last 90d', value: '90d' },
            ].map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  setDateRange(r.value);
                  setPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-150 active:scale-[0.97] ${
                  dateRange === r.value
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200/80 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                  Active Filters
                </span>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  <RotateCcw size={12} /> Clear all
                </button>
              </>
            )}
            <span className="text-[11px] font-semibold text-slate-400">
              {data ? `${data.total || 0} Total Records` : 'Scanning...'}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Feedback Data Table */}
      <Card className="mt-6 overflow-hidden p-0 shadow-card border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead className="bg-slate-50/90 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Customer Voice & Context</th>
                <th className="px-4 py-4">Clustered Themes</th>
                <th className="px-4 py-4">Source Channel</th>
                <th className="px-4 py-4">Sentiment</th>
                <th className="px-4 py-4">Workflow Status</th>
                <th className="px-4 py-4">Ingested Date</th>
                <th className="pr-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                // Skeletons matching exact row layout
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-72 rounded-md bg-slate-200/70" />
                      <div className="mt-2 h-3 w-40 rounded-md bg-slate-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-20 rounded-md bg-slate-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-24 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-16 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 w-20 rounded-lg bg-slate-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 rounded bg-slate-100" />
                    </td>
                    <td className="pr-6 py-4 text-right">
                      <div className="ml-auto h-7 w-14 rounded-lg bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : data?.items?.length ? (
                data.items.map((f: any) => {
                  const channelInfo = getChannelMeta(f.channel);
                  const ChannelIcon = channelInfo.icon;
                  const isPositive = f.sentiment === 'POS';
                  const isNegative = f.sentiment === 'NEG';

                  return (
                    <tr
                      key={f.id}
                      onClick={() => setSelectedItem(f)}
                      className="group cursor-pointer transition-colors duration-150 hover:bg-slate-50/80"
                    >
                      {/* Customer Voice */}
                      <td className="max-w-[400px] px-6 py-4">
                        <div className="font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-violet-950 transition-colors">
                          &ldquo;{f.content}&rdquo;
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            <User size={10} className="text-slate-500" />
                            {f.customerLabel || 'Anonymous Customer'}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-slate-500">{f.featureArea || 'General Feedback'}</span>
                        </div>
                      </td>

                      {/* Clustered Themes */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {f.themes && f.themes.length > 0 ? (
                            f.themes.map((ft: any) => (
                              <span
                                key={ft.themeId}
                                className="inline-flex items-center gap-1 rounded-md bg-violet-50 border border-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700"
                              >
                                <Tag size={9} />
                                {ft.theme.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs font-semibold text-slate-300">—</span>
                          )}
                        </div>
                      </td>

                      {/* Channel Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${channelInfo.badgeClasses}`}
                        >
                          <ChannelIcon size={12} />
                          <span>{f.channel}</span>
                        </span>
                      </td>

                      {/* Sentiment Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            isNegative
                              ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                              : isPositive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : 'bg-slate-100 text-slate-700 border-slate-200/80'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isNegative ? 'bg-rose-500' : isPositive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {isNegative ? 'Negative' : isPositive ? 'Positive' : 'Neutral'}
                        </span>
                      </td>

                      {/* Workflow Status */}
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={f.status}
                          disabled={!canModify}
                          onChange={(e) => handleStatusChange(f.id, e.target.value)}
                          className={`rounded-xl border px-2.5 py-1 text-xs font-bold outline-none transition-all duration-150 ${
                            f.status === 'NEW'
                              ? 'border-blue-200 bg-blue-50 text-blue-800'
                              : f.status === 'REVIEWED'
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          } ${!canModify ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-xs'}`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="REVIEWED">REVIEWED</option>
                          <option value="ACTIONED">ACTIONED</option>
                        </select>
                      </td>

                      {/* Date Logged */}
                      <td className="px-4 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="pr-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSelectedItem(f)}
                            className="rounded-xl border border-transparent p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 hover:border-slate-200"
                            title="Inspect feedback details"
                          >
                            <SlidersHorizontal size={15} />
                          </button>
                          {canModify && (
                            <button
                              disabled={reclassifyingId === f.id}
                              onClick={async () => {
                                setReclassifyingId(f.id);
                                try {
                                  await fetch(`/api/feedback/${f.id}/classify`, { method: 'POST' });
                                  load();
                                } finally {
                                  setReclassifyingId(null);
                                }
                              }}
                              className="rounded-xl border border-transparent p-1.5 text-violet-600 transition hover:bg-violet-50 hover:border-violet-100 disabled:opacity-50"
                              title="Re-classify with AI"
                            >
                              <Sparkles size={15} className={reclassifyingId === f.id ? 'animate-spin' : ''} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Empty state
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 shadow-xs">
                        <MessageSquare size={24} />
                      </div>
                      <h3 className="mt-4 text-base font-black text-slate-800 tracking-tight">
                        No feedback matches your criteria
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        We couldn&apos;t find any records matching your active search keywords or filter selections. Try clearing your filters or changing the date period.
                      </p>
                      <Button
                        onClick={handleResetFilters}
                        variant="secondary"
                        size="sm"
                        className="mt-4 font-bold text-violet-700 border-violet-200 hover:bg-violet-50"
                      >
                        <RotateCcw size={13} /> Reset All Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Responsive Pagination Bar */}
        {data && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 bg-slate-50/50 px-6 py-4 text-xs text-slate-500 gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">
                Showing {data.items?.length || 0} of {data.total || 0} feedback items
              </span>
              {theme && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  Theme: {theme}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                variant="outline"
                size="sm"
                className="border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 shadow-xs disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <span className="inline-flex items-center justify-center min-w-16 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-800 shadow-xs">
                Page {page} of {data.pages || 1}
              </span>
              <Button
                disabled={page >= data.pages || loading}
                onClick={() => setPage((p) => p + 1)}
                variant="outline"
                size="sm"
                className="border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 shadow-xs disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Detail Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                    selectedItem.sentiment === 'NEG'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : selectedItem.sentiment === 'POS'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      selectedItem.sentiment === 'NEG'
                        ? 'bg-rose-500'
                        : selectedItem.sentiment === 'POS'
                        ? 'bg-emerald-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  {selectedItem.sentiment === 'NEG'
                    ? 'Negative'
                    : selectedItem.sentiment === 'POS'
                    ? 'Positive'
                    : 'Neutral'}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  Score: {selectedItem.sentimentScore ?? 0}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setFeedbackMsg('');
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer Quote */}
            <div className="mt-5">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Verbatim Customer Quote
              </div>
              <div className="mt-2 text-base font-semibold leading-relaxed text-slate-900 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                &ldquo;{selectedItem.content}&rdquo;
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Channel</div>
                <div className="mt-1 text-xs font-bold text-slate-800 truncate">{selectedItem.channel}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Customer</div>
                <div className="mt-1 text-xs font-bold text-slate-800 truncate">
                  {selectedItem.customerLabel || 'Anonymous'}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Feature Area</div>
                <div className="mt-1 text-xs font-bold text-slate-800 truncate">
                  {selectedItem.featureArea || 'Core'}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date Logged</div>
                <div className="mt-1 text-xs font-bold text-slate-800">
                  {new Date(selectedItem.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* AI Classification Rationale */}
            {selectedItem.aiRationale && (
              <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-50/90 to-indigo-50/50 p-4 border border-violet-100 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
                  <Sparkles size={14} className="text-violet-600" /> AI Classification Rationale
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-violet-950 font-medium">
                  {selectedItem.aiRationale}
                </p>
              </div>
            )}

            {/* Assigned Themes */}
            <div className="mt-5">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag size={13} /> Assigned Topic Themes
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedItem.themes && selectedItem.themes.length > 0 ? (
                  selectedItem.themes.map((ft: any) => (
                    <span
                      key={ft.themeId}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800 shadow-xs"
                    >
                      <span>{ft.theme.name}</span>
                      <span className="text-[10px] text-violet-500 font-semibold">
                        ({Math.round((ft.confidence || 0.8) * 100)}% match)
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No themes assigned to this record yet.</span>
                )}
              </div>
            </div>

            {feedbackMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 animate-fade-in">
                <CheckCircle2 size={15} />
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Actions & Workflow Footer */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                Triage Workflow & Overrides
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Status:</span>
                  <select
                    value={selectedItem.status}
                    disabled={!canModify}
                    onChange={(e) => handleStatusChange(selectedItem.id, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-white transition"
                  >
                    <option value="NEW">NEW</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="ACTIONED">ACTIONED</option>
                  </select>
                </div>

                {canModify && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Manual Sentiment Override */}
                    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
                      <span className="px-1 text-[10px] font-bold text-slate-400">Override:</span>
                      <button
                        disabled={modalLoading}
                        onClick={() => handleManualSentiment(selectedItem.id, 'POS')}
                        className={`rounded-lg px-2 py-0.5 text-xs font-bold transition ${
                          selectedItem.sentiment === 'POS'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        POS
                      </button>
                      <button
                        disabled={modalLoading}
                        onClick={() => handleManualSentiment(selectedItem.id, 'NEU')}
                        className={`rounded-lg px-2 py-0.5 text-xs font-bold transition ${
                          selectedItem.sentiment === 'NEU'
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        NEU
                      </button>
                      <button
                        disabled={modalLoading}
                        onClick={() => handleManualSentiment(selectedItem.id, 'NEG')}
                        className={`rounded-lg px-2 py-0.5 text-xs font-bold transition ${
                          selectedItem.sentiment === 'NEG'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        NEG
                      </button>
                    </div>

                    <Button
                      loading={modalLoading}
                      onClick={() => handleReclassify(selectedItem.id)}
                      className="border border-violet-200 bg-violet-50 text-xs font-bold text-violet-700 hover:bg-violet-100"
                    >
                      <Sparkles size={14} /> AI Re-classify
                    </Button>

                    <Button
                      onClick={() => handleDelete(selectedItem.id)}
                      className="border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Inbox() {
  return (
    <AppShellClient
      title="Feedback Inbox"
      subtitle="Search, filter and triage customer voice"
    >
      <Suspense
        fallback={
          <div className="py-24 text-center text-xs font-semibold text-slate-400">
            <div className="flex flex-col items-center gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
              <span>Loading customer feedback inbox...</span>
            </div>
          </div>
        }
      >
        <InboxContent />
      </Suspense>
    </AppShellClient>
  );
}
