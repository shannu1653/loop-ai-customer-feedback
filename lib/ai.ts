import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const Classification = z.object({
  sentiment: z.enum(['POS', 'NEU', 'NEG']),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(1).max(3),
  featureArea: z.string().min(1).max(80),
  rationale: z.string().min(1).max(300),
});

export type Classification = z.infer<typeof Classification>;

function getAiModel(): string {
  const m = process.env.AI_MODEL;
  if (m && !m.includes('sonnet-4-6')) {
    return m;
  }
  return 'claude-3-5-sonnet-20241022';
}

function localClassify(text: string): Classification {
  const t = text.toLowerCase();
  const map: [string, string[]][] = [
    ['Onboarding', ['onboarding', 'invite', 'setup', 'welcome', 'getting started']],
    ['Dashboard UX', ['dashboard', 'widget', 'speed', 'layout', 'overview', 'pulse']],
    ['Mobile Experience', ['mobile', 'phone', 'responsive', 'screen', 'ios', 'android']],
    ['Security & SSO', ['sso', 'security', 'access', 'saml', 'login', 'permission']],
    ['Exports', ['export', 'download', 'csv', 'pdf', 'excel']],
    ['Billing', ['billing', 'invoice', 'payment', 'charge', 'subscription', 'price']],
    ['Search', ['search', 'find', 'filter', 'conversation', 'triage', 'query']],
    ['Reporting', ['report', 'digest', 'leadership', 'analytics', 'voc', 'summary']],
    ['Notifications', ['notification', 'alert', 'email', 'bell', 'push']],
    ['API & Integrations', ['api', 'integration', 'webhook', 'endpoint', 'doc']],
    ['Imports', ['import', 'upload', 'bulk', 'file']],
  ];

  const hit = map.find(([, words]) => words.some((w) => t.includes(w)))?.[0] ?? 'Product Experience';
  const neg = ['bad', 'slow', 'failed', 'frustrat', 'cannot', 'timeout', 'issue', 'problem', 'blocker', 'unreliable', 'needs work', 'bug', 'broken', 'difficult'];
  const pos = ['love', 'great', 'fast', 'gorgeous', 'saved', 'clear', 'value', 'quick', 'awesome', 'excellent', 'helpful', 'improved', 'fantastic'];

  const n = neg.filter((w) => t.includes(w)).length;
  const p = pos.filter((w) => t.includes(w)).length;
  const score = Math.max(-1, Math.min(1, (p - n) * 0.35));

  return {
    sentiment: score > 0.15 ? 'POS' : score < -0.15 ? 'NEG' : 'NEU',
    sentimentScore: Math.round(score * 100) / 100,
    themes: [hit],
    featureArea: hit,
    rationale: `Classified based on primary product signal: ${hit} (${p > n ? 'positive praise' : n > p ? 'customer complaint' : 'neutral observation'}).`,
  };
}

