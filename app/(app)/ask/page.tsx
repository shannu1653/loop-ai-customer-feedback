"use client";

import { useState } from 'react';
import { AppShellClient } from '@/components/client-shell';
import { Button, Card, Badge } from '@/components/ui';
import { Sparkles, Send, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

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

export default function Ask() {
  const [q, setQ] = useState('What are users saying about onboarding?');
  const [res, setRes] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function ask(queryOverride?: string) {
    const questionToAsk = (queryOverride || q).trim();
    if (!questionToAsk) return;

    setLoading(true);
    setError('');
    setRes(null);

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
      setError('A network error occurred while querying Ask LOOP.');
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

  return (
    <AppShellClient
      title="Ask LOOP"
      subtitle="Semantic retrieval & grounded intelligence across customer voice"
    >
      <div className="mx-auto max-w-5xl">
        {/* Search Hero Card */}
        <div className="rounded-3xl bg-[#17152b] p-7 text-white shadow-soft">
          <div className="flex items-center gap-2 text-violet-300">
            <Sparkles size={18} />
            <span className="text-xs font-black uppercase tracking-wider">Semantic Retrieval</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight">Ask questions. Get verified evidence.</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-white/60">
            LOOP retrieves relevant customer feedback before generating an answer. Every answer is strictly grounded in evidence from your workspace.
          </p>

          <div className="mt-6 flex gap-2 rounded-2xl bg-white p-2 shadow-inner">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask()}
              className="min-w-0 flex-1 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Ask about onboarding, billing, mobile, SSO, search..."
            />
            <Button
              loading={loading}
              onClick={() => ask()}
              className="bg-violet-600 text-white hover:bg-violet-500 shadow-sm"
            >
              <Send size={15} /> Ask LOOP
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/50">
            <span className="font-semibold text-white/40">Suggested:</span>
            {suggestedQuestions.map((x) => (
              <button
                key={x}
                onClick={() => {
                  setQ(x);
                  ask(x);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <div>{error}</div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card className="h-64 animate-pulse bg-slate-100/70">{null}</Card>
            <Card className="h-64 animate-pulse bg-slate-100/70">{null}</Card>
          </div>
        )}

        {/* Results View */}
        {res && !loading && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Grounded Answer Card */}
            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={16} />
                  <span>GROUNDED INTELLIGENCE BRIEF</span>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {res.sources?.length || 0} Evidence Sources
                </span>
              </div>

              <div className="prose-loop mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                {res.answer}
              </div>

              {res.sources?.length === 0 && (
                <div className="mt-4 rounded-xl bg-amber-50 p-3.5 text-xs font-medium text-amber-800 border border-amber-200">
                  Notice: No matching feedback exceeded the relevance threshold for this query. The model will never invent customer feedback.
                </div>
              )}
            </Card>

            {/* Evidence Sources Card */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900">Evidence Used</h3>
                  <p className="text-xs text-slate-500">Retrieved from your workspace database.</p>
                </div>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>

              <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {res.sources && res.sources.length > 0 ? (
                  res.sources.map((s: AskSource, i: number) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:bg-slate-100/80"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-violet-700 text-xs">[{i + 1}]</span>
                          <span className="text-xs font-semibold text-slate-700">{s.channel}</span>
                        </div>
                        <Badge
                          tone={
                            s.sentiment === 'NEG'
                              ? 'red'
                              : s.sentiment === 'POS'
                              ? 'green'
                              : 'gray'
                          }
                        >
                          {s.sentiment === 'NEG' ? 'Neg' : s.sentiment === 'POS' ? 'Pos' : 'Neu'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-700 font-medium">
                        &ldquo;{s.content}&rdquo;
                      </p>
                      {s.score !== undefined && (
                        <div className="mt-2 text-[10px] font-bold text-slate-400">
                          Relevance: {Math.round(s.score * 100)}%
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No relevant sources retrieved for this question.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShellClient>
  );
}
