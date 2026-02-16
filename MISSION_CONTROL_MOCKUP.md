# Mission Control - Frontend Mockup Documentation

## 🎯 Overview

Mission Control é um dashboard horizontal scrollable para monitorar agents em execução no Marco OS.

## 📐 Layout Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🟢 Mission Control                                [3 Agents] [Connected]│
├────────────────────────────────────────────────────────────────────────┤
│ [All (3)] [Active (1)] [Queued (1)] [Completed (1)]                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│  │ 🟢 Agent #1     │  │ 🟡 Agent #2     │  │ 🔵 Agent #3     │  ───► │
│  │ ACTIVE          │  │ QUEUED          │  │ COMPLETED       │       │
│  │─────────────────│  │─────────────────│  │─────────────────│       │
│  │ PESQUISAR APIS  │  │ CONSTRUIR       │  │ CRIAR ADAPTER   │       │
│  │ INSTAGRAM NO    │  │ ADAPTER TIKTOK  │  │ X/TWITTER PRO   │       │
│  │ RAPIDAPI        │  │ PRO PIPELINE V3 │  │ PIPELINE        │       │
│  │                 │  │                 │  │                 │       │
│  │ 2m ago          │  │ 3m ago          │  │ 1h ago          │       │
│  │                 │  │                 │  │                 │       │
│  │ ✅ Iniciado     │  │ ⏳ Aguardando   │  │ ✅ Pipeline v3  │       │
│  │    web_search   │  │    conclusão do │  │    structure    │       │
│  │ ✅ Encontrado 3 │  │    Agent 1      │  │ ✅ Callback     │       │
│  │    APIs candida │  │                 │  │    handler      │       │
│  │ ⏳ Testando     │  │                 │  │ ✅ Testing      │       │
│  │    endpoints    │  │                 │  │    completo     │       │
│  │                 │  │                 │  │ ✅ Merged to    │       │
│  │                 │  │                 │  │    main         │       │
│  │─────────────────│  │─────────────────│  │─────────────────│       │
│  │ sonnet-4-5      │  │ gemini-flash    │  │ sonnet-4-5      │       │
│  │ 12.5k tokens    │  │ 3.2k tokens     │  │ 18.7k tokens    │       │
│  │                 │  │                 │  │                 │       │
│  │ [View Log] [Kill│  │ [View Log] [Kill│  │ [View Log] [Kill│       │
│  │ ] [Archive]     │  │ ] [Archive]     │  │ ] [Archive]     │       │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘       │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

## 🎨 Design Tokens

### Colors by Status

- **Active (🟢):** `border-l-brand-mint` - #00FF95
- **Queued (🟡):** `border-l-accent-orange` - #FF9F0A
- **Completed (🔵):** `border-l-accent-blue` - #0A84FF
- **Failed (🔴):** `border-l-accent-red` - #FF453A

### Typography

- **Headings:** `font-black text-sm uppercase tracking-widest`
- **Metadata:** `text-[10px] uppercase tracking-wider font-medium`
- **Timestamps:** `text-xs text-text-secondary`
- **Progress items:** `text-xs text-text-secondary`

### Card Spacing

- **Width:** `w-80` (320px)
- **Gap:** `gap-4` (16px)
- **Padding:** `p-4` (16px)
- **Border:** `border-l-4` (left accent)

## 📦 Component Hierarchy

```
MissionControl
├── Header
│   ├── Title + Icon
│   ├── Agent Count Badge
│   └── Connection Status
├── Filter Tabs
│   ├── All (3)
│   ├── Active (1)
│   ├── Queued (1)
│   └── Completed (1)
└── Agent Cards (horizontal scroll)
    └── AgentCard (repeated)
        ├── Header
        │   ├── Badge: "Agent #N"
        │   └── Status Badge
        ├── Task Section
        │   ├── Task Title
        │   └── Timestamp
        ├── Progress Section
        │   └── Progress Items (✅/⏳)
        └── Footer
            ├── Metadata (model + tokens)
            └── Actions
                ├── View Log
                ├── Kill
                └── Archive
```

## 🔌 Data Flow

```typescript
useAgentStream() hook
  ↓ (mock WebSocket)
  ↓
MissionControl component
  ↓ (filter by status)
  ↓
AgentCard[] components
  ↓ (user actions)
  ↓
handleViewLog() / handleKill() / handleArchive()
  ↓ (TODO: implement)
  ↓
Backend API
```

## 🧪 Mock Data Schema

```typescript
interface AgentData {
  id: string;                    // "1", "2", "3"
  status: 'active' | 'queued' | 'completed' | 'failed';
  task: string;                  // Task description
  progress: string[];            // ["✅ Step 1", "⏳ Step 2"]
  model: string;                 // "anthropic/claude-sonnet-4-5"
  tokens: number;                // 12453
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

## 🚀 Integration Points

### AgentCenter.tsx

```typescript
// Add module to navigation
{ id: 'mission-control', label: 'Mission Control', icon: 'view_column' }

// Conditional rendering
{activeModule === 'mission-control' ? (
  <MissionControl />
) : (
  // ... 3-column layout
)}
```

### Future Backend Integration

```typescript
// Replace mock in useAgentStream.ts
const ws = new WebSocket('ws://localhost:8080/agents');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setAgents(data.agents);
};
```

## 📱 Responsive Behavior

- **Desktop:** Full horizontal scroll with fixed card width (320px)
- **Mobile:** Maintains horizontal scroll, cards remain 320px
- **Tablet:** Same as mobile (no breakpoint changes)

## ⚡ Performance Notes

- Cards use `flex-shrink-0` to prevent compression
- Virtual scrolling NOT implemented (assume < 50 agents)
- StatusDot pulse uses CSS `animate-pulse` (performant)
- Re-renders optimized via `useMemo` for filtered agents

## 🔮 Roadmap

### Phase 1 (Current - Mock)
- ✅ Static mockup with 3 agents
- ✅ Filter tabs (All/Active/Queued/Completed)
- ✅ Card design with progress bullets
- ✅ Action buttons (non-functional)

### Phase 2 (WebSocket Integration)
- [ ] Real-time agent updates via WebSocket
- [ ] Dynamic progress updates
- [ ] Status transitions (queued → active → completed)

### Phase 3 (Actions)
- [ ] View Log (open modal/panel)
- [ ] Kill Agent (send SIGTERM)
- [ ] Archive Agent (move to history)

### Phase 4 (Advanced)
- [ ] Auto-archive after 24h inactivity
- [ ] Search/filter agents
- [ ] Sort by timestamp/tokens/model
- [ ] Export logs
- [ ] Metrics dashboard (total tokens, avg duration)

## 🐛 Known Issues

- [ ] No error state handling (failed WebSocket)
- [ ] No loading skeleton
- [ ] Kill button enabled on completed agents (should disable)
- [ ] No keyboard navigation
- [ ] Timestamps hardcoded to UTC (should respect user timezone)

## 📸 Visual Preview

*Note: Browser unavailable during build. To preview:*

```bash
cd /home/clawd/.openclaw/workspace/marco_os
npm run dev
# Navigate to: http://localhost:5173/marco_os/
# Click "Mission Control" in left sidebar
```

---

**Built:** 2026-02-16  
**PR:** #16  
**Branch:** `feat/mission-control`  
**Files:** 3 new + 1 modified (336 lines)
