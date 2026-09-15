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
  Filter,
  X,
  Sparkles,
  Calendar,
  MessageSquare,
  Tag,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
    setFeedbackMsg('');
    try {
      const res = await fetch(`/api/feedback/${id}/classify`, { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
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

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {canModify && (
            <>
              <Link
                href="/inbox/ingest"
                className="inline-flex items-center gap-2 rounded-xl bg-[#17152b] px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 shadow-sm"
              >
                <Plus size={16} /> Add feedback
              </Link>
              <Link
                href="/inbox/ingest?mode=csv"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                <Upload size={16} /> Import CSV
              </Link>
            </>
          )}
          {!canModify && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              Read-only mode (VIEWER role)
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleResetFilters} className="border border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50">
            Reset filters
          </Button>
          <Button onClick={load} className="border border-slate-200 bg-white hover:bg-slate-50">
            <RefreshCw size={15} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3.5 shadow-sm">
        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 border border-transparent focus-within:border-violet-300 focus-within:bg-white sm:col-span-2">
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
              placeholder="Search feedback content..."
              className="w-full bg-transparent py-2.5 text-sm outline-none text-slate-800 placeholder:text-slate-400"
            />
            {q && (
              <button
                onClick={() => {
                  setQ('');
                  setAppliedQ('');
                  setPage(1);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Channel */}
          <select
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none border border-slate-200/60"
          >
            <option value="">All channels</option>
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

          {/* Sentiment */}
          <select
            value={sentiment}
            onChange={(e) => {
              setSentiment(e.target.value);
              setPage(1);
            }}
            className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none border border-slate-200/60"
          >
            <option value="">All sentiment</option>
            <option value="POS">Positive (POS)</option>
            <option value="NEU">Neutral (NEU)</option>
            <option value="NEG">Negative (NEG)</option>
          </select>

          {/* Theme Filter */}
          <select
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value);
              setPage(1);
            }}
            className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none border border-slate-200/60"
          >
            <option value="">All themes</option>
            {themesList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status & Date */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none border border-slate-200/60"
          >
            <option value="">All status</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACTIONED">Actioned</option>
          </select>
        </div>

        {/* Second Row: Date & Filter status indicator */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Date period:</span>
            {['', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setDateRange(range);
                  setPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  dateRange === range
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {range === '' ? 'All time' : `Last ${range}`}
              </button>
            ))}
          </div>

          {(appliedQ || status || sentiment || channel || theme || dateRange) && (
            <div className="flex items-center gap-2">
              <span className="text-violet-600 font-semibold">Active filters applied</span>
            </div>
          )}
        </div>
      </Card>

      {/* Feedback Table */}
      <Card className="mt-5 overflow-hidden p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Customer Voice</th>
                <th>Themes</th>
                <th>Channel</th>
                <th>Sentiment</th>
                <th>Status Workflow</th>
                <th>Date</th>
                <th className="pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                      <span className="text-xs font-medium text-slate-400">Loading customer feedback...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.items?.length ? (
                data.items.map((f: any) => (
                  <tr
                    key={f.id}
                    onClick={() => setSelectedItem(f)}
                    className="cursor-pointer transition hover:bg-slate-50/80"
                  >
                    <td className="max-w-[420px] px-5 py-4">
                      <div className="font-semibold text-slate-900 line-clamp-2">{f.content}</div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-600">{f.customerLabel || 'Anonymous Customer'}</span>
                        <span>•</span>
                        <span>{f.featureArea || 'General Feedback'}</span>
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {f.themes && f.themes.length > 0 ? (
                          f.themes.map((ft: any) => (
                            <span
                              key={ft.themeId}
                              className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700"
                            >
                              {ft.theme.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 text-xs font-semibold text-slate-600">{f.channel}</td>

                    <td className="py-4">
                      <Badge
                        tone={
                          f.sentiment === 'NEG'
                            ? 'red'
                            : f.sentiment === 'POS'
                            ? 'green'
                            : 'gray'
                        }
                      >
                        {f.sentiment === 'NEG'
                          ? 'Negative'
                          : f.sentiment === 'POS'
                          ? 'Positive'
                          : 'Neutral'}
                      </Badge>
                    </td>

                    <td className="py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={f.status}
                        disabled={!canModify}
                        onChange={(e) => handleStatusChange(f.id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold outline-none transition ${
                          f.status === 'NEW'
                            ? 'border-blue-200 bg-blue-50 text-blue-800'
                            : f.status === 'REVIEWED'
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        } ${!canModify ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="REVIEWED">REVIEWED</option>
                        <option value="ACTIONED">ACTIONED</option>
                      </select>
                    </td>

                    <td className="py-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>

                    <td className="pr-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedItem(f)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          title="View full details"
                        >
                          <SlidersHorizontal size={15} />
                        </button>
                        {canModify && (
                          <button
                            onClick={async () => {
                              await fetch(`/api/feedback/${f.id}/classify`, { method: 'POST' });
                              load();
                            }}
                            className="rounded-lg p-1.5 text-violet-600 hover:bg-violet-50"
                            title="Re-classify with AI"
                          >
                            <RefreshCw size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-24 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                        <MessageSquare size={22} />
                      </div>
                      <div className="mt-3 text-base font-bold text-slate-800">No feedback matches your filters</div>
                      <p className="mt-1 text-xs text-slate-500">
                        Try clearing active filters or searching for different keywords.
                      </p>
                      <Button onClick={handleResetFilters} className="mt-4 border border-slate-200 bg-white text-xs">
                        Clear all filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-500 gap-3">
            <span>
              Showing {data.items?.length || 0} of {data.total || 0} customer feedback items
              {theme && ` (Theme: ${theme})`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <span className="grid min-w-8 place-items-center rounded-lg bg-slate-100 py-1 font-bold text-slate-700">
                {page} / {data.pages || 1}
              </span>
              <Button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* DETAIL MODAL / SLIDE-OVER */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Badge
                  tone={
                    selectedItem.sentiment === 'NEG'
                      ? 'red'
                      : selectedItem.sentiment === 'POS'
                      ? 'green'
                      : 'gray'
                  }
                >
                  {selectedItem.sentiment === 'NEG'
                    ? 'Negative'
                    : selectedItem.sentiment === 'POS'
                    ? 'Positive'
                    : 'Neutral'}
                </Badge>
                <span className="text-xs font-bold text-slate-400">
                  Score: {selectedItem.sentimentScore}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setFeedbackMsg('');
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Quote
              </div>
              <p className="mt-2 text-base font-semibold leading-7 text-slate-900 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                &ldquo;{selectedItem.content}&rdquo;
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Channel</div>
                <div className="mt-1 text-xs font-bold text-slate-800">{selectedItem.channel}</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Customer</div>
                <div className="mt-1 text-xs font-bold text-slate-800">
                  {selectedItem.customerLabel || 'Anonymous'}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Feature Area</div>
                <div className="mt-1 text-xs font-bold text-slate-800">
                  {selectedItem.featureArea || 'Core'}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Date Logged</div>
                <div className="mt-1 text-xs font-bold text-slate-800">
                  {new Date(selectedItem.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* AI Rationale */}
            {selectedItem.aiRationale && (
              <div className="mt-5 rounded-2xl bg-violet-50/70 p-4 border border-violet-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-800">
                  <Sparkles size={14} /> AI Classification Rationale
                </div>
                <p className="mt-1 text-xs leading-5 text-violet-900">
                  {selectedItem.aiRationale}
                </p>
              </div>
            )}

            {/* Themes */}
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag size={14} /> Assigned Themes
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedItem.themes && selectedItem.themes.length > 0 ? (
                  selectedItem.themes.map((ft: any) => (
                    <span
                      key={ft.themeId}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700"
                    >
                      <span>{ft.theme.name}</span>
                      <span className="text-[10px] text-violet-400 font-semibold">
                        ({Math.round((ft.confidence || 0.8) * 100)}% match)
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No themes assigned.</span>
                )}
              </div>
            </div>

            {feedbackMsg && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                {feedbackMsg}
              </div>
            )}

            {/* Actions / Workflow */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Triage & Actions
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Status:</span>
                  <select
                    value={selectedItem.status}
                    disabled={!canModify}
                    onChange={(e) => handleStatusChange(selectedItem.id, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800"
                  >
                    <option value="NEW">NEW</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="ACTIONED">ACTIONED</option>
                  </select>
                </div>

                {canModify && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Manual sentiment override */}
                    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
                      <span className="px-1 text-[11px] font-bold text-slate-400">Override:</span>
                      <button
                        disabled={modalLoading}
                        onClick={() => handleManualSentiment(selectedItem.id, 'POS')}
                        className={`rounded-lg px-2 py-0.5 font-bold ${
                          selectedItem.sentiment === 'POS' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        POS
                      </button>
                      <button
                        disabled={modalLoading}
                        onClick={() => handleManualSentiment(selectedItem.id, 'NEU')}
                        className={`rounded-lg px-2 py-0.5 font-bold ${
                          selectedItem.sentiment === 'NEU' ? 'bg-slate-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        NEU
                      </button>
                      <button
                        disabled={modalLoading}
                        onClick={() => handleManualSentiment(selectedItem.id, 'NEG')}
                        className={`rounded-lg px-2 py-0.5 font-bold ${
                          selectedItem.sentiment === 'NEG' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-200'
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
          <div className="py-24 text-center text-xs text-slate-400">
            Loading inbox and customer feedback...
          </div>
        }
      >
        <InboxContent />
      </Suspense>
    </AppShellClient>
  );
}
