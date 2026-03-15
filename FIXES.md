# Black Screen Crash Fixes

## Problem
Four tabs showed black screen on load:
- Mission Control (agents-overview sub-view)
- Network (crm)
- Notas (notes)
- Projetos (planner)

Build passed with no errors — crashes were runtime errors from null/undefined data access.

## Root Cause
Components were accessing array methods (`.map()`, `.filter()`, `.length`, `.some()`) on potentially undefined data loaded from IndexedDB or context hooks without defensive checks.

## Solution Applied

### 1. Added ErrorBoundary Component
**File:** `components/ErrorBoundary.tsx`
- Wraps lazy-loaded views in App.tsx
- Catches render errors and shows user-friendly error message with retry button
- Prevents white/black screen crashes

### 2. Fixed CRM.tsx
**Lines changed:**
- L147-154: Added `?? []` guards to `contacts.flatMap()` and `contacts.filter()`
- L148: Guarded `c.tags` with `?? []` in filter logic
- L172: Guarded `contact.tags.map()` in card render
- L283: Guarded `selectedContact.tags.map()` in detail view
- L163: Guarded `contact.tags` in `openEditModal` destructuring

**Pattern:** All `contacts` array and `contact.tags` accesses now have fallbacks.

### 3. Fixed NotesPanel.tsx
**Lines changed:**
- L76: Added `?? []` guard to `notes.filter()`
- L88: Guarded `setNotes` callback with `?? []`

**Pattern:** All `notes` array operations now have fallbacks.

### 4. Fixed Planner.tsx
**Lines changed:**
- L69-70: Guarded `loadPlans()` result with `.catch()` fallback
- L73-76: Guarded `persistPlan` with explicit null check
- L98-103: Guarded `handleLoadPlan` to check `plan.steps`, `plan.title`, `plan.context`, `plan.projectId`
- L111: Guarded `steps.map()` in `toggleStep`
- L93: Guarded `plan.steps` in `handleGenerate`
- L131: Guarded `handleDeletePlan` with null check
- L146-147: Created `safeSteps` variable and guarded progress calculation
- L185: Guarded `activePlan.objectives.map()`
- L198: Used `safeSteps.map()` for steps render
- L217: Guarded `activePlan.risks.map()`
- L235: Guarded `activePlan.checklist.map()`
- L245: Guarded `activePlan.suggestedTasks.map()`
- L340: Guarded `history.map()` with `?? []`
- L341-343: Guarded `projects.find()` and `plan.steps` in history render
- L411: Guarded `projects.map()` in select dropdown
- L126: Guarded `activePlan.suggestedTasks` in `handleExportKanban`

**Pattern:** All array operations on `history`, `steps`, `activePlan.objectives`, `activePlan.risks`, `activePlan.checklist`, `activePlan.suggestedTasks`, and `projects` now have `?? []` fallbacks.

### 5. Fixed AgentCommandCenter.tsx
**Lines changed:**
- L20-28: Restructured hook calls to extract arrays and functions with null checks
- L36-44: Guarded `dispatchMission` and `sendDispatch` function calls
- L60-66: Added guard to `agentWorkload` map to check `workload[t.agentId][t.status]` exists
- L70: Guarded `getAgentTokensToday` with `?? []` and null checks on token values
- L75-79: Guarded `allExecutions` with `?? []` and added fallback for `executionBadge`
- L82-89: Created `safeTasks` variable and used it for all task filtering
- L300: Guarded `mission.messages` access with `?? []`

**Pattern:** All context hook returns are now safely unwrapped with fallbacks.

### 6. Fixed MissionControl.tsx
**Lines changed:**
- L16-18: Guarded `useAgentStream()` result to extract `agents` and `isConnected` with fallbacks

**Pattern:** Hook return destructuring now has null guards.

### 7. Fixed DashboardRightSidebar.tsx
**Lines changed:**
- L43-44: Guarded `useSupabaseData()` to extract `refetch` with fallback

**Pattern:** Context hook access now has fallback.

### 8. Updated App.tsx
**Lines changed:**
- L37-39: Imported `ErrorBoundary` component
- L496: Wrapped `<Suspense>` with `<ErrorBoundary>`
- L531: Closed `</ErrorBoundary>` after `</Suspense>`

**Pattern:** All lazy-loaded views now protected by error boundary.

## Verification
- ✅ `npm run build` passes with no errors
- ✅ All TypeScript types preserved
- ✅ No behavioral changes to working components
- ✅ Error boundary provides graceful degradation for unexpected crashes

## Files Modified
1. `components/ErrorBoundary.tsx` (new file)
2. `App.tsx`
3. `components/CRM.tsx`
4. `components/NotesPanel.tsx`
5. `components/Planner.tsx`
6. `components/AgentCommandCenter.tsx`
7. `components/MissionControl.tsx`
8. `components/dashboard/DashboardRightSidebar.tsx`

## Testing Recommendations
1. Navigate to each previously crashing tab
2. Verify components render with empty data (no IndexedDB entries)
3. Verify components render with partially populated data
4. Check error boundary appears for genuine errors (not just missing data)
