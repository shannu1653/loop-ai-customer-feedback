import { db } from './db';

function vectorize(text: string): number[] {
  const vec = Array.from({ length: 64 }, () => 0);
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  for (const w of words) {
    let h = 0;
    for (let i = 0; i < w.length; i++) {
      h = ((h << 5) - h + w.charCodeAt(i)) | 0;
    }
    vec[Math.abs(h) % 64] += 1;
  }
  const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
  return vec.map((v) => v / norm);
}

function cosine(a: number[], b: number[]): number {
  let s = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    s += a[i] * b[i];
  }
  return s;
}

export async function retrieveFeedback(
  workspaceId: string,
  question: string,
  k = 8
) {
  const q = vectorize(question);

  const rows = await db.feedback.findMany({
    where: { workspaceId },
    include: { embedding: true },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const scored = rows
    .map((r) => {
      const vector = r.embedding?.vector as number[] | undefined;
      const score =
        vector && Array.isArray(vector) ? cosine(q, vector) : 0;

      return { r, score };
    })
    .filter((item) => item.score > 0.05)
    .sort((a, b) => b.score - a.score);

  // Prevent identical feedback text from occupying all evidence slots.
  const seenContent = new Set<string>();

  const diverse = scored.filter(({ r }) => {
    const normalized = r.content
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (seenContent.has(normalized)) {
      return false;
    }

    seenContent.add(normalized);
    return true;
  });

  return diverse.slice(0, k).map(({ r, score }) => ({
    id: r.id,
    content: r.content,
    channel: r.channel,
    sentiment: r.sentiment,
    score: Math.round(score * 100) / 100,
  }));
}

export async function createEmbedding(feedbackId: string, text: string) {
  const v = vectorize(text);
  await db.embedding.upsert({
    where: { feedbackId },
    create: { feedbackId, vector: v },
    update: { vector: v },
  });
}