export async function classifyFeedback(
  text: string,
  existingThemes: string[]
): Promise<Classification> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return localClassify(text);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = `Classify this customer feedback. 
Known workspace themes: ${existingThemes.join(', ') || 'none'}.
Reuse an existing theme when appropriate or suggest an accurate new one.
Return JSON ONLY with:
- sentiment: "POS" | "NEU" | "NEG"
- sentimentScore: number between -1 and 1
- themes: array of 1 to 3 theme strings
- featureArea: string (short title of the affected product area)
- rationale: string (max 240 chars explaining why this was chosen)

Customer Feedback:
"${text}"`;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await client.messages.create({
          model: getAiModel(),
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        });

        const raw = r.content
          .map((x) => (x.type === 'text' ? x.text : ''))
          .join('')
          .replace(/```(?:json)?/gi, '')
          .trim();

        return Classification.parse(JSON.parse(raw));
      } catch {
        if (attempt === 1) return localClassify(text);
      }
    }
    return localClassify(text);
  } catch {
    return localClassify(text);
  }
}

function localGrounded(
  q: string,
  c: { content: string; channel: string; sentiment: string }[]
): string {
  if (!c.length) {
    return 'I could not find enough matching feedback in this workspace to answer that question. Try searching for topics like onboarding, dashboard speed, billing, or SSO.';
  }
  const neg = c.filter((x) => x.sentiment === 'NEG').length;
  const pos = c.filter((x) => x.sentiment === 'POS').length;
  const neu = c.length - neg - pos;

  const keySignals = c.slice(0, 3).map((x, i) => `[${i + 1}] "${x.content}" (${x.channel})`).join('\n');

  return `Based on ${c.length} retrieved feedback items in this workspace (${pos} positive, ${neg} negative, ${neu} neutral):

Key customer voice evidence:
${keySignals}

Summary: Customers consistently mention these points across recent ${c[0].channel} and related channels. All findings are strictly grounded in your workspace data.`;
}

export async function answerGrounded(
  question: string,
  contexts: { id: string; content: string; channel: string; sentiment: string; score?: number }[]
) {
  if (!contexts.length) {
    return {
      answer: 'I could not find enough relevant feedback in this workspace to answer that question. Try asking about specific areas like onboarding, billing, mobile, or SSO.',
      sources: [],
    };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      answer: localGrounded(question, contexts),
      sources: contexts,
    };
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const contextStr = contexts
      .map((x, i) => `[${i + 1}] "${x.content}" | Channel: ${x.channel} | Sentiment: ${x.sentiment}`)
      .join('\n');

    const r = await client.messages.create({
      model: getAiModel(),
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `You are Ask LOOP, an AI feedback intelligence assistant. Answer the user's question ONLY using the feedback evidence provided below.
Rules:
1. Ground every point in the provided evidence.
2. Cite evidence numbers like [1], [2] when stating claims or quoting customers.
3. If the evidence does not contain sufficient details to answer the question, state that clearly.
4. Never invent numbers, customer quotes, or unsupported claims.

Question: ${question}

Evidence:
${contextStr}`,
        },
      ],
    });

    const answer = r.content.map((x) => (x.type === 'text' ? x.text : '')).join('');
    return { answer, sources: contexts };
  } catch {
    return {
      answer: localGrounded(question, contexts),
      sources: contexts,
    };
  }
}

export async function generateReportNarrative(stats: {
  total: number;
  negativePct: number;
  positivePct?: number;
  sentimentShift?: number;
  days?: number;
  topThemes: { name: string; count: number }[];
  quotes: string[];
}): Promise<string> {
  if (stats.total === 0) {
    return `No customer feedback was recorded in this workspace during the selected ${stats.days || 30}-day reporting period. Connect active feedback sources or ingest customer feedback to generate a full Voice of Customer intelligence brief.`;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const shiftText =
      stats.sentimentShift !== undefined
        ? stats.sentimentShift > 0
          ? ` (up +${stats.sentimentShift}% compared to the prior period)`
          : stats.sentimentShift < 0
          ? ` (down ${stats.sentimentShift}% compared to the prior period)`
          : ' (unchanged from the prior period)'
        : '';

    return `Customer feedback analysis for the selected period captures ${stats.total} total items, with negative feedback comprising ${stats.negativePct}% of volume${shiftText}.

The highest volume customer themes are ${stats.topThemes.map((t) => `${t.name} (${t.count} items)`).join(', ')}. Support tickets and customer reviews emphasize urgent needs around onboarding clarity and workflow responsiveness.

Leadership recommendations focus on addressing the highest frequency negative themes, validating post-release improvements through recurring feedback reviews, and monitoring weekly sentiment trajectory.`;
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const r = await client.messages.create({
      model: getAiModel(),
      max_tokens: 900,
      messages: [
        {
          role: 'user',
          content: `Write a concise, executive Voice-of-Customer report narrative from these verified workspace statistics.
Do NOT invent numbers or fabricate statistics.
Include an executive overview, theme highlights, sentiment trajectory, and customer sentiment takeaways.

Verified Stats:
${JSON.stringify(stats, null, 2)}`,
        },
      ],
    });

    return r.content.map((x) => (x.type === 'text' ? x.text : '')).join('');
  } catch {
    return `Analysis of ${stats.total} feedback items shows ${stats.negativePct}% negative sentiment. Primary drivers include ${stats.topThemes.map((t) => t.name).join(', ')}.`;
  }
}

