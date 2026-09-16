"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { BrainCircuit, ArrowRight, Building2, User, Mail, KeyRound, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const r = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    workspace: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not create account');
        setLoading(false);
        return;
      }
      r.push('/login');
    } catch {
      setError('Failed to create workspace due to a network error.');
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#f8f9fc] p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-card animate-slide-up">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white font-black shadow-xs">
              <BrainCircuit size={19} />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-none">LOOP</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Feedback Intelligence
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
            <ShieldCheck size={11} /> Admin Setup
          </span>
        </div>

        <div className="mt-6 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Create your workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Your initial user account automatically becomes the workspace Administrator.
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Full Name
            </label>
            <div className="mt-1.5 relative flex items-center">
              <User size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Work Email
            </label>
            <div className="mt-1.5 relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                placeholder="jane@company.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Workspace / Company Name
            </label>
            <div className="mt-1.5 relative flex items-center">
              <Building2 size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                required
                type="text"
                value={form.workspace}
                onChange={(e) => setForm({ ...form, workspace: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                placeholder="Acme Corp"
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
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                placeholder="At least 6 characters"
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
            className="w-full bg-[#17152b] hover:bg-slate-800 text-white font-bold shadow-sm active:scale-[0.98] mt-2"
          >
            <span>Create Workspace & Start Free</span>
            <ArrowRight size={15} />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 font-medium">
          Already have workspace access?{' '}
          <Link href="/login" className="font-bold text-violet-700 hover:text-violet-900 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
