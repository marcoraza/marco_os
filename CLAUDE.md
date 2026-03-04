# Marco OS — Project Rules

> This file is loaded automatically by Claude Code every session. Contains permanent rules only.
> Do NOT edit unless you're updating a stable architectural decision.

---

## Identity

Marco OS is a personal operating system PWA (React + Vite + TypeScript). Dark theme, minimalist, typographic, information-dense. Deployed on GitHub Pages (`marcoraza.github.io/marco_os`).

---

## Architecture

### 9 Fixed Sections (never add new sidebar items)

| Section            | View ID        | Icon            | Label (PT-BR)        | Description                                     |
|--------------------|----------------|-----------------|----------------------|-------------------------------------------------|
| Central de Comando | `dashboard`    | `dashboard`     | Central de Comando   | MissionControlBar + MorningBrief + WidgetGrid 2x2 + QuickCapture + Kanban + Achievements |
| Financas           | `finance`      | `payments`      | Financas             | Transactions, cashflow, crypto, debts, goals    |
| Saude              | `health`       | `monitor_heart` | Saude                | 3 tabs: Registro Diario, Tendencias & Insights, Atividades. Workouts, weight, habits |
| Aprendizado        | `learning`     | `school`        | Aprendizado          | 5 tabs: Curriculo, Conhecimento, Exploracao, Criadores, Recursos. Research pipeline, deep dives, creators roster, skills |
| Projetos           | `planner`      | `event_note`    | Projetos             | 2 tabs: Projetos (Notion), Planejador (AI). Kanban projects, content pipeline, checklists |
| Network            | `crm`          | `contacts`      | Network              | AlertBanner + 2 tabs: Contatos, Reunioes. Follow-ups banner, source badges |
| Notas              | `notes`        | `sticky_note_2` | Notas                | 4 tabs: Editor, Brain Dump, Cronica, Decisoes. Local notes + Notion dumps + weekly chronicle + decision journal |
| Agentes            | `agents-overview` | `hub`        | Agentes              | OpenClaw agent roster, crons, executions        |
| Configuracoes      | `settings`     | `settings`      | Configuracoes        | OpenClaw config, theme, preferences             |

**Rules:**
- View IDs are permanent and backwards-compatible — never rename them
- Only display labels may be renamed (e.g. "Planejador" → "Projetos")
- The `View` union type in `lib/appTypes.ts` uses these IDs — do not change

### Data Layer

- **DataProvider<T> interface** in `lib/dataProvider.ts` — ALL data consumption goes through this. Phase 1 = JSON polling, Phase 3 = Supabase. Same interface, swappable provider.
- **NotionDataContext** (centralized) in `contexts/NotionDataContext.tsx` — single 30s polling timer for ALL data files. Components read from context, NEVER fetch directly.
- **SyncBadge** (`components/ui/SyncBadge.tsx`) — every section with Notion data MUST display sync timestamp. Style: `text-[8px] font-mono text-text-secondary`.
- **OpenClaw Gateway:** WebSocket + HTTP integration via `contexts/OpenClawContext.tsx`.
- **Local persistence:** IndexedDB via `idb` library, managed by `data/repository.ts`.
- **Chat sessions:** persisted in IndexedDB (`chat_sessions` store), key: `${agentId}:${sectionId}`.

**Data consumption rules:**
```typescript
// CORRECT — use context
const { projetos } = useNotionData();

// WRONG — never fetch directly in components
const [data, setData] = useState([]);
useEffect(() => { fetch('/data/projetos.json')... }, []);
```

### JSON Data Files

```
data/
  research.json        # Research DB
  deep-dives.json      # Deep Dives DB
  criadores.json       # Criadores DB
  projetos.json        # Projetos DB
  checklists.json      # Checklists DB
  reunioes.json        # Reunioes DB
  pessoas.json         # Pessoas DB
  content.json         # Content DB
  brain-dump.json      # Brain Dump DB
  financas.json        # Financas DB
  saude.json           # Saude DB
  skills.json          # Skills DB
  decisions.json       # Decision Journal DB
```

