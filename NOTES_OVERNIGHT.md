# Marco OS - Changelog Overnight (2026-02-14)

## Deployed
- Preview: https://marcoraza.github.io/marco_os/
- Branch: gh-pages (auto-deploy via gh-pages CLI)

## Completed
- [x] Fix index.css build warning (Vite CSS import)
- [x] IndexedDB persistence layer (data/db.ts, data/models.ts, data/repository.ts)
- [x] Hydrate on load + autosave with debounce (projects, tasks, notes, events)
- [x] Seed only on first run (bootstrap check)
- [x] Command Palette (Cmd/Ctrl+K) - search + create tasks/notes/events
- [x] Header search input wired to palette trigger
- [x] Git backup tag: backup-2026-02-13
- [x] First deploy to GitHub Pages

## In Progress (sub-agents running)
- [ ] Block C: Agents (schema, persistence, roster, runs log, AgentCenter real data)
- [ ] Block B: UX (Quick Capture, Triage, Notes panel, Agenda widget, Empty states, Toast)

## Restrictions (enforced)
- Finance.tsx: NOT touched (logic preserved)
- Aesthetic: evolve within existing tokens/dark mode, no redesign
