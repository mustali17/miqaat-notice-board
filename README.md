# Miqaat Notice Board

Notice Board module for the RMS admin console. React 19 + TypeScript (strict) + Vite + Tailwind CSS 4 + zod 3 + React Hook Form + Vitest.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # Vitest (schema tests + component tests)
npm run build   # type-check + production build
```

Tip: change a notice's `priority` to `"urgent"` in `public/notices.json` to see the error state (the mock API then answers 500).

## Structure

```
public/notices.json                      sample data (seed for the mock API)
src/api/notices.schema.ts                zod schemas + types (z.infer)
src/api/notices.api.ts                   fetch page / create / delete; status check + zod validation
src/api/useNotices.ts                    TanStack Query hook: paginated, cached, filter-aware
src/api/useNoticeMutations.ts            create / delete mutations (invalidate the cache)
src/mocks/                               MSW handlers: GET (search, priority, cursor), POST, DELETE
src/features/notices/                    NoticeBoard, NoticeCard, PriorityBadge, NoticeListStates, AddNoticeForm, ConfirmDeleteDialog
src/features/notices/addNotice.schema.ts form schema (+ .test.ts)
```

## Data flow

There is no backend. [MSW](https://mswjs.io) answers `/api/notices` in the browser (and in Vitest), seeded from
`/notices.json` and validated with zod. The UI only talks to `src/api`, so replacing the mock with a real API means
deleting the `enableMockApi()` call in `src/main.tsx` and nothing else.

## What I finished

- **Required (F1–F7):** zod-validated loading, newest-first cards, live case-insensitive title search, priority filter
  (combined, count updates), add-notice form with every validation rule, loading / empty / error / no-results states,
  schema unit tests.
- **Optional extras:** High priority needs a link; TanStack Query; MSW mock API (GET + POST + DELETE); delete with a
  confirm step; phone-friendly layout; React Testing Library tests (23 tests in total).

## Built for scale

The page should keep working with a very large number of notices and a very large number of admins/participants:

- **Server-side filtering and pagination.** Search, priority and cursor are query parameters; the browser only ever holds
  the pages it loaded (20 per page, "Load more"). The "Showing N notices" count is the server's total, not the loaded length.
- **TanStack Query cache.** Each filter combination is cached (30 s stale time), identical in-flight requests are
  de-duplicated, the previous list stays on screen while a new search loads, and failed requests retry once. This
  removes most repeat traffic from the API.
- **Debounced search (300 ms).** Typing "parking" sends one request, not seven; stale requests are aborted.
- **`React.memo` cards with stable `useCallback` handlers and id keys**, so typing or opening a dialog does not re-render the list.
- **Code splitting.** The add-notice form (React Hook Form + resolver) is loaded on first click.
- **Server stays the source of truth.** Create/delete invalidate the cache and refetch; the mock server re-validates
  POST bodies with the same zod schema the form uses.
- **Deployment note (not implemented here).** The built app is static assets, so serve it from a CDN with
  `Cache-Control: public, max-age=31536000, immutable` on the hashed `/assets/*` files and `no-cache` on `index.html`.
  A real API should use cursor pagination with an index on `(publishedAt, id)` and cache GETs at the edge.

## What I skipped

- Virtualised rendering (not needed with 20-item pages), real-time updates, optimistic updates, persistent storage
  (the mock database lives in memory and resets on refresh).

## AI tools used

Claude Code (Claude Sonnet 5.5). The full prompt log is in [PROMPT.md](./PROMPT.md). The most useful ones:

1. *"Read the assignment docx fully. Before writing code, list required stack, file layout, every user-facing string, F1–F7 and the project rules. Flag anything ambiguous."* — caught that TS must be 5.x and that the high-priority link rule is optional.
2. *"Write addNotice.schema.ts with exact error messages … then write tests covering valid, empty title, >80, <10 message, invalid/empty link, javascript: link."*
3. *"Add RTL tests with mocked fetch: search filters live, search+filter combine, invalid data → error state, add-notice puts the new notice on top."*

## With more time

- Focus trap and focus restore for the slide-over; a proper dialog primitive.
- Because zod runs object-level `superRefine` only after field checks pass, the "High priority needs a link" message appears
  once the other fields are valid; restructuring the schema would show it at the same time as the other errors.
- TanStack Query + MSW for a real GET/POST flow, delete with confirm, and persistent storage.