Each JSON file schema:
```json
{
  "_meta": { "db_id": "...", "db_name": "...", "synced_at": "ISO8601", "count": 0 },
  "items": [{ "id": "page-id", "title": "...", ...flatProperties }]
}
```

---

## Design System — MANDATORY

> Every component, every feature, every pixel must follow these rules.
> If it doesn't match the design system, it doesn't ship.

### Colors

**CSS custom properties (dark theme — default):**

| Token                      | CSS Variable                    | Hex       | Usage                                      |
|----------------------------|---------------------------------|-----------|--------------------------------------------|
| `bg-base`                  | `--color-bg-base`               | `#0D0D0F` | Deepest background layer                   |
| `header-bg`                | `--color-bg-header`             | `#121212` | App header background                      |
| `surface`                  | `--color-bg-surface`            | `#1C1C1C` | Cards, panels                              |
| `surface-hover`            | `--color-bg-surface-hover`      | `#252525` | Card hover states                          |
| `border-panel`             | `--color-border-panel`          | `#2A2A2A` | All borders                                |
| `text-primary`             | `--color-text-primary`          | `#E1E1E1` | Primary content text                       |
| `text-secondary`           | `--color-text-secondary`        | `#8E8E93` | Labels, metadata, secondary content        |
| `brand-mint`               | `--color-brand-mint`            | `#00FF95` | Active states, success, primary CTAs       |
| `brand-flame`              | `--color-brand-flame`           | `#FF5500` | Special brand accent (use sparingly)       |
| `accent-blue`              | `--color-accent-blue`           | `#0A84FF` | Informational badges, links, neutral accents |
| `accent-red`               | `--color-accent-red`            | `#FF453A` | Errors, failures, destructive actions      |
| `accent-orange`            | `--color-accent-orange`         | `#FF9F0A` | Warnings, medium priority, attention       |
| `accent-purple`            | `--color-accent-purple`         | `#BF5AF2` | Special highlights (use sparingly)         |

**Light theme overrides (applied via `[data-theme="light"]`):**

| Token          | Hex       |
|----------------|-----------|
| `bg-base`      | `#E8E6E1` |
| `header-bg`    | `#F0EEE9` |
| `surface`      | `#F5F3EF` |
| `text-primary` | `#1C1917` |
| `text-secondary` | `#78716C` |
| `brand-mint`   | `#059669` |

**Tailwind config (`tailwind.config.js` — extend only, never replace):**
```js
colors: {
  'header-bg':    'var(--color-bg-header)',
  'bg-base':      'var(--color-bg-base)',
  'surface':      'var(--color-bg-surface)',
  'surface-hover':'var(--color-bg-surface-hover)',
  'border-panel': 'var(--color-border-panel)',
  'text-primary': 'var(--color-text-primary)',
  'text-secondary':'var(--color-text-secondary)',
  'brand-mint':   'var(--color-brand-mint)',
  'brand-flame':  'var(--color-brand-flame)',
  'accent-blue':  'var(--color-accent-blue)',
  'accent-red':   'var(--color-accent-red)',
  'accent-orange':'var(--color-accent-orange)',
  'accent-purple':'var(--color-accent-purple)',
}
fontFamily: { sans: ['Inter', 'sans-serif'] }
```

**Color rules:**
- **Never use raw hex values** — always use CSS variable via Tailwind class names
- **Never introduce new colors** — the palette is closed
- `brand-mint` → ONLY for: active states, success indicators, primary CTAs, positive metrics
- `accent-orange` → ONLY for: warnings, medium priority, attention needed
- `accent-red` → ONLY for: errors, failures, critical alerts, destructive actions
- `accent-blue` → ONLY for: informational badges, links, neutral highlights
- Background layering: `bg-bg-base` (deepest) < `header-bg` (header) < `surface` (cards) < `surface-hover` (hover)

