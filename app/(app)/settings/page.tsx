"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { AppShellClient } from '@/components/client-shell';
import { Button, Card, Badge } from '@/components/ui';
import {
  Users,
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  Building2,
  Mail,
  User,
  Shield,
  Clock,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  Key,
  Layers,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function Settings() {
  const { data: session } = useSession();
  const u = session?.user as any;
  const userRole = u?.role || 'VIEWER';
  const userName = u?.name || 'User';
  const userEmail = u?.email || '';
  const workspaceName = u?.workspaceName || 'Northstar Labs';
  const isAdmin = userRole === 'ADMIN';

  const [d, setD] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ANALYST');
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/members');
      if (r.ok) {
        setD(await r.json());
      }
    } catch {
      // keep existing state on error
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!isAdmin) {
      setMsg('Only administrators can manage workspace members and roles.');
      setIsError(true);
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setMsg('Please enter a valid email address.');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMsg('');
    setIsError(false);
    try {
      const r = await fetch('/api/members', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const x = await r.json();
      if (!r.ok || x.error) {
        setMsg(x.error || 'Failed to update member.');
        setIsError(true);
      } else {
        setMsg(x.message || 'Member role updated successfully.');
        setIsError(false);
        setEmail('');
        load();
      }
    } catch {
      setMsg('Failed to update member due to a network error.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  const roleCounts = useMemo(() => {
    const members = d?.members || [];
    const admins = members.filter((m: any) => m.role === 'ADMIN').length;
    const analysts = members.filter((m: any) => m.role === 'ANALYST').length;
    const viewers = members.filter((m: any) => m.role === 'VIEWER').length;
    return { admins, analysts, viewers, total: members.length };
  }, [d]);

  return (
    <AppShellClient
      title="Workspace Settings"
      subtitle="Manage workspace identity, team permissions, security roles, and account configuration"
    >
      <div className="space-y-6">
        {/* 0. Context Header Strip */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs lg:flex-row lg:items-center">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600/10 text-violet-600 border border-violet-200/60 shadow-xs">
              <Shield size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-violet-700 uppercase bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                  Workspace Administration
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Tenant Isolated
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Workspace configuration and role-based access control (RBAC) for{' '}
                <strong className="font-bold text-slate-800">{workspaceName}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <Button
              onClick={load}
              variant="outline"
              size="sm"
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
            >
              <RefreshCw size={13} className={initialLoading ? 'animate-spin text-violet-600' : 'text-slate-500'} />
              <span>Refresh Members</span>
            </Button>
          </div>
        </div>

        {/* 1. Workspace Identity & Account Profile Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Workspace Identity Card */}
          <Card className="flex flex-col justify-between p-6 shadow-card hover:border-slate-300/80 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-700 border border-violet-100 shadow-xs">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Workspace Identity</h3>
                    <p className="text-[11px] font-medium text-slate-500">Active enterprise tenant</p>
                  </div>
                </div>
                <Badge tone="violet" variant="subtle">Enterprise</Badge>
              </div>

              <div className="mt-5 space-y-3.5">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Workspace Name
                  </div>
                  <div className="mt-1 text-lg font-black text-slate-900">{workspaceName}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    <Users size={12} className="text-slate-500" />
                    {roleCounts.total} Total Members
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                    {roleCounts.admins} Admins
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    {roleCounts.analysts} Analysts
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {roleCounts.viewers} Viewers
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                <ShieldCheck size={13} /> Strict Tenant Partitioning
              </span>
              <span>All telemetry encrypted</span>
            </div>
          </Card>

          {/* Account Profile Card */}
          <Card className="flex flex-col justify-between p-6 shadow-card hover:border-slate-300/80 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#17152b] text-white text-xs font-black shadow-xs">
                    {userName[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Your Account Profile</h3>
                    <p className="text-[11px] font-medium text-slate-500">Authenticated user identity</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    userRole === 'ADMIN'
                      ? 'bg-violet-50 text-violet-700 border-violet-200'
                      : userRole === 'ANALYST'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {userRole} Role
                </span>
              </div>

              <div className="mt-5 space-y-3.5">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Full Name
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{userName}</div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Email Address
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-600 font-mono">
                    {userEmail || 'Signed in via Credentials'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>NextAuth Enterprise Session</span>
              <span className="text-emerald-600 font-semibold">Active & Verified</span>
            </div>
          </Card>
        </div>

        {/* 2. Team Members & Invite / RBAC Grid */}
        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          {/* Members Table Card */}
          <Card className="p-6 shadow-card hover:border-slate-300/80 transition-all duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Workspace Members
                  </h3>
                  <Badge tone="violet" variant="subtle">
                    {roleCounts.total} Registered
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Users with authorized access to customer intelligence and feedback triage.
                </p>
              </div>
              <Users size={18} className="text-violet-600" />
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {initialLoading ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 rounded bg-slate-200/70" />
                        <div className="h-3 w-44 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="h-6 w-16 rounded-full bg-slate-100" />
                  </div>
                ))
              ) : d?.members?.length > 0 ? (
                d.members.map((m: any) => {
                  const isCurrent = m.email === userEmail;
                  const isAdm = m.role === 'ADMIN';
                  const isAna = m.role === 'ANALYST';

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 transition hover:bg-slate-50/70 rounded-xl px-2.5 -mx-2.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black shadow-xs ${
                          isAdm
                            ? 'bg-violet-600 text-white'
                            : isAna
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-white'
                        }`}>
                          {m.name?.[0]?.toUpperCase() || m.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {m.name || 'Team Member'}
                            </span>
                            {isCurrent && (
                              <span className="rounded bg-violet-100 px-1.5 py-0.2 text-[9px] font-black uppercase text-violet-700">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{m.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {m.createdAt && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock size={11} />
                            {new Date(m.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            isAdm
                              ? 'bg-violet-50 text-violet-700 border-violet-200'
                              : isAna
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {m.role}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No members found in this workspace.
                </div>
              )}
            </div>
          </Card>

          {/* Invite & Role Assignment Panel */}
          <div className="space-y-6">
            <Card className="p-6 shadow-card hover:border-slate-300/80 transition-all duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-700 border border-violet-100 shadow-xs">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Invite / Update Role</h3>
                    <p className="text-[11px] font-medium text-slate-500">RBAC assignment</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Admin Only
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                {isAdmin
                  ? 'Enter a teammate’s email to invite them to this workspace or update their access role.'
                  : 'Administrator privileges are required to invite new users or reassign workspace roles.'}
              </p>

              {!isAdmin && (
                <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs font-medium text-amber-900">
                  <ShieldAlert size={16} className="shrink-0 text-amber-600" />
                  <span>
                    Read-only access: Your current role (<strong>{userRole}</strong>) cannot modify members.
                  </span>
                </div>
              )}

              <div className="mt-5 space-y-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    User Email Address
                  </label>
                  <div className="mt-1.5 relative flex items-center">
                    <Mail size={14} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      value={email}
                      disabled={!isAdmin}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className={`w-full rounded-xl border pl-9 pr-3.5 py-2.5 text-xs font-medium outline-none transition-all duration-150 ${
                        !isAdmin
                          ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                          : 'bg-white text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 border-slate-200/90 shadow-xs'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Assigned Role & Permissions
                  </label>
                  <div className="mt-1.5 relative">
                    <select
                      value={role}
                      disabled={!isAdmin}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none transition-all duration-150 ${
                        !isAdmin
                          ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                          : 'bg-white text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 border-slate-200/90 shadow-xs'
                      }`}
                    >
                      <option value="ANALYST">ANALYST — Triage, Classify & Generate VoC Briefs</option>
                      <option value="VIEWER">VIEWER — Read-only Intelligence Access</option>
                      <option value="ADMIN">ADMIN — Full Workspace & User Management</option>
                    </select>
                  </div>
                </div>

                <Button
                  disabled={!isAdmin || loading}
                  loading={loading}
                  onClick={add}
                  variant="primary"
                  size="md"
                  className={`w-full font-bold shadow-xs ${
                    !isAdmin
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200'
                      : 'bg-[#17152b] hover:bg-slate-800 text-white active:scale-[0.98]'
                  }`}
                >
                  <UserPlus size={15} />
                  <span>Assign / Update Member Role</span>
                </Button>
              </div>

              {msg && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-2xl border p-3 text-xs font-bold animate-slide-up ${
                    isError
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                  <span>{msg}</span>
                </div>
              )}
            </Card>

            {/* Enterprise RBAC Reference Matrix */}
            <Card className="p-5 bg-gradient-to-br from-slate-50 to-white border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200/60">
                <Lock size={14} className="text-violet-600" />
                <span>RBAC Permission Matrix</span>
              </div>
              <div className="mt-3 space-y-2.5 text-[11px] text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-violet-700 min-w-14">ADMIN:</span>
                  <span>Full control over workspace members, feedback ingestion, AI reports & deletion.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700 min-w-14">ANALYST:</span>
                  <span>Ingest customer feedback, trigger AI re-classifications, generate VoC reports & query Ask LOOP.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-600 min-w-14">VIEWER:</span>
                  <span>Read-only analytics access to Dashboard, Inbox, Trends, and saved VoC Reports.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShellClient>
  );
}
