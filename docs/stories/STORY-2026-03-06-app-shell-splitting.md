# STORY-2026-03-06-app-shell-splitting

## Context
- The app shell still carried modal-only UI in the shared `index` chunk.
- The goal is to reduce initial bytes without refactoring core architecture.

## Scope
- Lazy-load app-shell overlays and dashboard-only chrome.
- Avoid behavior changes in navigation and shortcuts.

## Checklist
- [x] Identify app-shell components still eagerly loaded in `App.tsx`
- [x] Convert modal-only and dashboard-only components to lazy imports
- [x] Remove layout barrel usage from `App.tsx`
- [x] Run `npm run lint`
- [x] Run `npm run typecheck`
- [x] Run `npm test`
- [x] Run `npm run build`
- [x] Record build impact

## Build Impact
- Shared `index` chunk reduced from about `535.9 kB` to `468.4 kB`
- New shell-level lazy chunks:
  - `CommandPalette` `13.3 kB`
  - `ProjectSwitcher` `9.3 kB`
  - `MissionModal` `18.8 kB`
  - `AgentAddModal` `23.5 kB`
  - `ShortcutsDialog` `3.6 kB`

## File List
- [App.tsx](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/App.tsx)
- [STORY-2026-03-06-app-shell-splitting.md](/Users/marko/Desktop/CLAUDE/PROJETOS/marco_os/docs/stories/STORY-2026-03-06-app-shell-splitting.md)
