# Mission Control v3 - Interactive Features

## 🚀 3 New Features Implemented

### 1. ⏱️ Auto-refresh Every 5 Seconds

**Implementation:**
```typescript
// MissionControl.tsx
useEffect(() => {
  const interval = setInterval(() => {
    refresh();
  }, 5000);

  return () => clearInterval(interval);
}, [refresh]);
```

**Visual Feedback:**
- Small spinner icon in header (top-right)
- Text: "Updating..." (gray-400)
- Shows only when `isRefreshing=true`
- Duration: ~500ms per refresh

**User Experience:**
- Automatic updates without page reload
- Real-time agent status tracking
- Non-intrusive visual indicator
- Maintains scroll position

---

### 2. 🎯 Drag & Drop to Reorder Cards

**Library:** `@dnd-kit` (lightweight, React 18 compatible)
- `@dnd-kit/core` - Core DnD logic
- `@dnd-kit/sortable` - Sortable containers
- `@dnd-kit/utilities` - CSS utilities

**Implementation:**
```typescript
// MissionControl.tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={filteredAgents.map(a => a.id)}
    strategy={horizontalListSortingStrategy}
  >
    {filteredAgents.map(agent => (
      <AgentCard key={agent.id} agent={agent} />
    ))}
  </SortableContext>
</DndContext>
```

**AgentCard Integration:**
```typescript
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = 
  useSortable({ id: agent.id });

// Drag handle button
<button
  {...listeners}
  className="cursor-grab active:cursor-grabbing"
>
  <HamburgerIcon />
</button>
```

**Features:**
- **Drag handle:** Hamburger icon (3 horizontal lines) next to "Agent N"
- **Cursor feedback:** `cursor-grab` → `cursor-grabbing`
- **Visual state:** Opacity 0.5 + z-index 50 during drag
- **Persistence:** Order saved to localStorage (`mission-control-card-order`)
- **Survives refresh:** localStorage loaded on mount

**User Experience:**
- Click and hold drag handle
- Move card horizontally to new position
- Release to drop
- Order persists across page reloads

---

### 3. 📦 Collapse/Expand Cards

**Implementation:**
```typescript
// AgentCard.tsx
const [isCollapsed, setIsCollapsed] = useState(() => {
  const saved = localStorage.getItem(`agent-card-collapsed-${agent.id}`);
  return saved === 'true';
});

useEffect(() => {
  localStorage.setItem(`agent-card-collapsed-${agent.id}`, String(isCollapsed));
}, [isCollapsed, agent.id]);
```

**Visual States:**

**Collapsed (~80px height):**
```
┌──────────────────┐
│🍔 Agent 1 4:15 PM│ ← Drag handle + title + timestamp
│[Active] ˅ 🔄 ✕   │ ← Badge + collapse + refresh + close
└──────────────────┘
```

**Expanded (variable height):**
```
┌──────────────────┐
│🍔 Agent 1 4:15 PM│
│[Active] ˄ 🔄 ✕   │
│──────────────────│
│Task title here   │ ← Full task description
│                  │
│Progress text...  │ ← All progress paragraphs
│More details...   │
│                  │
│──────────────────│
│model | tokens    │ ← Footer metadata
└──────────────────┘
```

**Toggle Button:**
- Icon: Chevron (down `˅` → up `˄`)
- Position: After status badge, before refresh icon
- Animation: Rotates 180° (`transition-transform duration-200`)
- Hover: `hover:bg-zinc-700`

**Animation:**
```css
transition: all 200ms ease-in-out;
overflow: hidden; /* Prevents content from showing during transition */
```

**Persistence:**
- Key: `agent-card-collapsed-{agent.id}`
- Value: `"true"` or `"false"` (string)
- Scope: Per agent ID (not global)

**User Experience:**
- Click chevron to toggle
- Smooth height transition
- Collapsed cards save screen space
- State persists across refreshes
- Can mix collapsed/expanded in same view

---

## 🔧 Technical Details

### State Management

**localStorage Keys:**
```typescript
// Card order (array of agent IDs)
'mission-control-card-order': '["1", "2", "3"]'

// Collapse state per agent
'agent-card-collapsed-1': 'false'
'agent-card-collapsed-2': 'true'
'agent-card-collapsed-3': 'false'
```

**Hook API:**
```typescript
// useAgentStream.ts
export function useAgentStream() {
  return {
    agents: AgentData[],
    isConnected: boolean,
    isRefreshing: boolean,  // ⭐ NEW
    refresh: () => void      // ⭐ NEW
  };
}
```

### Performance

**Bundle Size Impact:**
```
Before (v2): 501.98 kB (gzip: 120.31 kB)
After  (v3): 551.19 kB (gzip: 137.15 kB)
Delta:       +49.21 kB (+16.84 kB gzipped)
```

**@dnd-kit Libraries:**
- Core: ~20 kB gzipped
- Sortable: ~15 kB gzipped
- Utilities: ~3 kB gzipped

**Why @dnd-kit over react-beautiful-dnd:**
- Better React 18 support
- Smaller bundle size
- Better TypeScript types
- Active maintenance
- No strict mode warnings

### Accessibility

**Drag & Drop:**
- Keyboard support via `KeyboardSensor`
- Screen reader announcements
- Focus management
- ARIA attributes via `useSortable`

**Collapse/Expand:**
- ARIA labels on buttons
- Keyboard accessible (Space/Enter)
- Visual state changes clear
- No content hidden from screen readers (just height)

---

## 🎨 Visual Design

### Drag Handle Icon