### Typography

- **Font:** Inter (weights 300–900), `font-family: sans: ['Inter', 'sans-serif']`
- **Icons:** Material Symbols Outlined (via Google Fonts CDN) — never Font Awesome, never Lucide, never inline SVG for standard icons

| Usage              | Classes                                                                 |
|--------------------|-------------------------------------------------------------------------|
| Section headers    | `<SectionLabel>` → `text-[8px] font-black uppercase tracking-widest text-text-secondary` |
| Nav items          | `text-[10px] font-bold uppercase tracking-wide`                         |
| Card titles        | `text-[10px] font-bold text-text-primary` or `text-xs font-bold`        |
| Body text          | `text-xs text-text-primary` or `text-sm`                                |
| Data values        | `font-mono` — always monospace for numbers, timestamps, IDs, scores     |
| Micro labels       | `text-[7px]` to `text-[8px]`                                            |
| Hero numbers       | `text-[28px] font-black font-mono` — max one per view                   |

**Rules:**
- No `text-lg` or larger inside section content (except hero numbers)
- All UI text in **PT-BR**; variable names, comments, and code in **English**

### Spacing & Layout

| Property         | Rule                                                                 |
|------------------|----------------------------------------------------------------------|
| Border radius    | `rounded-sm` (2px) for cards/containers; `rounded-md` (4px) for agent cards with hover; `rounded-full` ONLY for status dots and avatars |
| Borders          | `border border-border-panel` (default); `border-brand-mint/20` for active/selected; never `border-2` except tab active indicator (`border-b-2`) |
| Card padding     | `p-3` to `p-4`                                                       |
| Inline elements  | `px-2 py-0.5` to `px-3 py-1.5`                                       |
| Element gaps     | `gap-1` to `gap-3` between elements; `gap-6` for section spacing; never `gap-8` or larger within a section |
| Sidebar width    | Fixed `w-[220px]` — do not change                                    |
| Header height    | Fixed `h-16` — do not change                                         |

### Component Patterns (must reuse, never reinvent)

**Card:**
```tsx
<div className="bg-surface border border-border-panel rounded-sm p-3 transition-all">
```

**Button (primary):**
```tsx
<button className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all">
```

**Button (danger):**
```tsx
<button className="bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-sm text-[9px] font-bold uppercase tracking-widest">
```

**Badge:**
```tsx
<span className="text-[8px] font-bold uppercase tracking-widest bg-surface border border-border-panel px-2 py-0.5 rounded-sm">
```

**NotionCard:**
```tsx
<div className="bg-surface border border-border-panel rounded-sm p-3">
  <div className="flex items-start justify-between">
    <span className="text-xs font-bold text-text-primary">{title}</span>
    <SourceBadge source="notion" />
  </div>
  {meta && <div className="mt-1 flex gap-2">{meta}</div>}
  {children}
  {href && <a href={href} target="_blank" rel="noopener" className="text-[8px] text-brand-mint">
    <Icon name="open_in_new" size="xs" />
  </a>}
</div>
```

**Widget (Dashboard):**
```tsx
<div className="bg-surface border border-border-panel rounded-sm p-3">
  <SectionLabel>{TITULO}</SectionLabel>
  {/* compact content */}
  <a className="text-[8px] text-brand-mint uppercase tracking-widest">
    Ver tudo <Icon name="arrow_forward" size="xs" />
  </a>
</div>
```

**AlertBanner:**
```tsx
<div className="bg-accent-orange/10 border border-accent-orange/30 rounded-sm px-3 py-2 flex items-center justify-between">
  <span className="flex items-center gap-2 text-accent-orange text-xs">
    <Icon name="warning" size="sm" /> {count} {label}
  </span>
  <Icon name="expand_more" size="sm" className="text-accent-orange cursor-pointer" />
</div>
```

