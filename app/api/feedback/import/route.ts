import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, canWrite } from '@/lib/auth';
import Papa from 'papaparse';
import { classifyFeedback } from '@/lib/ai';
import { createEmbedding } from '@/lib/retrieval';

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    if (!canWrite(u.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fd = await req.formData();
    const file = fd.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Valid CSV file is required' }, { status: 400 });
    }

    const text = await file.text();
    if (!text.trim()) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim().toLowerCase().replace(/[\s_-]+/g, '_'),
    });

    if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json(
        { error: `CSV parsing error: ${parsed.errors[0].message}` },
        { status: 400 }
      );
    }

    const existingThemes = await db.theme.findMany({
      where: { workspaceId: u.workspaceId },
      select: { name: true },
    });
    const themeNames = existingThemes.map((x) => x.name);

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];
    const rows = parsed.data.slice(0, 250);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // header is row 1

      // Support flexible column names
      const content = (row.content || row.feedback || row.text || row.comment || '').trim();
      const channel = (row.channel || row.source || row.medium || 'CSV Import').trim();
      const customerLabel = (row.customer_label || row.customer || row.user || '').trim() || null;
      const rawDate = row.created_at || row.date || row.timestamp;

      let createdAt = new Date();
      if (rawDate) {
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
          createdAt = parsedDate;
        }
      }

      if (!content || content.length < 3) {
        failed++;
        errors.push(`Row ${rowNum}: Feedback content is missing or too short`);
        continue;
      }

      try {
        const c = await classifyFeedback(content, themeNames);
        const f = await db.feedback.create({
          data: {
            content,
            channel,
            customerLabel,
            createdAt,
            sentiment: c.sentiment as any,
            sentimentScore: c.sentimentScore,
            featureArea: c.featureArea,
            aiRationale: c.rationale,
            workspaceId: u.workspaceId,
          },
        });

        for (const name of c.themes) {
          const t = await db.theme.upsert({
            where: { workspaceId_name: { workspaceId: u.workspaceId, name } },
            create: {
              workspaceId: u.workspaceId,
              name,
              description: `Customer feedback related to ${name.toLowerCase()}.`,
            },
            update: {},
          });

          await db.feedbackTheme.create({
            data: {
              feedbackId: f.id,
              themeId: t.id,
              confidence: 0.9,
            },
          });
        }

        await createEmbedding(f.id, f.content);
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${rowNum}: ${err?.message || 'Failed to persist record'}`);
      }
    }

    return NextResponse.json({
      message: `CSV import completed: ${imported} imported, ${failed} failed.`,
      totalRows: rows.length,
      imported,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'Unauthorized' : e.message || 'Import failed' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 400 }
    );
  }
}
