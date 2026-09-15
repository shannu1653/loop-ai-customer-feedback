"use client";

import { useEffect, useState } from 'react';
import { AppShellClient } from '@/components/client-shell';
import { Button, Card, Badge } from '@/components/ui';
import { Users, ShieldCheck, UserPlus, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function Settings() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'VIEWER';
  const isAdmin = userRole === 'ADMIN';

  const [d, setD] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ANALYST');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const r = await fetch('/api/members');
      if (r.ok) {
        setD(await r.json());
      }
    } catch {
      // handle error
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!isAdmin) {
      setMsg('Only administrators can manage workspace members and roles.');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const r = await fetch('/api/members', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const x = await r.json();
      setMsg(x.message || x.error);
      if (r.ok) {
        setEmail('');
        load();
      }
    } catch {
      setMsg('Failed to update member.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShellClient title="Workspace" subtitle="Members, roles and tenant settings">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900">Workspace members</h2>
              <p className="text-xs text-slate-500">Admin-only role management.</p>
            </div>
            <Users className="text-violet-600" />
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {d?.members?.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm font-bold text-slate-900">{m.name}</div>
                  <div className="text-xs text-slate-400">{m.email}</div>
                </div>
                <Badge tone={m.role === 'ADMIN' ? 'violet' : m.role === 'ANALYST' ? 'green' : 'gray'}>
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="h-fit">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
            <UserPlus size={18} />
          </div>
          <h2 className="mt-4 font-black text-slate-900">Invite / assign role</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {isAdmin
              ? 'Add a new member or update existing roles within your workspace.'
              : 'Admin permissions are required to invite members or modify roles.'}
          </p>

          {!isAdmin && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800 border border-amber-200/60">
              <ShieldAlert size={16} className="shrink-0 text-amber-600" />
              <span>Read-only access: Your role ({userRole}) cannot manage workspace members.</span>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <input
              value={email}
              disabled={!isAdmin}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@email.com"
              className={`w-full rounded-xl border p-3 text-sm outline-none ${
                !isAdmin
                  ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                  : 'bg-white text-slate-800 focus:border-violet-400 border-slate-200'
              }`}
            />
            <select
              value={role}
              disabled={!isAdmin}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full rounded-xl border p-3 text-sm outline-none ${
                !isAdmin
                  ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                  : 'bg-white text-slate-800 focus:border-violet-400 border-slate-200'
              }`}
            >
              <option value="ANALYST">ANALYST</option>
              <option value="VIEWER">VIEWER</option>
            </select>
            <Button
              disabled={!isAdmin || loading}
              loading={loading}
              onClick={add}
              className={`w-full ${
                !isAdmin
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed hover:bg-slate-200'
                  : 'bg-[#17152b] text-white hover:bg-slate-800'
              }`}
            >
              Assign role
            </Button>
          </div>

          {msg && <p className="mt-3 text-xs font-semibold text-slate-600">{msg}</p>}

          <div className="mt-6 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
            <ShieldCheck size={14} className="mb-1 inline mr-1" />
            Every tenant-owned query is scoped to the signed-in workspace.
          </div>
        </Card>
      </div>
    </AppShellClient>
  );
}