**Mission Control border (alert state):**
```tsx
className={cn(
  "bg-surface border rounded-sm p-3",
  level === 'critical' && "border-l-2 border-accent-red",
  level === 'warning' && "border-l-2 border-accent-orange",
  !hasAlert && "border-border-panel"
)}
```

**Tab bar:**
```tsx
<div className="flex items-center gap-1 border-b border-border-panel">
  <button className={cn(
    'px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2',
    active ? 'text-brand-mint border-brand-mint' : 'text-text-secondary border-transparent hover:text-text-primary'
  )}>
```

**Empty state (existing sections with data):**
```tsx
// Centered text, no illustrations, optional single CTA
<p className="text-text-secondary text-xs text-center">Sem dados ainda</p>
```

**Empty state (onboarding — new/empty sections like Financas, Saude, Skills):**
```tsx
<div className="flex flex-col items-center gap-3 py-12">
  <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">inbox</span>
  <p className="text-text-secondary text-xs text-center">Nenhum item encontrado</p>
  <p className="text-text-secondary text-[9px] text-center max-w-[200px]">
    Inicie uma conversa para configurar esta secao
  </p>
  <button className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand-mint/20">
    Configurar com Frank
  </button>
</div>
```

**Skeleton loading:**
```tsx
<div className="bg-border-panel animate-pulse rounded-sm h-12 w-full" />
```

**Loading state:**
```tsx
<span className="animate-pulse text-text-secondary text-xs font-mono">Carregando...</span>
```

**Tooltip:**
```tsx
// Plain text only, no emojis
<div className="bg-surface border border-border-panel text-[9px] px-2 py-1 rounded-sm">
```

**Status dot:** `<StatusDot color="mint|orange|blue|red" glow={boolean} />`

**Icon:** `<Icon name="material_symbol_name" size="xs|sm|md|lg" />` — Material Symbols Outlined only

**Section label:** `<SectionLabel>TITULO DA SECAO</SectionLabel>`

**ChatPanel (agent drawer):**
- Slides in from right — 400px desktop, full-width mobile
- **Overlay mode** — does NOT compress main content. Uses `z-50` with backdrop `bg-black/40`
- Desktop: overlay floating panel. Mobile: full-screen takeover
- Transition: `x: '100%' → 0`, `duration: 0.25s`, type `tween`
- Close: click backdrop (desktop), X button (header), swipe left (mobile future)
- User messages: `bg-brand-mint/10 border border-brand-mint/30` right-aligned
- Agent messages: `bg-bg-base border border-border-panel` left-aligned
- Input: fixed bottom, `bg-bg-base border-t border-border-panel`
- Agent name: `text-[10px] font-bold uppercase` + `<StatusDot>`

**CTA hierarchy (per section):**
- Primary (max 1 per section): `bg-brand-mint/10 border border-brand-mint/30 text-brand-mint`
- Secondary (N per section): `bg-bg-surface border border-border-panel text-text-primary`
- Destructive (rare): `bg-accent-red/10 border border-accent-red/30 text-accent-red`
- Never more than 1 primary CTA visible per section simultaneously

### Animation

- **Page transitions:** Framer Motion `opacity: 0→1, y: 12→0`, `duration: 0.25s, ease: [0.25, 0.46, 0.45, 0.94]`
- **Hover transitions:** `transition-all duration-300 ease-out`
- **Pulse:** Only for live status indicators (`animate-pulse` on StatusDot) and loading states
- **No spring animations.** No bounce. No overshoot.
- **No staggered list animations** unless gallery view with >6 items

### Do Not

