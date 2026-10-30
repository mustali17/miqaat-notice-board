# PROMPT.md

AI tool used: **Claude Code** (inside this repo, so it could read the assignment, edit files and run tests/build).

## 1. Read the assignment and build the required part

> I got this frontend assignment (`Frontend Practical Task - Miqaat Notice Board.docx`). Read it fully first and tell me
> anything that's unclear. Then build the whole required part: React + TypeScript (strict, no `any`) + Vite + Tailwind 4 +
> zod 3 + React Hook Form + Vitest. Follow the file layout in section 6 exactly, use the exact text and error messages from
> the document, and follow their rules: no `fetch` inside components, types come from zod with `z.infer`, Tailwind classes
> only, notice id as list key. Write the form schema tests too. When done, run the tests, type-check and build, and tell me
> honestly what passed.

**What came out of it:** it spotted that TypeScript had to be 5.x (npm installs 7 by default) and that the "High priority
needs a link" rule was only an optional extra. It also found a test problem (the DOM wasn't cleaned between tests) and fixed it.

## 2. Make it work at scale, and finish the optional extras

> Is section 8 (optional extras) fully done? I also want this to hold up with 100,000 users. Don't code yet, tell me what
> you'd change and what's over-engineering for a 45-minute task, and I'll pick.

> Do it. (TanStack Query, MSW for GET/POST, search debounce, memoised cards, delete with confirm, code-splitting. No
> virtualisation.)

**What came out of it:** server-side search, priority filter and pagination ("Load more"), a cached query layer, a mock API
with MSW (GET, POST, DELETE), debounced search, and a delete confirm dialog. The form stays open with an error if saving fails.

## 3. Prove it works

> Rewrite the component tests to run against the MSW mock API and make unhandled requests fail the test. Cover search,
> filter, empty / error / no-results states, pagination, add (with validation) and delete. Then start the app, drive it in
> headless Chrome and check the real flow and layout with screenshots.

**What came out of it:** 23 passing tests. It also caught that MSW 3 had renamed an option (`onUnhandledFrame`), which had
been silently ignored before. The real browser run confirmed the whole flow.

## 4. README

> Write a short README: how to run the app and tests, what's finished and skipped, how it's built for scale, which AI
> tools I used with the best prompts, and what I'd improve with more time.
