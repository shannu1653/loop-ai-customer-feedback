import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const u = await requireUser();

    const now = new Date();
    const periodDays = 14;
    const currentPeriodStart = new Date(now.getTime() - periodDays * 864e5);
    const priorPeriodStart = new Date(now.getTime() - periodDays * 2 * 864e5);

    // Fetch themes with feedback counts and recent feedback items
    const themes = await db.theme.findMany({
      where: { workspaceId: u.workspaceId },
      include: {
        _count: {
          select: { feedback: true },
        },
        feedback: {
          include: {
            feedback: {
              select: {
                createdAt: true,
                sentiment: true,
              },
            },
          },
        },
      },
      orderBy: { feedback: { _count: 'desc' } },
      take: 50,
    });

    const topThemes = themes.map((t) => {
      const allFeedback = t.feedback.map((ft) => ft.feedback);
      const recent = allFeedback.filter(
        (f) => new Date(f.createdAt) >= currentPeriodStart && new Date(f.createdAt) <= now
      );
      const prior = allFeedback.filter(
        (f) => new Date(f.createdAt) >= priorPeriodStart && new Date(f.createdAt) < currentPeriodStart
      );

      const recentCount = recent.length;
      const priorCount = prior.length;

      let spike = 0;
      if (priorCount > 0) {
        spike = Math.round(((recentCount - priorCount) / priorCount) * 100);
      } else if (recentCount > 0) {
        spike = Math.min(100, recentCount * 25);
      }

      const negCount = allFeedback.filter((f) => f.sentiment === 'NEG').length;
      const negPct = allFeedback.length > 0 ? Math.round((negCount / allFeedback.length) * 100) : 0;

      return {
        id: t.id,
        name: t.name,
        description: t.description || `Customer voice related to ${t.name.toLowerCase()}`,
        count: t._count.feedback,
        recentCount,
        priorCount,
        spike,
        negPct,
      };
    });

    // 8-week timeline
    const allRows = await db.feedback.findMany({
      where: { workspaceId: u.workspaceId },
      select: { createdAt: true },
    });

    const weeks = Array.from({ length: 8 }, (_, i) => {
      const end = new Date(now);
      end.setDate(now.getDate() - (7 - i) * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const weekFeedback = allRows.filter(
        (r) => new Date(r.createdAt) >= start && new Date(r.createdAt) <= end
      );

      const monthLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        label: monthLabel,
        total: weekFeedback.length,
      };
    });

    return NextResponse.json({
      topThemes,
      timeline: weeks,
    });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Failed to load trends';
    const isAuthError = errorMsg === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: isAuthError ? 'Unauthorized' : 'Failed to load trends' },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

