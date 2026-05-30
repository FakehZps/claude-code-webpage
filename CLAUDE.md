# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server on :3000
npm run build    # Production build (also validates TypeScript and static generation)
npm run start    # Serve the production build
npm test         # Run all Playwright E2E tests (auto-starts dev server if not running)
```

Run a single test file:
```bash
node_modules\.bin\playwright.cmd test tests/timeline.spec.ts --reporter=list
node_modules\.bin\playwright.cmd test tests/navigation.spec.ts --reporter=list
```

Run a single test by name:
```bash
node_modules\.bin\playwright.cmd test --grep "timeline renders" --reporter=list
```

**Playwright note:** Use `node_modules\.bin\playwright.cmd` directly (not `npx playwright`) to avoid version conflicts between the installed `@playwright/cli` alpha package and `@playwright/test@1.45.0`.

## Architecture

**Data flow:** `content/logs/*.mdx` → `lib/mdx.ts` (server-side fs reads) → `app/page.tsx` (Server Component) → `components/Timeline.tsx` (Client Component, receives `LogMeta[]` as props).

**Client/Server boundary:** `lib/mdx.ts` uses Node.js `fs` — it must only be called from Server Components (`app/page.tsx`, `app/logs/[slug]/page.tsx`) or `generateStaticParams`. Never import it in any `'use client'` file. `Timeline.tsx` is the only client component that receives data — it gets pre-fetched `LogMeta[]` passed as props from the server.

**MDX rendering:** `next-mdx-remote/rsc` (not `next-mdx-remote`) is used in `app/logs/[slug]/page.tsx`. The `/rsc` import is the App Router path and runs server-side — using the Pages Router `serialize`/`<MDXRemote>` path would break this. `lib/mdx.ts` returns the raw MDX string; `MDXRemote` compiles it at render time. `components/MDXComponents.tsx` maps standard HTML elements to cyberpunk-styled versions and is passed as the `components` prop.

**Content:** Blog posts live in `content/logs/*.mdx`. The filename becomes the URL slug. `getAllLogs()` sorts by `date` frontmatter descending. Posts with `category: "roundup"` render as `YearWrapUpNode` (full-width) instead of `TimelineNode` (alternating left/right).

**Design tokens** (all in `tailwind.config.ts`):
- Colors: `bg-base` (#050505), `bg-surface` (#1A1A1A), `neon-cyan` (#00f3ff), `neon-pink` (#ff003c), `neon-yellow` (#fcee0a)
- Fonts: `font-orbitron` (headings/UI), `font-space-mono` (body/terminal text) — loaded via `next/font/google` in `app/layout.tsx` and injected as CSS variables `--font-orbitron` / `--font-space-mono`
- Neon glow utilities (`.neon-glow-cyan`, `.neon-text-cyan`, etc.) are defined in `app/globals.css` under `@layer utilities`

**Playwright tests** assert on `data-testid` attributes: `"timeline"` (Timeline wrapper), `"timeline-node"` + `data-date` attribute (TimelineNode articles), `"year-wrapup-node"` (YearWrapUpNode), `"access-log-link"` (CTA links), `"nav-home-link"` (TerminalNav home link), `"log-title"` and `"mdx-body"` (slug page). Any new components that tests need to assert on must include these attributes.

## MDX Frontmatter Schema

```yaml
title: string
date: "YYYY-MM-DD"           # Controls sort order (descending)
completionDate: "YYYY-MM-DD" # null for roundups
category: "review" | "roundup"
platform: string | null
rating: number | null        # 0–10 scale, displayed as 0–5 stars
coverImage: "/images/..."    # Served from public/images/; gracefully absent
excerpt: string
award: "GOTY" | "WORST" | null
```