- Do not add `rounded-lg`, `rounded-xl`, or `rounded-2xl` to any element
- Do not use `shadow-lg`, `shadow-xl`, or any prominent box shadows
- Do not use gradient backgrounds on cards or sections
- Do not use colored backgrounds for cards (only status/accent elements like progress bars and badges)
- Do not create circular buttons or circular avatars larger than 32px
- Do not add borders thicker than 1px (except tab active indicator `border-b-2`)
- Do not use `text-[7px]` for essential information — only for decorative metadata
- All interactive elements MUST have `focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none`
- All interactive elements on mobile MUST have `min-h-[44px]` touch target (WCAG)
- Do not use `gap-8` or larger between elements within a section
- Do not center-align body text (always left-aligned)
- Do not use placeholder images or illustrations for empty states
- Do not use emojis anywhere in the UI — not in labels, buttons, badges, toasts, or empty states
- Do not use rounded-full on containers larger than 32px (w-10 h-10 max) — only for StatusDot and small avatars

---

## New UI Components (Uma Design Pipeline)

### UI Primitives (`components/ui/`)

| Component | File | Purpose | Used by |
|-----------|------|---------|---------|
| `SourceBadge` | `SourceBadge.tsx` | Notion (mint) vs IndexedDB (blue) indicator | 5+ sections |
| `PipelineBadge` | `PipelineBadge.tsx` | Status badge via `PIPELINE_STATUS_MAP` lookup | 6+ features |
| `NotionCard` | `NotionCard.tsx` | Base card for any Notion item (title, meta, source, href, children) | Universal |
| `FilterPills` | `FilterPills.tsx` | Quick filter pills with active state | 8+ features |
| `AlertBanner` | `AlertBanner.tsx` | Collapsible alert/follow-up banner | Network, Dashboard |
| `MetricBar` | `MetricBar.tsx` | Horizontal KPI strip | Dashboard, Finance, Ghost, Deep Work |
| `TimelineList` | `TimelineList.tsx` | Vertical timeline with line connector | Chronicle, Decisions, Replay |
| `FullscreenOverlay` | `FullscreenOverlay.tsx` | z-50 overlay with Framer Motion fade | Ghost Mode |
| `Sparkline` | `Sparkline.tsx` | 7-bar SVG inline chart (no Recharts) | Dev Pulse |
| `HeatmapGrid` | `HeatmapGrid.tsx` | GitHub-style contribution grid | Activity Heatmap, Energy Map |
| `AlertBadge` | `AlertBadge.tsx` | Header alert indicator with pulse | Mission Control |

### Status Tokens (`utils/statusTokens.ts`)

All pipeline/status badges use declarative color mapping:
- Pendente: `text-text-secondary border-border-panel`
- Na Fila: `text-accent-orange border-accent-orange/30`
- Em Execucao: `text-accent-blue border-accent-blue/30`
- Analisado/Ativo/Processado: `text-brand-mint border-brand-mint/30`
- Pausado: `text-accent-orange border-accent-orange/30`
- Concluido/Realizada: `text-text-secondary border-border-panel`

Badge base: `text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm`

### New Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useOnboardingTrigger` | `hooks/useOnboardingTrigger.ts` | Opens ChatPanel if data empty (sessionStorage flag, once per session) |
| `useFinanceData` | `hooks/useFinanceData.ts` | Calculates metrics from financas.json |
| `useCountUp` | `hooks/useCountUp.ts` | Number animation via rAF (respects prefers-reduced-motion) |
| `useFlowState` | `hooks/useFlowState.ts` | Detects flow by interaction pattern + commits |
| `useGhostMode` | `hooks/useGhostMode.ts` | Controls Ghost Mode + Deep Work panel |
| `useHealthScore` | `hooks/useHealthScore.ts` | Calculates 0-100 score from all JSONs |
| `useQuickCapture` | `hooks/useQuickCapture.ts` | Classifies captured text via Frank |

### New Section Components

