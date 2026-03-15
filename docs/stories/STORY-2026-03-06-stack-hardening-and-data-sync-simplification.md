# STORY-2026-03-06-stack-hardening-and-data-sync-simplification

## Context
Sprint 14 and Sprint 15 focused on lowering stack maintenance cost and simplifying repeated data-sync logic.

## Goals
- Remove unused dependencies and stack noise
- Eliminate hardcoded Supabase runtime fallbacks from source
- Document required env configuration explicitly
- Reduce duplicated provider-item extraction logic
- Keep the data-sync surface predictable and validated

## Changes
- Removed unused `vitest` dev dependency
- Added shared dataset extraction helper in `lib/providerData.ts`
- Reused the shared extraction helper in finance and health hooks
- Removed hardcoded Supabase source fallback values from `lib/supabase.ts`
- Added explicit `isSupabaseConfigured` guard and graceful handling in `SupabaseDataContext`
- Updated `.env.example` with Supabase and bridge keys actually used by the app
- Updated `README.md` to reflect real setup and full quality checks

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Files
- `.env.example`
- `README.md`
- `lib/supabase.ts`
- `lib/providerData.ts`
- `contexts/SupabaseDataContext.tsx`
- `hooks/useFinanceData.ts`
- `hooks/useHealthScore.ts`
- `package.json`
- `package-lock.json`
