import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, canAdmin } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const MemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
  name: z.string().optional(),
});

export async function GET() {
  try {
    const u = await requireUser();
    const members = await db.user.findMany({
      where: { workspaceId: u.workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ members });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'Unauthorized' : 'Failed to load members' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    if (!canAdmin(u.role)) {
      return NextResponse.json({ error: 'Only admins can manage members' }, { status: 403 });
    }

    const body = MemberSchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.workspaceId !== u.workspaceId) {
        return NextResponse.json(
          { error: 'User already belongs to another workspace. Cross-tenant reassignment is forbidden.' },
          { status: 400 }
        );
      }

      await db.user.update({
        where: { id: existing.id },
        data: { role: body.role as any },
      });

      return NextResponse.json({ message: `Updated role for ${existing.name || email} to ${body.role}` });
    }

    const defaultPassword = await bcrypt.hash('LoopDemo@2026', 12);
    const newMember = await db.user.create({
      data: {
        name: body.name?.trim() || email.split('@')[0],
        email,
        passwordHash: defaultPassword,
        role: body.role as any,
        workspaceId: u.workspaceId,
      },
    });

    return NextResponse.json({
      message: `Member ${newMember.email} added successfully`,
      member: { id: newMember.id, email: newMember.email, role: newMember.role },
    });
  } catch (e: any) {
    const isAuth = e?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: isAuth ? 'Unauthorized' : e?.issues?.[0]?.message || e?.message || 'Failed to update member' },
      { status: isAuth ? 401 : 400 }
    );
  }
}