| Component | File | Section |
|-----------|------|---------|
| `LearningExploration` | `components/learning/LearningExploration.tsx` | Aprendizado > Exploracao |
| `CreatorsRoster` | `components/learning/CreatorsRoster.tsx` | Aprendizado > Criadores |
| `SkillsWidget` | `components/learning/SkillsWidget.tsx` | Aprendizado > Curriculo (widget) |
| `NotionProjectsView` | `components/planner/NotionProjectsView.tsx` | Projetos > Projetos tab |
| `ReunioesView` | `components/crm/ReunioesView.tsx` | Network > Reunioes tab |
| `ActivitiesView` | `components/health/ActivitiesView.tsx` | Saude > Atividades tab |
| `BrainDumpView` | `components/notes/BrainDumpView.tsx` | Notas > Brain Dump tab |
| `MissionControlBar` | `components/dashboard/MissionControlBar.tsx` | Dashboard (top) |
| `MorningBriefCard` | `components/dashboard/MorningBriefCard.tsx` | Dashboard (below MissionControl) |
| `DashboardWidgetGrid` | `components/dashboard/DashboardWidgetGrid.tsx` | Dashboard (2x2 grid) |

### New Utilities

| File | Content |
|------|---------|
| `utils/statusTokens.ts` | `PIPELINE_STATUS_MAP` + status helpers |
| `utils/dateUtils.ts` | `formatRelative`, `groupByWeek`, `getDayKey` |
| `utils/scoreUtils.ts` | `calculateHealthScore(data)` by dimension |

### Sprint Order

| Sprint | Focus | Key deliverables |
|--------|-------|-------------------|
| 0 | Bugfixes | EmptyState rounded-md, Toast rounded-sm, EmptyState rounded-full |
| Foundation | UI primitives | 13 components + 3 utils + 3 hooks |
| A | Notion integrations | 7 section components + ChatPanel onboarding |
| B | Dashboard evolution | MissionControl, MorningBrief, WidgetGrid, HealthScore, Heatmap |
| C | Focus modes | Ghost Mode (Cmd+Shift+G), Deep Work (Cmd+Shift+D), Flow State |
| D | Knowledge + Content | KnowledgeGraph, Chronicle, Decisions, Scenario, Replay |
| E | Intelligence layer | Quick Capture (Cmd+N), Atomic Notes, Predictive Widgets |

### Integration Principle

**Additive only — zero removals, zero breaking changes.**
- New tabs added alongside existing ones
- New components composed into existing section files
- Existing functionality never removed or replaced
- JSON empty = EmptyState, never crash

---

## Constraints

1. **Zero emojis in UI** — Material Symbols Outlined only, everywhere
2. **No new dependencies** — React + Tailwind + Framer Motion + idb only. No shadcn, MUI, Chakra, Radix, or any new UI library
3. **All UI labels in PT-BR**, code/comments in English
4. **View IDs never change** — backwards compatibility with IndexedDB, shortcuts, and routing
5. **`npm run build` must work**, output to `dist/`, deploy via `npx gh-pages -d dist`
6. **Mock data fallback** when JSON files or Gateway unavailable — never crash, never show broken empty UI
7. **Design system compliance is mandatory, not optional** — every PR, every component, every pixel
8. **No new sidebar items** — 9 sections is final; new Notion data absorbs into existing sections
9. **Backwards compatible** — IndexedDB data, OpenClaw integration, keyboard shortcuts, PWA must keep working
10. **Follow Section 9 patterns exactly** — when a pattern isn't documented, look at existing components; when in doubt, be more minimal

---

## Code Conventions

### File Organization

- **Components:** `components/` with PascalCase filenames
- **Shared UI primitives:** `components/ui/` — `Icon`, `StatusDot`, `SectionLabel`, etc.
- **Layout components:** `components/layout/` — `AppHeader`, `AppSidebar`, `MobileNav`, `ProjectSwitcher`
- **Section sub-components:** `components/{section}/` — e.g., `components/finance/`, `components/agents/`, `components/dashboard/`
- **Hooks:** `hooks/` with `use` prefix
- **Types:** `types/` or `lib/appTypes.ts`
- **Data / persistence:** `data/`
- **OpenClaw integration:** `lib/` and `contexts/`
- **Utilities:** `utils/`

