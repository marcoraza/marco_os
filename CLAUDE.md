# CLAUDE.md — Marco OS

## Project Overview

Marco OS is a high-fidelity, dark-mode personal operating system / command center built as a single-page React application. It integrates task management (Kanban), health tracking, financial dashboards, learning protocols, CRM, an AI agent system (OpenClaw), and a planner — all in one unified interface.

- **Live:** https://marcoraza.github.io/marco_os/
- **Repo:** git@github.com:marcoraza/marco_os.git
- **Branch strategy:** `main` → development, `gh-pages` → production build

## Tech Stack

- **Framework:** React 19 + TypeScript 5.8
- **Build:** Vite 6
- **Styling:** Tailwind CSS 3.4 + custom CSS (`index.css`)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Storage:** IndexedDB (via `idb`) + localStorage
- **AI Agents:** OpenClaw (local API on port 18792)
- **PWA:** Service Worker + manifest.json
- **Deploy:** GitHub Pages (`npm run build && npx gh-pages -d dist`)

## Project Structure

```
App.tsx                    # Root — layout, routing, sidebar, theme
components/
  Dashboard.tsx            # Main Kanban board + agenda
  Finance.tsx              # Financial dashboard (largest component ~105KB)
  Health.tsx               # Health tracker
  Learning.tsx             # Learning protocols + resources
  CRM.tsx                  # Contact/network management
  Settings.tsx             # App settings + preferences
  Planner.tsx              # Daily/weekly planner
  NotesPanel.tsx           # Markdown notes sidebar
  CommandPalette.tsx       # Cmd+K command palette
  NotificationCenter.tsx   # Notification system
  AgentCommandCenter.tsx   # AI agent management
  AgentDetailView.tsx      # Single agent detail
  MissionModal.tsx         # Create mission modal
  MissionDetail.tsx        # Mission detail view
  agents/                  # Agent sub-components (config, cron, kanban, memory)
  ui/                      # Shared UI primitives (Badge, Card, Skeleton, Toast, etc.)
contexts/
  AppContext.tsx            # Global app state
  OpenClawContext.tsx       # OpenClaw agent context
hooks/                     # useHotkeys, useSettings, useAgentStream
lib/                       # OpenClaw client, storage utilities
data/                      # IndexedDB schema, models, repository, seed data
types/                     # TypeScript type definitions
public/                    # PWA icons, manifest, service worker
```

## Key Commands

```bash
npm run dev        # Dev server on localhost:3000
npm run build      # Production build → dist/
npm run preview    # Preview production build locally

# Deploy to GitHub Pages
npm run build && npx gh-pages -d dist
```

## Engineering Preferences

- **DRY is important** — flag repetition aggressively.
- **Well-tested code is non-negotiable** — rather too many tests than too few.
- **"Engineered enough"** — not under-engineered (fragile, hacky) and not over-engineered (premature abstraction, unnecessary complexity).
- **Handle more edge cases, not fewer** — thoughtfulness > speed.
- **Bias toward explicit over clever.**

## Plan Mode Protocol

When entering plan mode, review thoroughly before making any code changes. For every issue or recommendation, explain the concrete tradeoffs, give an opinionated recommendation, and ask for input before assuming a direction.

### Review Stages (in order)

**1. Architecture Review**
- System design and component boundaries
- Dependency graph and coupling concerns
- Data flow patterns and potential bottlenecks
- Scaling characteristics and single points of failure
- Security architecture (auth, data access, API boundaries)

**2. Code Quality Review**
- Code organization and module structure
- DRY violations — be aggressive
- Error handling patterns and missing edge cases (call out explicitly)
- Technical debt hotspots
- Over-engineered vs under-engineered areas

**3. Test Review**
- Test coverage gaps (unit, integration, e2e)
- Test quality and assertion strength
- Missing edge case coverage — be thorough
- Untested failure modes and error paths

**4. Performance Review**
- Database/storage access patterns
- Memory-usage concerns
- Caching opportunities
- Slow or high-complexity code paths
- Bundle size optimization (main chunk is 821KB — needs splitting)

### For Each Issue Found

- Describe the problem concretely with file and line references
- Present 2-3 options, including "do nothing" where reasonable
- For each option specify: implementation effort, risk, impact on other code, maintenance burden
- Give recommended option and why, mapped to engineering preferences above
- Explicitly ask whether to agree or choose a different direction before proceeding
- Number issues and letter options (e.g., Issue #1 Option A/B/C)
- Recommended option is always listed first

### Workflow

- Do not assume priorities on timeline or scale
- After each section, pause and ask for feedback before moving on
- Before starting, ask which mode:
  - **BIG CHANGE:** Interactive, one section at a time, max 4 top issues per section
  - **SMALL CHANGE:** Interactive, one question per review section

## Important Notes

- **Language:** UI is in Portuguese (pt-BR). All user-facing text must be in Portuguese.
- **Theme:** Supports dark mode (default) and light mode (warm stone palette). Accent color: `#00FF95` (mint green).
- **Vite base path:** `/marco_os/` — all asset references must include this prefix.
- **No backend:** All data is client-side (IndexedDB + localStorage). No server, no database.
- **Service Worker:** Currently configured to self-destruct (clears cache + unregisters) to avoid stale asset issues.
- **Sensitive files:** `.env` contains API tokens — never commit.
- **Known tech debt:** Finance.tsx (105KB) and App.tsx (61KB) are oversized and need componentization.
