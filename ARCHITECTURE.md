# Mission Control V2 — Architecture Documentation

## System Overview
Mission Control V2 is a React-based dashboard for managing AI agent lifecycles. It uses TypeScript for type safety, DND Kit for drag-and-drop, and localStorage for state persistence.

## Technology Stack

### Core
- **React 19.2.4**: UI framework
- **TypeScript 5.8.2**: Type safety
- **Vite 6.2.0**: Build tool and dev server

### Libraries
- **@dnd-kit/core + sortable**: Drag-and-drop functionality
- **idb**: IndexedDB wrapper (planned for future use)

### Styling
- **Tailwind CSS**: Utility-first styling (via inline classes)
- **Custom Design System**: Zinc color palette, consistent spacing

## Project Structure

```
marco_os/
├── components/
│   └── MissionControl/
│       ├── index.tsx                 # Main container (12KB)
│       ├── AgentCardV2.tsx           # Agent card component (10KB)
│       ├── ActivityFeed.tsx          # Event stream sidebar (7KB)
│       ├── SearchBar.tsx             # Search input (2KB)
│       └── BulkActionsBar.tsx        # Bulk actions UI (5KB)
│
├── hooks/
│   ├── useAgentStream.ts             # WebSocket + agent data (12KB)
│   ├── useAgentActions.ts            # Agent operations (4KB)
│   ├── useKeyboardNav.ts             # Keyboard shortcuts (3KB)
│   └── useStatePersistence.ts        # localStorage state (2KB)
│
├── types/
│   └── mission-control.types.ts      # TypeScript interfaces (2KB)
│
├── utils/
│   ├── colors.ts                     # Design system colors (2KB)
│   └── cn.ts                         # className utility
│
├── MISSION_CONTROL_V2.md             # User guide
└── ARCHITECTURE.md                   # This file
```

## Component Architecture

### 1. MissionControlV2 (Main Container)
**Responsibility**: State management, coordination, layout

**State:**
- Agent data (from `useAgentStream`)
- UI state (filters, search, selected agents, collapsed cards)
- Persisted state (card order, collapsed, selected)

**Child Components:**
- Header (filters, search, connection status)
- BulkActionsBar (conditional, when selection exists)
- Agent cards area (horizontal scroll, drag-drop)
- ActivityFeed (sidebar, collapsible)

**Key Features:**
- Drag & drop reordering
- Keyboard navigation
- Bulk operations
- Real-time updates

### 2. AgentCardV2
**Responsibility**: Display agent details, handle card-level actions

**Props:**
- `agent`: Agent data object
- `isSelected`: Selection state
- `isCollapsed`: Collapse state
- `metrics`: Performance metrics
- Callbacks: `onToggleCollapse`, `onToggleSelect`, `onViewLogs`, `onKill`, `onArchive`

**Features:**
- Drag handle (via @dnd-kit/sortable)
- Checkbox for selection
- Collapsible content
- Sparkline chart for token usage
- Performance metrics grid
- Hover actions

**Optimizations:**
- Uses `useSortable` for drag-drop
- Memoized expensive calculations
- CSS transitions (not JS animations)

### 3. ActivityFeed
**Responsibility**: Display real-time event stream

**Props:**
- `events`: Array of activity events
- `isCollapsed`: Collapsed state
- `onToggle`: Toggle collapsed callback

**Features:**
- Auto-scroll to new events
- Manual scroll detection
- Event type filtering
- Collapsible to thin sidebar

**Performance:**
- Max 100 events in memory
- Virtual scrolling (planned for high volume)

### 4. SearchBar
**Responsibility**: Search input with clear button

**Props:**
- `value`, `onChange`, `placeholder`
- Forward ref for keyboard focus

### 5. BulkActionsBar
**Responsibility**: Bulk operation UI

**Props:**
- `count`: Number of selected agents
- Callbacks: `onKill`, `onArchive`, `onExport`, `onDeselectAll`
- `isProcessing`: Loading state

**Features:**
- Keyboard shortcut hints
- Processing overlay
- Action confirmation (via parent)

## Data Flow

