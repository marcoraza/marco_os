# STORY-2026-03-06-shell-weight-and-render-isolation

## Context
Sprint 8 and Sprint 9 focused on reducing initial shell cost and avoiding unnecessary rerenders in always-mounted layout surfaces.

## Goals
- Reduce the main shared bundle cost
- Split shell and data-sync code into dedicated chunks
- Stop the top-level app shell from rerendering every second because of the header clock
- Keep quality gates green

## Changes
- Removed the global `NotionDataProvider` mount from `App` and kept scoped mounting inside content views that actually need it
- Memoized `AppHeader` and moved clock state into the header itself
- Memoized `AppSidebar`
- Stabilized layout callbacks in `App.tsx`
- Memoized active task counts in `App.tsx`
- Added domain-oriented `manualChunks` strategy in `vite.config.ts` for:
  - `app-shell`
  - `data-sync`
  - `openclaw-core`
  - vendor buckets

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Build Snapshot
Before:
- `index` ~ `655.55 kB`

After:
- `index` ~ `35.16 kB`
- `app-shell` ~ `116.89 kB`
- `data-sync` ~ `179.83 kB`
- `openclaw-core` ~ `26.71 kB`

## Files
- `App.tsx`
- `components/layout/AppHeader.tsx`
- `components/layout/AppSidebar.tsx`
- `vite.config.ts`
