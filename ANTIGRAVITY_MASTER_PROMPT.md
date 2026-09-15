# Antigravity Master Prompt — Project LOOP

You are the senior engineer taking over an existing project named **LOOP — AI Customer Feedback Intelligence Platform**.

Do not replace the project with a toy app or a new unrelated implementation. First inspect the entire repository, understand the current architecture, then improve the existing implementation in place.

## Source of truth

Use the attached/available Zidio Project LOOP brief as the product specification. The required stack is:
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- NextAuth/Auth.js
- Anthropic Claude API
- Recharts
- Zod

Required core scope:
- Multi-tenant workspaces
- ADMIN / ANALYST / VIEWER RBAC
- Single feedback ingestion
- CSV bulk import
- Simulated channel ingestion
- Search, filters, pagination and status workflow
- Dashboard with volume, sentiment and top-theme charts
- AI auto-classification
- Theme clustering/trends
- Ask LOOP grounded Q&A with evidence
- Voice-of-Customer reports with saved history and PDF/print export
- Responsive polished UI
- Loading, empty, error, 403 and 404 states
- README, seed data and secure environment handling

## Your workflow

1. Inspect every file and route before editing.
2. Run `npm install` and the project locally.
3. Run Prisma generation/migration and seed.
4. Run lint/type checks/build. Fix all errors.
5. Test authentication, logout and protected routes.
6. Test all three roles. Verify forbidden API operations return HTTP 403.
7. Audit every database query involving feedback, themes, reports and users. It MUST be scoped to the authenticated `workspaceId`.
8. Test resource access using IDs belonging to another workspace and make sure the request cannot leak data.
9. Test single ingestion, CSV import, simulated channel, classification and re-classification.
10. Test inbox search, all filters, pagination and status transitions.
11. Test all dashboard charts against seeded data and confirm they are not hard-coded.
12. Test Ask LOOP retrieval and verify the answer only uses retrieved feedback evidence. Do not allow invented quotes or unsupported numbers.
13. Test report generation, saved reports and print/PDF export.
14. Test desktop, tablet and mobile layouts.
15. Fix visual inconsistencies, spacing, typography, focus states, hover states and accessibility issues.
16. Improve loading skeletons, empty states, error states and toast/inline feedback where useful.
17. Remove placeholder text, dead buttons, fake navigation and console errors.
18. Keep secrets server-side. Never expose `ANTHROPIC_API_KEY` to client code.
19. Do not add out-of-scope features such as billing, payments, real Zendesk/App Store/Twitter integrations, native mobile apps, WebSockets/live collaboration, or email/SMS infrastructure unless absolutely required to fix a core feature.
20. Keep the current product identity and make it feel like a premium B2B SaaS product rather than a template.

## UI direction

Create a premium enterprise SaaS experience:
- dark-indigo navigation rail
- clean warm-gray application background
- white elevated cards
- violet accent system
- strong visual hierarchy
- generous but controlled spacing
- professional charts
- compact badges and status indicators
- polished forms and dialogs
- responsive mobile navigation
- consistent 12–16px radius system
- subtle motion only where it improves feedback
- accessible contrast and keyboard focus states

Dashboard should immediately communicate:
1. total feedback
2. negative rate
3. new this week
4. active themes
5. feedback volume trend
6. sentiment mix
7. top themes
8. a clear AI insight/action area

## AI quality rules

For Claude classification:
- request JSON only
- validate with Zod
- store the classification instead of recomputing on page load
- retry malformed output once
- fall back safely and flag/manual-review when needed

For Ask LOOP:
- retrieve evidence first
- answer only from retrieved evidence
- explicitly state when evidence is insufficient
- cite/list evidence items
- never fabricate feedback, customer names, counts or quotes

For reports:
- calculate all factual statistics in application code first
- pass verified numbers/evidence to Claude
- ask Claude only to write narrative around those facts
- never let the model invent metrics

## Important architecture rules

- Business logic belongs in services/lib/API route handlers, not UI components.
- Validate every API boundary with Zod.
- Avoid `any`; use explicit TypeScript types.
- Use Prisma for database access.
- Use server-side auth and role checks.
- Scope tenant-owned data by workspace on every read/write.
- Keep API contracts clean and predictable.
- Do not call Claude directly from the browser.

## Final verification

Before declaring the project finished, run:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Prisma migration/generation
- seed script

Then manually verify every route and major action.

If you discover an implementation limitation in the current code, fix it rather than merely documenting it. If an external credential is required, preserve a clean environment variable interface and provide a deterministic local fallback only where it does not weaken the production path.

At the end, provide a concise report containing:
- what you changed
- bugs fixed
- security/RBAC verification
- AI verification
- commands executed
- any remaining environment-only requirements
