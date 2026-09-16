"use client";

import { useState, useMemo } from 'react';
import { AppShellClient } from '@/components/client-shell';
import { Button, Card, Badge } from '@/components/ui';
import {
  Sparkles,
  Send,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Radio,
  X,
  RefreshCw,
  Headphones,
  Smartphone,
  ClipboardList,
  PhoneCall,
  Users,
  Mail,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Flame,
  ThumbsDown,
  ThumbsUp,
  LucideIcon,
  Bot,
} from 'lucide-react';

interface AskSource {
  id: string;
  content: string;
  channel: string;
  sentiment: 'POS' | 'NEU' | 'NEG' | string;
  score?: number;
}

interface AskResponse {
  answer: string;
  sources?: AskSource[];
  error?: string;
}

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

export default function Ask() {
  const [q, setQ] = useState('What are users saying about onboarding?');
  const [res, setRes] = useState<AskResponse | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function ask(queryOverride?: string) {
    const questionToAsk = (queryOverride || q).trim();
    if (!questionToAsk) return;

    setLoading(true);
    setError('');
    setRes(null);
    setLastQuery(questionToAsk);

    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: questionToAsk }),
      });

      const data: AskResponse = await r.json();
      if (!r.ok) {
        setError(data.error || 'Failed to retrieve grounded answer');
      } else {
        setRes(data);
      }
    } catch {
      setError('A network error occurred while querying Ask LOOP. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  }

  const suggestedQuestions = [
    'What are the main complaints from customers?',
    'Why do customers like the new dashboard?',
    'What are customers saying about onboarding and invites?',
    'Are customers requesting SSO or security features?',
    'What mobile layout issues are reported?',
  ];

  // Sentiment Breakdown in Retrieved Evidence
  const sentimentCounts = useMemo(() => {
    if (!res?.sources || res.sources.length === 0) return null;
    const pos = res.sources.filter((s) => s.sentiment === 'POS').length;
    const neg = res.sources.filter((s) => s.sentiment === 'NEG').length;
    const neu = res.sources.length - pos - neg;
    return { pos, neg, neu, total: res.sources.length };
  }, [res]);

  return (
    <AppShellClient
      title="Ask LOOP"
      subtitle="Semantic retrieval & grounded intelligence across customer voice"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {/* 1. Hero Search & Query Card */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#17152b] via-[#1f1b3d] to-[#121024] p-6 sm:p-8 text-white shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-300">
              <Sparkles size={18} className="animate-pulse text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Grounded Semantic RAG
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-violet-200">
              <ShieldCheck size={13} className="text-emerald-400" />
              Zero Hallucinations
            </span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">
            Ask questions. Get verified customer evidence.
          </h2>
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-white/60 leading-relaxed">
            LOOP retrieves semantic vectors across your customer feedback before synthesizing an answer. Every assertion is backed strictly by verbatim quotes from your workspace.
          </p>

          {/* Search Input Box */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 rounded-2xl bg-white p-2 shadow-2xl focus-within:ring-2 focus-within:ring-violet-500/20">
            <div className="relative flex flex-1 items-center min-w-0">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask()}
                className="w-full bg-transparent px-3 py-2 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Ask what customers are saying about onboarding, billing, speed, SSO, search..."
              />
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition mr-2"
                  title="Clear question"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Button
              loading={loading}
              onClick={() => ask()}
              variant="primary"
              size="md"
              className="bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-xs shrink-0 active:scale-[0.98]"
            >
              <Send size={15} />
              <span>Ask LOOP</span>
            </Button>
          </div>

          {/* Suggested Prompts */}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-white/40 text-[11px] uppercase tracking-wider mr-1">
              Suggested:
            </span>
            {suggestedQuestions.map((x) => (
              <button
                key={x}
                onClick={() => {
                  setQ(x);
                  ask(x);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/15 hover:text-white active:scale-[0.97]"
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Error Callout */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-semibold text-rose-800 shadow-xs animate-slide-up">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => ask()}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 font-bold text-rose-700 hover:bg-rose-50 transition shadow-xs"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* 3. Indeterminate AI Loading Skeleton */}
        {loading && (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] animate-fade-in">
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-2.5 text-xs font-bold text-violet-700 pb-4 border-b border-slate-100">
                <Radio size={16} className="animate-pulse" />
                <span>Retrieving semantic evidence & synthesizing grounded brief...</span>
              </div>
              <div className="mt-5 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200/70" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200/60" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="h-4 w-36 animate-pulse rounded bg-slate-200/70" />
              <div className="mt-4 space-y-3">
                <div className="h-20 animate-pulse rounded-2xl bg-slate-50 border border-slate-100" />
                <div className="h-20 animate-pulse rounded-2xl bg-slate-50 border border-slate-100" />
              </div>
            </Card>
          </div>
        )}

        {/* 4. Results View */}
        {res && !loading && (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] animate-slide-up">
            {/* Grounded Answer Card */}
            <Card className="flex flex-col justify-between p-6 shadow-card hover:border-slate-300/80 transition-all duration-200">
              <div>
                {/* Header Verification Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                      <ShieldCheck size={14} />
                    </span>
                    <span className="text-xs font-black text-emerald-800 tracking-tight uppercase">
                      Grounded Intelligence Brief
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/60">
                    {res.sources?.length || 0} Evidence Citations
                  </span>
                </div>

                {/* Evidence Sentiment Breakdown Chips */}
                {sentimentCounts && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Evidence Sentiment:
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      <ThumbsUp size={10} /> {sentimentCounts.pos} Positive
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {sentimentCounts.neu} Neutral
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                      <ThumbsDown size={10} /> {sentimentCounts.neg} Negative
                    </span>
                  </div>
                )}

                {/* Answer Content */}
                <div className="prose-loop mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-800 font-normal">
                  {res.answer}
                </div>

                {res.sources?.length === 0 && (
                  <div className="mt-5 rounded-2xl bg-amber-50/80 p-4 text-xs font-medium text-amber-900 border border-amber-200">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <AlertCircle size={15} className="text-amber-600" />
                      <span>Zero Hallucination Safeguard</span>
                    </div>
                    No feedback in this workspace exceeded the semantic relevance threshold for this query. Ask LOOP will never fabricate unsupported customer statements.
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Query: &ldquo;{lastQuery}&rdquo;</span>
                <span className="text-slate-600 font-semibold">Strict evidence grounding</span>
              </div>
            </Card>

            {/* Retrieved Evidence Sources Sidebar */}
            <Card className="flex flex-col justify-between p-6 shadow-card hover:border-slate-300/80 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Retrieved Evidence Sources
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500">
                      Semantic matches from your workspace database.
                    </p>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>

                <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {res.sources && res.sources.length > 0 ? (
                    res.sources.map((s: AskSource, i: number) => {
                      const channelInfo = getChannelMeta(s.channel);
                      const ChannelIcon = channelInfo.icon;
                      const isNeg = s.sentiment === 'NEG';
                      const isPos = s.sentiment === 'POS';
                      const relevanceScore = s.score !== undefined ? Math.round(s.score * 100) : null;

                      return (
                        <div
                          key={s.id || i}
                          className="group rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all duration-150 hover:bg-white hover:border-violet-200 hover:shadow-xs"
                        >
                          {/* Citation Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-600 text-[10px] font-black text-white shadow-xs">
                                {i + 1}
                              </span>
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${channelInfo.badgeClasses}`}>
                                <ChannelIcon size={11} />
                                <span>{s.channel}</span>
                              </span>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                isNeg
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isPos
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isNeg ? 'bg-rose-500' : isPos ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {isNeg ? 'Neg' : isPos ? 'Pos' : 'Neu'}
                            </span>
                          </div>

                          {/* Verbatim Quote */}
                          <p className="mt-2.5 text-xs leading-relaxed text-slate-800 font-medium group-hover:text-slate-950 transition-colors">
                            &ldquo;{s.content}&rdquo;
                          </p>

                          {/* Relevance Progress Meter */}
                          {relevanceScore !== null && (
                            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                              <div className="flex items-center gap-2 w-3/5">
                                <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-violet-600 transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(10, relevanceScore))}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-slate-600 font-bold">
                                {relevanceScore}% Relevance
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 text-center text-xs text-slate-400">
                      No relevant evidence citations retrieved.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Vector Cosine Ranking</span>
                <span className="text-slate-600 font-semibold">{res.sources?.length || 0} retrieved</span>
              </div>
            </Card>
          </div>
        )}

        {/* 5. Initial Empty State Guide */}
        {!res && !loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
            <div
              onClick={() => {
                const query = 'What are the main complaints from customers?';
                setQ(query);
                ask(query);
              }}
              className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-violet-300 hover:shadow-card-hover group"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
                <ThumbsDown size={16} />
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-violet-700 transition">
                Customer Pain Points
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Discover the top complaints, blocker issues, and friction points reported.
              </p>
            </div>

            <div
              onClick={() => {
                const query = 'Why do customers like the new dashboard?';
                setQ(query);
                ask(query);
              }}
              className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-violet-300 hover:shadow-card-hover group"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
                <ThumbsUp size={16} />
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-violet-700 transition">
                Feature Praise
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Highlight positive customer sentiment and favorite product workflows.
              </p>
            </div>

            <div
              onClick={() => {
                const query = 'What are customers saying about onboarding and invites?';
                setQ(query);
                ask(query);
              }}
              className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-violet-300 hover:shadow-card-hover group"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-700 border border-violet-100 shadow-xs">
                <Users size={16} />
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-violet-700 transition">
                Onboarding & Invites
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Evaluate setup steps, team invitation flows, and new user activation.
              </p>
            </div>

            <div
              onClick={() => {
                const query = 'Are customers requesting SSO or security features?';
                setQ(query);
                ask(query);
              }}
              className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-violet-300 hover:shadow-card-hover group"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-xs">
                <ShieldCheck size={16} />
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-violet-700 transition">
                Enterprise & Security
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Track requests for SAML, SSO, audit logging, and team permissions.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShellClient>
  );
}