### Usage Rules

```tsx
// Always use cn() for conditional classNames
import { cn } from '@/utils/cn';

// Always use <Icon> for icons
<Icon name="check_circle" size="sm" />   // xs | sm | md | lg

// Always use <SectionLabel> for section headers
<SectionLabel>RESUMO FINANCEIRO</SectionLabel>

// Always use <StatusDot> for status indicators
<StatusDot color="mint" glow />
```

### Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main app routing, state, layout |
| `index.css` | Theme tokens + Tailwind base styles |
| `tailwind.config.js` | Tailwind config — extend only |
| `lib/dataProvider.ts` | DataProvider<T> interface (Phase 1/3 abstraction) |
| `contexts/NotionDataContext.tsx` | Centralized Notion data polling (single timer) |
| `contexts/OpenClawContext.tsx` | OpenClaw provider (WebSocket + HTTP + state) |
| `components/ui/SyncBadge.tsx` | Sync timestamp display |
| `components/ChatPanel.tsx` | Reusable agent chat drawer |
| `hooks/useAgentChat.ts` | Chat session management |
| `lib/openclaw.ts` | WebSocket client with auto-reconnect |
| `lib/openclawHttp.ts` | HTTP client for Gateway `/tools/invoke` |
| `lib/openclawTypes.ts` | Protocol types (AgentPresence, AgentRun, etc.) |
| `lib/appTypes.ts` | View, Theme, Project, Task types |
| `data/repository.ts` | IndexedDB CRUD operations (includes chat_sessions) |
| `data/agentMockData.ts` | Mock data fallback for development |
| `hooks/useHotkeys.ts` | Keyboard shortcuts (Cmd+K, Go shortcuts) |
| `utils/cn.ts` | className utility |

**Keyboard Shortcuts:**

| Keyboard Shortcut | Action |
|-------------------|--------|
| `Cmd+K` | Command Palette (existing) |
| `Cmd+N` | Quick Capture (mod: true) |
| `Cmd+Shift+G` | Ghost Mode toggle |
| `Cmd+Shift+D` | Deep Work panel toggle |
| `Escape` | Close overlay/modal |

---

## File Structure

```
marco_os/
  App.tsx
  index.tsx
  index.css                    # Theme tokens + Tailwind
  index.html
  tailwind.config.js
  vite.config.ts
  tsconfig.json
  package.json
  components/
    Dashboard.tsx              # dashboard
    Finance.tsx                # finance
    Health.tsx                 # health
    Learning.tsx               # learning
    Planner.tsx                # planner → Projetos
    NotesPanel.tsx             # notes
    CRM.tsx                    # crm → Network
    Settings.tsx               # settings
    AgentCommandCenter.tsx     # agents-overview
    AgentDetailView.tsx
    MissionDetail.tsx
    MissionModal.tsx
    CommandPalette.tsx         # Cmd+K
    NotificationCenter.tsx
    AgentAddModal.tsx
    AgendaWidget.tsx
    agents/
      AgentConfig.tsx
      AgentCronJobs.tsx
      AgentExecutions.tsx
      AgentHeartbeat.tsx
      AgentKanban.tsx
      AgentMemory.tsx
      TokenUsageCard.tsx
    dashboard/
      DashboardHeader.tsx
      DashboardRightSidebar.tsx
      FocusMode.tsx
      GamificationBar.tsx
      KanbanBoard.tsx
    finance/
      FinanceCashflow.tsx
      FinanceCrypto.tsx
      FinanceDebts.tsx
    layout/
      AppHeader.tsx
      AppSidebar.tsx
      MobileNav.tsx
      ProjectSwitcher.tsx
    ui/                        # Icon, StatusDot, SectionLabel, etc.
  contexts/
    OpenClawContext.tsx
  lib/
    appTypes.ts
    openclaw.ts
    openclawHttp.ts
    openclawTypes.ts
  data/
    agentMockData.ts
    agentsSeed.ts
    db.ts
    models.ts
    repository.ts
    *.json                     # Notion-synced data files
  hooks/
    useHotkeys.ts
  types/
    agents.ts
  utils/
    cn.ts
  public/
    data/                      # Static JSON polled by GitHub Pages
```

