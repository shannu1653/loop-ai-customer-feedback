import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const u = await requireUser();
    const rows = await db.feedback.findMany({
      where: { workspaceId: u.workspaceId },
      select: { createdAt: true, sentiment: true },
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - (13 - i)
        )
      );
      const key = d.toISOString().slice(0, 10);
      const r = rows.filter(
        (x) => new Date(x.createdAt).toISOString().slice(0, 10) === key
      );
      return { date: key.slice(5), total: r.length };
    });

    const pos = rows.filter((x) => x.sentiment === 'POS').length;
    const neu = rows.filter((x) => x.sentiment === 'NEU').length;
    const neg = rows.filter((x) => x.sentiment === 'NEG').length;

    const themes = await db.theme.findMany({
      where: { workspaceId: u.workspaceId },
      include: { _count: { select: { feedback: true } } },
      orderBy: { feedback: { _count: 'desc' } },
      take: 6,
    });

    return NextResponse.json({
      volume: days,
      sentiment: [
        { name: 'Positive', value: pos },
        { name: 'Neutral', value: neu },
        { name: 'Negative', value: neg },
      ],
      themes: themes.map((t) => ({
        name: t.name,
        value: t._count.feedback,
      })),
    });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Failed to load analytics';
    const isAuthError = errorMsg === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: isAuthError ? 'Unauthorized' : 'Failed to load analytics' },
      { status: isAuthError ? 401 : 500 }
    );
  }
}


