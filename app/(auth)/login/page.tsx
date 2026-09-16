"use client";

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui';

export default function Login() {
  const [email, setEmail] = useState('admin@loop.demo');
  const [password, setPassword] = useState('LoopDemo@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (r?.error) {
        setError('Invalid email address or password. Please verify your credentials.');
      } else {
        location.href = '/dashboard';
      }
    } catch {
      setError('A network error occurred while signing in.');
    } finally {
      setLoading(false);
    }
  }

  function setDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('LoopDemo@2026');
    setError('');
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr] bg-[#f8f9fc]">
      {/* Left Branding Panel */}
      <section className="hidden bg-gradient-to-br from-[#17152b] via-[#1f1b3d] to-[#121024] p-12 text-white lg:flex lg:flex-col lg:justify-between border-r border-slate-800/80">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/30 shadow-xs">
            <BrainCircuit size={22} />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-white leading-none">LOOP</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-white/45">
              Feedback Intelligence
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-violet-200">
            <Sparkles size={13} className="text-violet-400" />
            AI Customer Feedback Intelligence
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Close the loop between what customers say and what teams do.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/60">
            Centralize feedback across channels, surface high-impact topic clusters, detect emerging negative sentiment spikes, and ask grounded questions with zero hallucinations.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-semibold text-white/80">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-3">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Semantic Vector RAG</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-3">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>14-Day Velocity Spikes</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-3">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Executive VoC Briefs</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-3">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Role-Based Triage</span>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-between text-xs text-white/45 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Strict Tenant Isolation by Design</span>
          </div>
          <span>v1.0 Enterprise</span>
        </div>
      </section>

      {/* Right Login Form Panel */}
      <section className="grid place-items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white font-black">
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-none">LOOP</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Feedback Intelligence
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Sign in to your customer feedback intelligence workspace.
            </p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Work Email
              </label>
              <div className="mt-1.5 relative flex items-center">
                <Mail size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="mt-1.5 relative flex items-center">
                <KeyRound size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 animate-slide-up">
                {error}
              </div>
            )}

            <Button
              loading={loading}
              variant="primary"
              size="lg"
              className="w-full bg-[#17152b] hover:bg-slate-800 text-white font-bold shadow-sm active:scale-[0.98]"
            >
              <span>Sign in to LOOP</span>
              <ArrowRight size={15} />
            </Button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-violet-200/60 text-xs font-bold text-violet-900">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-violet-700" />
                <span>Demo Accounts (1-Click Fill)</span>
              </span>
              <span className="text-[10px] font-black uppercase text-violet-600">Password: LoopDemo@2026</span>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@loop.demo')}
                className={`rounded-xl border p-2 text-center transition-all text-xs font-bold ${
                  email === 'admin@loop.demo'
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300'
                }`}
              >
                <div className="text-[10px] uppercase font-black opacity-80">Admin</div>
                <div className="truncate text-[11px]">admin@</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('analyst@loop.demo')}
                className={`rounded-xl border p-2 text-center transition-all text-xs font-bold ${
                  email === 'analyst@loop.demo'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="text-[10px] uppercase font-black opacity-80">Analyst</div>
                <div className="truncate text-[11px]">analyst@</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('viewer@loop.demo')}
                className={`rounded-xl border p-2 text-center transition-all text-xs font-bold ${
                  email === 'viewer@loop.demo'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-black opacity-80">Viewer</div>
                <div className="truncate text-[11px]">viewer@</div>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500 font-medium">
            Need a new workspace?{' '}
            <Link href="/signup" className="font-bold text-violet-700 hover:text-violet-900 transition-colors">
              Create a workspace
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