```svg
<!-- Hamburger lines (3 horizontal) -->
<svg className="w-4 h-4 text-gray-400">
  <path d="M4 8h16M4 16h16" />
</svg>
```

### Collapse Icon (Chevron)

```svg
<!-- Down chevron (collapsed) -->
<svg className="w-4 h-4 text-gray-400" style={{ transform: 'rotate(0deg)' }}>
  <path d="M19 9l-7 7-7-7" />
</svg>

<!-- Up chevron (expanded) -->
<svg style={{ transform: 'rotate(180deg)' }}>
  <path d="M19 9l-7 7-7-7" />
</svg>
```

### Refresh Spinner

```svg
<!-- Spinning circle -->
<svg className="w-3 h-3 animate-spin">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
</svg>
```

---

## 🧪 Testing

### Auto-refresh
```typescript
// Wait for 5 seconds
await new Promise(resolve => setTimeout(resolve, 5000));

// Check that refresh was called
expect(mockRefresh).toHaveBeenCalled();

// Verify visual indicator shows
expect(screen.getByText('Updating...')).toBeInTheDocument();
```

### Drag & Drop
```typescript
// Simulate drag
const dragHandle = screen.getByTitle('Drag to reorder');
fireEvent.mouseDown(dragHandle);
fireEvent.mouseMove(dragHandle, { clientX: 100 });
fireEvent.mouseUp(dragHandle);

// Check order changed
const order = JSON.parse(localStorage.getItem('mission-control-card-order'));
expect(order).toEqual(['2', '1', '3']);
```

### Collapse/Expand
```typescript
// Click toggle
const toggleBtn = screen.getByTitle('Collapse');
fireEvent.click(toggleBtn);

// Check localStorage
expect(localStorage.getItem('agent-card-collapsed-1')).toBe('true');

// Check height class applied
const card = screen.getByText('Agent 1').closest('div');
expect(card).toHaveClass('h-[80px]');
```

---

## 📊 User Flows

### Flow 1: First-time user
1. Opens Mission Control
2. Sees all cards expanded (default)
3. Auto-refresh kicks in after 5s
4. Can drag cards to preferred order
5. Can collapse cards to save space
6. Order + collapse state saved
7. Next visit: same layout

### Flow 2: Power user workflow
1. Opens Mission Control
2. Active agents expanded (monitoring)
3. Completed agents collapsed (archived)
4. Reorder by priority (drag)
5. Auto-refresh keeps data fresh
6. Manual refresh via icon if needed
7. Close completed agents

### Flow 3: Mobile user
1. Opens on phone (320px cards)
2. Horizontal scroll still works
3. Drag handle slightly harder (finger size)
4. Collapse/expand essential (screen space)
5. Auto-refresh maintains state
6. localStorage works on mobile

---

## 🐛 Known Issues & Limitations

1. **Drag on touch devices:** Requires careful touch target (24px minimum)
2. **Refresh race condition:** If drag during refresh, might re-sort incorrectly
3. **localStorage limit:** ~5-10 MB total (order array small, but watch for scale)
4. **No undo:** Drag is permanent (no Ctrl+Z)
5. **Collapse animation:** Height transition can be janky with lots of content
6. **Auto-refresh pause:** No pause/resume (always 5s interval)

---

## 🚀 Future Enhancements

### Phase 1 (Easy Wins)
- [ ] Pause auto-refresh on tab blur (save battery)
- [ ] Manual refresh button (force refresh now)
- [ ] Collapse all / Expand all buttons
- [ ] Reset order button
- [ ] Drag preview (ghost card)

### Phase 2 (Advanced)
- [ ] Configurable refresh interval (5s / 10s / 30s)
- [ ] Undo/redo for drag operations
- [ ] Multi-select cards (drag multiple)
- [ ] Card grouping (by status)
- [ ] Virtual scrolling (if >50 cards)

### Phase 3 (Power User)
- [ ] Saved layouts (presets)
- [ ] Keyboard shortcuts (J/K navigate, X collapse)
- [ ] Export/import order
- [ ] Sync order across devices (backend)
- [ ] Drag between tabs (move queued → active)

---

## 📝 Code Examples

### Custom refresh trigger
```typescript
// In parent component
const { refresh } = useAgentStream();

// Manual refresh button
<button onClick={() => refresh()}>
  Refresh Now
</button>
```

### Reset card order
```typescript
const resetOrder = () => {
  localStorage.removeItem('mission-control-card-order');
  window.location.reload(); // Force re-init
};
```

### Collapse all cards
```typescript
const collapseAll = () => {
  agents.forEach(agent => {
    localStorage.setItem(`agent-card-collapsed-${agent.id}`, 'true');
  });
  window.location.reload();
};
```

---

## ✅ Acceptance Criteria (v3)

All v2 criteria PLUS:

- ✅ Auto-refresh every 5 seconds
- ✅ Visual spinner during refresh
- ✅ Drag handle icon visible
- ✅ Cursor changes on drag (grab/grabbing)
- ✅ Opacity 0.5 during drag
- ✅ Order persists in localStorage
- ✅ Collapse button with chevron icon
- ✅ Smooth height transition (200ms)
- ✅ Collapsed state ~80px height
- ✅ Collapse state persists per agent
- ✅ Keyboard accessible (drag + collapse)
- ✅ No console errors
- ✅ Build passes
- ✅ Bundle size reasonable (<600 kB)

---

**Version:** v3  
**Date:** 2026-02-16  
**Commit:** `c53e9bf`  
**Bundle:** 551.19 kB (gzip: 137.15 kB)  
**Features:** 3/3 implemented  
**Status:** ✅ Production ready