### Agent Data Stream
```
WebSocket Server (mocked)
  ↓
useAgentStream hook
  ↓
MissionControlV2 (agents state)
  ↓
AgentCardV2 components
```

### State Persistence Flow
```
User Action (drag, collapse, select)
  ↓
State update in MissionControlV2
  ↓
useStatePersistence hook
  ↓
localStorage.setItem()
```

### Action Flow (Kill Agent Example)
```
User clicks "Kill" on card
  ↓
onKill callback → MissionControlV2
  ↓
killAgent() from useAgentActions
  ↓
API call (mocked, returns immediately)
  ↓
Optimistic UI update
  ↓
refresh() to fetch latest state
```

## Hooks Architecture

### useAgentStream
**Purpose**: Manage WebSocket connection and agent data

**State:**
- `agents`: Array of AgentData
- `activityFeed`: Array of ActivityEvent
- `isConnected`: WebSocket connection status
- `isRefreshing`: Manual refresh in progress

**Methods:**
- `refresh()`: Force refresh agent data
- `addActivityEvent()`: Add event to feed
- `getPerformanceMetrics()`: Calculate metrics for agent

**Implementation Notes:**
- Currently uses mock data
- WebSocket code commented out, ready to uncomment
- Auto-generates token history for sparklines

### useAgentActions
**Purpose**: Agent lifecycle operations

**Methods:**
- `killAgent(id)`: Terminate agent
- `archiveAgent(id)`: Archive agent
- `exportLogs(id)`: Export logs to file
- `bulkAction(action)`: Process bulk operation

**State:**
- `isProcessing`: Operation in progress
- `lastError`: Last error message

**Error Handling:**
- Try-catch with error state
- Returns boolean success/failure
- Parent handles UI feedback

### useKeyboardNav
**Purpose**: Global keyboard shortcut handler

**Options:**
- Callbacks for each shortcut
- `enabled` flag to toggle on/off

**Implementation:**
- Single event listener on window
- Ignores events when input focused (except Esc)
- Cleans up on unmount

### useStatePersistence
**Purpose**: Generic localStorage persistence

**Generic Type**: `<T>` for any serializable data
**Returns**: `{ value, setValue, reset }`

**Specialized Hooks:**
- `useCollapsedCards()`: Set<string>
- `useCardOrder()`: string[]
- `useSelectedAgents()`: Set<string>
- `useFilterState()`: filter object

## Type System

### Core Types
```typescript
type AgentStatus = 'active' | 'queued' | 'completed' | 'failed';

interface AgentData {
  id: string;
  status: AgentStatus;
  task: string;
  progress: string[];
  model: string;
  tokens: number;
  owner?: string;
  createdAt: string;
  updatedAt: string;
  dependencies?: string[];
  estimatedCompletion?: string;
  tokenHistory?: TokenUsagePoint[];
}
```

### Supporting Types
- `ActivityEvent`: Event stream entries
- `AgentTemplate`: Spawn templates (future)
- `SavedFilter`: Filter presets (future)
- `PerformanceMetrics`: Calculated metrics
- `BulkAction`: Bulk operation payload

## Design System

### Colors
Defined in `utils/colors.ts`:

```typescript
bg: {
  app: '#0a0a0a',      // Darkest background
  surface: '#18181b',  // zinc-900
  card: '#27272a',     // zinc-800
  hover: '#3f3f46',    // zinc-700
}

status: {
  active: '#10b981',   // emerald-500
  queued: '#f59e0b',   // amber-500
  completed: '#3b82f6', // blue-500
  failed: '#ef4444',    // red-500
}
```

### Spacing
- Card width: 320px
- Card gap: 16px
- Card padding: 20px
- Section gap: 16px
- Container padding: 24px

### Typography
- Agent ID: text-[10px] uppercase tracking-widest font-black
- Task title: text-sm font-bold leading-tight
- Progress: text-xs leading-relaxed
- Metadata: text-[10px] font-mono uppercase

### Animations
- Duration: 200ms
- Easing: ease-in-out
- Card hover: translateY(-2px) + shadow increase
- Collapse: height transition with overflow hidden

## Performance Optimizations

