# LOOP — AI Customer Feedback Intelligence Platform

LOOP is a corporate-style, multi-tenant SaaS application for turning customer feedback into sentiment, themes, trends, grounded AI answers and Voice-of-Customer reports. This implementation follows the Zidio Project LOOP brief: Next.js 14 + TypeScript + Tailwind CSS + PostgreSQL + Prisma + NextAuth + Claude + Recharts + Zod.

> **Source alignment:** the brief requires tenant isolation, three roles, single/CSV/simulated ingestion, a paginated/filterable inbox, three real-data dashboard charts, four AI features, deployment, README and demo credentials. See the project brief pages 6–19. fileciteturn0file0L165-L211

## Features

- Authentication: signup, login, logout, protected routes, persistent JWT sessions.
- Multi-tenancy: every feedback/theme/report/member query is scoped by `workspaceId`.
- RBAC: `ADMIN`, `ANALYST`, `VIEWER`; write/admin checks are enforced server-side.
- Feedback ingestion: single entry, CSV bulk import, simulated channel.
- Inbox: server-side pagination, search, channel/sentiment/status/theme filtering, inline workflow.
- Analytics: volume over time, sentiment breakdown, top themes, stat cards.
- AI1: structured Claude classification with Zod validation and stored results.
- AI2: theme assignment and trend view with spike indicators.
- AI3: Ask LOOP retrieval-grounded Q&A with evidence references.
- AI4: Voice-of-Customer report generated from computed workspace statistics, saved and printable to PDF.
- Demo seed: 144 feedback records, 11 themes, three demo users.
- UX: responsive layout, loading/empty/error states, polished cards, charts and accessible controls.

## Tech stack

Next.js 14 App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, NextAuth, Anthropic Claude, Recharts, Zod, PapaParse, Lucide.

## Local setup

Prerequisites: Node.js 18+, Git, PostgreSQL (Neon/Supabase works well), and optionally an Anthropic API key.

```bash
npm install
cp .env.example .env
# fill DATABASE_URL and NEXTAUTH_SECRET
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open `http://localhost:3000`.

### Production build

To create and run an optimized production build:

```bash
npm run build
npm start
```


### Demo credentials

All three use the same demo password. Do not reuse this password elsewhere.

| Role | Email | Password |
|---|---|---|
| Admin | admin@loop.demo | LoopDemo@2026 |
| Analyst | analyst@loop.demo | LoopDemo@2026 |
| Viewer | viewer@loop.demo | LoopDemo@2026 |

## Environment variables

- `DATABASE_URL` — PostgreSQL connection string.
- `NEXTAUTH_SECRET` — long random session secret.
- `NEXTAUTH_URL` — local or deployed app URL.
- `ANTHROPIC_API_KEY` — server-side Claude API key. Leave blank to use the deterministic local AI fallback for UI/demo development.
- `AI_MODEL` — defaults to `claude-sonnet-4-6` and can be changed without code edits.

Never commit `.env` or API keys.

## Database

The Prisma schema includes Workspace, User, Feedback, Theme, FeedbackTheme, Embedding and Report. Tenant-owned records carry `workspaceId`. The seed creates a realistic demo dataset so the dashboard is immediately usable.

The embedding table stores deterministic 64-dimensional vectors for local semantic-style retrieval. This keeps the project runnable without a second paid API. The retrieval service is intentionally isolated in `lib/retrieval.ts`, so it can be upgraded to pgvector or a hosted embedding provider without changing Ask LOOP's UI/API contract.

## AI behavior

With `ANTHROPIC_API_KEY` configured, classification, Ask LOOP and report narrative generation use Claude server-side. The browser never receives the API key. Classification requests ask for JSON and are validated before persistence. Ask LOOP retrieves relevant feedback before the model sees evidence and instructs the model to answer only from that evidence. Reports compute factual numbers in code first and ask Claude only to write narrative around them.

Without an API key, deterministic local fallbacks keep every screen functional for development and demos. For the strongest internship evaluation, configure the Anthropic key before the final demo.

## Security checklist

- Passwords hashed with bcrypt.
- Protected route middleware.
- API-side role checks.
- Workspace filter on tenant-owned reads/writes.
- Resource lookup uses both resource ID and authenticated `workspaceId`.
- API validation with Zod.
- No client-side AI key.
- `.env` ignored by Git.

## Suggested demo flow

1. Login as Admin.
2. Show dashboard stats and three charts.
3. Open Inbox, search/filter and change a feedback status.
4. Add one feedback item and show AI classification/theme assignment.
5. Import `public/demo.csv` or use the simulated channel button.
6. Open Themes & Trends and drill into a theme.
7. Ask LOOP a grounded question and show evidence cards.
8. Generate a VoC report and use **Save as PDF**.
9. Open Workspace and demonstrate the three roles.

## Deployment

Deploy the Next.js app to Vercel and PostgreSQL to Neon/Supabase. Configure the environment variables in the Vercel project settings, then run the production migration/seed against the intended database. Use a dedicated demo password that is not reused elsewhere.

## Repository hygiene

Use feature branches and meaningful commits such as:

- `feat: add tenant-aware feedback model`
- `feat: add csv ingestion and validation`
- `feat: add grounded ask loop retrieval`
- `feat: add voice of customer reports`
- `fix: enforce workspace isolation on feedback lookup`

The internship brief explicitly values readable typed code, API validation, error handling, meaningful Git history and no secrets in the repository.