---

## Notion Database IDs

These IDs are stable references — do not change.

| Database    | Notion DB ID                           | Status  | Section     |
|-------------|----------------------------------------|---------|-------------|
| Research    | `30bb72d5-042d-8176-a902-deaef821c5f2` | Exists  | learning    |
| Deep Dives  | `310b72d5-042d-8122-8590-ca967b0ee686` | Exists  | learning    |
| Criadores   | `30cb72d5-042d-81dd-8a48-ec715b1033e3` | Exists  | learning    |
| Projetos    | `30bb72d5-042d-819a-a583-c029400082bc` | Exists  | planner     |
| Reunioes    | `30bb72d5-042d-812f-bd97-ce23f4f9d2cd` | Exists  | crm         |
| Pessoas     | `30bb72d5-042d-8138-ae67-dec4f0315630` | Exists  | crm         |
| Content     | `30bb72d5-042d-81a2-93f3-fcfe40f23bb9` | Exists  | planner     |
| Brain Dump  | `30bb72d5-042d-810b-92cd-ed5924a84410` | Exists  | notes       |
| Checklists  | `30fb72d5-042d-81d2-bc6b-e2515ca8d3e2` | Exists  | planner     |
| Financas    | `318b72d5-042d-8184-95fc-c5b9a65e0249` | Exists  | finance     |
| Saude       | `318b72d5-042d-8179-9398-fc1ed4c6c297` | Exists  | health      |
| Skills      | `318b72d5-042d-810e-9f8e-ca073a1b4587` | Exists  | learning    |
| Decision Journal | `318b72d5-042d-812b-91a4-f1bde3362a59` | Exists  | notes  |

---

### Agentes Section — Absorbed HTML Pages

`crons.html` and `heartbeats.html` are ported as React components:
```
components/agents/
  AgentCronsView.tsx      # ports crons.html logic
  AgentHeartbeatsView.tsx  # ports heartbeats.html logic
```
Added as tabs in `AgentCommandCenter.tsx`: Agentes | Crons | Heartbeats | Execucoes.
HTML files remain as fallback URLs.

---

---

## Guardrails — Regras Operacionais para Agentes

### Deployment Checklist
- Verify all env vars are set in production
- Never push without confirming with user first
- After deploy, confirm live URL is responding
- Run smoke test on critical paths before declaring done

### Debugging Rules
- After 2 failed attempts on the same bug, STOP and ask
- Never blame cache without evidence (check logs first)
- Diagnose root cause before proposing a fix
- Summarize your diagnosis in 1 sentence before coding

### VPS/Infrastructure
- Check for orphan processes FIRST before starting services
- SSH commands timeout at 30s — use background jobs for long ops
- Always run smoke test after any infra change
- Confirm ports are open before declaring service is up

### Payment Integration
- Pix is not a subscription — they are different flows
- Map all architectural differences BEFORE writing any code
- Never assume payment provider behavior — read the docs first
- Test with sandbox credentials before any production deploy

### Testing
- Run full test suite after any refactor
- grep for removed function names in test files before deleting
- A passing build does not mean the feature works
- Confirm test coverage on the changed path explicitly

### UI/Frontend
- Describe proposed visual changes and ask for confirmation before implementing
- Never declare done based on build success alone — check in the browser
- Screenshot or describe the result after UI changes
- Ask if the interaction feels right, not just if it compiles

---

*Rules version: 4.0 | Source: PRD v2.0 + Uma UX Design Pipeline + Guardrails | Last updated: 2026-03-04*
