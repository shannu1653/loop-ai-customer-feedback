import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, canWrite } from '@/lib/auth';
import { generateReportNarrative } from '@/lib/ai';
import { z } from 'zod';

export async function GET() {
  try {
    const u = await requireUser();
    const reports = await db.report.findMany({
      where: { workspaceId: u.workspaceId },
      include: {
        generatedBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(JSON.parse(JSON.stringify(reports)));
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Failed to load reports';
    const isAuthError = errorMsg === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: isAuthError ? 'Unauthorized' : 'Failed to load reports' },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    if (!canWrite(u.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { days } = z
      .object({ days: z.number().min(7, 'Period must be at least 7 days').max(90, 'Period cannot exceed 90 days') })
      .parse(await req.json());

    const end = new Date();
    const start = new Date(end.getTime() - days * 864e5);
    const priorStart = new Date(start.getTime() - days * 864e5);

    const [
      total,
      neg,
      pos,
      priorTotal,
      priorNeg,
      feedback,
      themeRows,
    ] = await Promise.all([
      db.feedback.count({
        where: {
          workspaceId: u.workspaceId,
          createdAt: { gte: start, lte: end },
        },
      }),
      db.feedback.count({
        where: {
          workspaceId: u.workspaceId,
          createdAt: { gte: start, lte: end },
          sentiment: 'NEG',
        },
      }),
      db.feedback.count({
        where: {
          workspaceId: u.workspaceId,
          createdAt: { gte: start, lte: end },
          sentiment: 'POS',
        },
      }),
      db.feedback.count({
        where: {
          workspaceId: u.workspaceId,
          createdAt: { gte: priorStart, lt: start },
        },
      }),
      db.feedback.count({
        where: {
          workspaceId: u.workspaceId,
          createdAt: { gte: priorStart, lt: start },
          sentiment: 'NEG',
        },
      }),
      db.feedback.findMany({
        where: {
          workspaceId: u.workspaceId,
          createdAt: { gte: start, lte: end },
        },
        orderBy: { createdAt: 'desc' },
        take: 40,
      }),
      db.theme.findMany({
        where: { workspaceId: u.workspaceId },
        include: {
          _count: {
            select: { feedback: true },
          },
        },
        orderBy: { feedback: { _count: 'desc' } },
        take: 6,
      }),
    ]);

    const negativePct = total ? Math.round((neg / total) * 100) : 0;
    const positivePct = total ? Math.round((pos / total) * 100) : 0;
    const priorNegativePct = priorTotal ? Math.round((priorNeg / priorTotal) * 100) : negativePct;
    const sentimentShift = negativePct - priorNegativePct;

    const quotes = feedback
      .filter((f) => f.sentiment === 'NEG' || f.sentiment === 'POS')
      .slice(0, 5)
      .map((f) => f.content);

    const topThemes = total > 0
      ? themeRows.map((t) => ({
          name: t.name,
          count: t._count.feedback,
        }))
      : [];

    const stats = {
      total,
      negativePct,
      positivePct,
      sentimentShift,
      days,
      topThemes,
      quotes: quotes.length > 0 ? quotes : feedback.slice(0, 3).map((f) => f.content),
    };

    const narrative = await generateReportNarrative(stats);

    const primaryTheme = topThemes[0]?.name || 'Core Product Experience';
    const secondaryTheme = topThemes[1]?.name || 'Support & Usability';

    const actions = total > 0
      ? [
          `Prioritize engineering triage and UX refinement for top-complaint theme: "${primaryTheme}".`,
          `Review cross-functional customer feedback in "${secondaryTheme}" during weekly sprint planning.`,
          sentimentShift > 0
            ? `Investigate recent sentiment increase (+${sentimentShift}% negative shift over previous ${days} days) and deploy quick wins.`
            : `Sustain momentum on positive customer feedback while addressing recurring support tickets.`,
          `Schedule a 30-day review with product and customer success leads to validate whether feedback trajectory improves.`,
        ]
      : [
          'Connect customer feedback sources (e.g. Support tickets, Reviews, NPS surveys) to start ingesting feedback.',
          `Expand the reporting window or import historical customer feedback CSV data to populate Voice of Customer metrics.`,
        ];

    const contentJson = {
      ...stats,
      narrative,
      actions,
    };

    const report = await db.report.create({
      data: {
        title: `Voice of Customer (${days}d) · ${end.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`,
        periodStart: start,
        periodEnd: end,
        contentJson,
        workspaceId: u.workspaceId,
        generatedById: u.id,
      },
    });

    return NextResponse.json(report);
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }
    const errorMsg = e instanceof Error ? e.message : 'Report generation failed';
    const isAuthError = errorMsg === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: isAuthError ? 'Unauthorized' : errorMsg },
      { status: isAuthError ? 401 : 400 }
    );
  }
}

