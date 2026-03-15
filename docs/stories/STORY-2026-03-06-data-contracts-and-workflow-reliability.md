# STORY-2026-03-06-data-contracts-and-workflow-reliability

## Context
Sprint 10 and Sprint 11 focused on reducing duplicated data-provider contracts and removing silent failures from critical user flows.

## Goals
- Consolidate shared data-provider contracts between JSON and Supabase providers
- Reduce inline data-shape adaptation drift
- Improve feedback in command palette and note editing flows
- Add minimal validation to mission creation

## Changes
- Created shared provider contract and cache helpers in `lib/notionDataContract.ts`
- Refactored `NotionDataContext` and `SupabaseDataContext` to use the shared contract
- Moved Supabase task-row adaptation to a dedicated helper inside `SupabaseDataContext`
- Added execution/error feedback to `CommandPalette`
- Made command palette create actions surface success/error clearly
- Added real autosave state feedback to `NotesPanel`
- Added minimal mission title validation and disabled invalid submit in `MissionModal`
- Updated domain actions to return created entities for palette flows and toast mission creation

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Files
- `lib/notionDataContract.ts`
- `contexts/NotionDataContext.tsx`
- `contexts/SupabaseDataContext.tsx`
- `components/CommandPalette.tsx`
- `components/NotesPanel.tsx`
- `components/MissionModal.tsx`
- `hooks/useAppDomainActions.ts`