### 1. Memoization
- `filteredAgents` useMemo (filters + search)
- `sortedAgents` useMemo (card order)
- `counts` useMemo (status counts)
- `selectedAgents` useMemo (selection array)

### 2. Callback Stability
- All action handlers wrapped in useCallback
- Dependencies minimized

### 3. State Management
- Persisted state separated from transient state
- localStorage writes debounced (via useEffect)

### 4. Component Rendering
- Conditional rendering for empty states
- Lazy loading (planned for modals)
- Virtual scrolling (planned for >20 cards)

### 5. Bundle Optimization
- Code splitting (planned)
- Tree shaking (enabled via Vite)
- No lodash or moment.js (native JS only)

## Testing Strategy (Ready)

### Unit Tests (Not yet written, but structure supports it)
- Hooks: Test in isolation with React Testing Library
- Utils: Pure functions, easy to test
- Components: Snapshot tests + interaction tests

### Integration Tests
- Card drag & drop
- Bulk operations
- Keyboard navigation
- State persistence

### E2E Tests (Planned)
- Full user flows
- Cross-browser compatibility

## Deployment

### Build Process
```bash
npm run build
# Output: dist/ folder
# Bundle size: ~450KB gzipped
# Build time: ~2.5s
```

### GitHub Pages
```bash
# Deploy script
npm run build
git add dist -f
git commit -m "Deploy"
git push origin gh-pages
```

### Environment Variables
None required (no backend secrets)

## WebSocket Integration (When Ready)

### Connection Setup
```typescript
const ws = new WebSocket('wss://api.marco-os.com/agents');

ws.onopen = () => {
  setIsConnected(true);
  ws.send(JSON.stringify({ type: 'subscribe', channel: 'agents' }));
};
```

### Message Handling
```typescript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'agent_update':
      // Update single agent
      setAgents(prev => updateAgent(prev, data.agent));
      break;
    case 'activity_event':
      // Add to feed
      addActivityEvent(data.event);
      break;
  }
};
```

### Error Handling
- Reconnect on close with exponential backoff
- Fallback to polling if WebSocket unavailable
- Show connection status in UI

## Security Considerations

### Input Validation
- All user inputs sanitized
- XSS protection via React (automatic escaping)

### localStorage
- No sensitive data stored
- Only UI preferences

### API Calls (Future)
- CSRF protection
- Rate limiting
- Authentication via JWT

## Browser Compatibility

### Minimum Versions
- Chrome 90+ (May 2021)
- Firefox 88+ (April 2021)
- Safari 14+ (September 2020)
- Edge 90+ (May 2021)

### Polyfills
None required (target ES2020+)

## Known Issues & Limitations

1. **WebSocket Mock**: Real backend not yet implemented
2. **Virtual Scrolling**: Not yet added (needed for 100+ cards)
3. **Log Viewer**: Modal not yet implemented
4. **Graph View**: Dependencies visualization planned for V3
5. **Mobile**: Responsive design exists but desktop-first

## Future Enhancements (V3 Roadmap)

1. **Agent Templates**: Pre-defined agent configs for quick spawn
2. **Dependencies Graph**: D3.js visualization of agent relationships
3. **Live Logs**: Full-screen modal with syntax highlighting
4. **Notifications**: Toast system + sound alerts
5. **Saved Filters**: Custom filter presets
6. **Export**: JSON/CSV export of agent data
7. **Theming**: Light mode support
8. **Analytics**: Dashboard with charts and metrics

## Maintenance Guidelines

### Adding New Agent Status
1. Update `AgentStatus` type in `mission-control.types.ts`
2. Add color config in `utils/colors.ts`
3. Update filter tabs in `MissionControlV2/index.tsx`
4. Add to counts calculation

### Adding New Bulk Action
1. Add method to `useAgentActions` hook
2. Update `BulkAction` type
3. Add button to `BulkActionsBar`
4. Wire callback in `MissionControlV2`

### Adding New Keyboard Shortcut
1. Add callback prop to `useKeyboardNav`
2. Implement handler in component
3. Update keyboard shortcuts table in `MISSION_CONTROL_V2.md`

## Contact & Support
For questions or issues, contact Marco (@marcoraza) or file an issue in the GitHub repository.
