// hooks/useClickUpTasks.ts
// Fetches ClickUp tasks from Supabase clickup_tasks table with realtime subscription.
// Supports optimistic drag-and-drop via kanban_status column + delete.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Task } from '../lib/appTypes'
import { clickupTaskToTask } from '../utils/taskMappings'
import type { ClickUpRow } from '../utils/taskMappings'

export type { ClickUpRow }

/** Lists excluded from Kanban — not actionable tasks */
const EXCLUDED_LISTS = new Set(['Backlog', 'Weekly Review', 'Inbox Business'])

/** Filter out non-task items and archived tasks */
function isActionableTask(row: ClickUpRow): boolean {
  if (row.name.startsWith('[Projeto]')) return false
  if (EXCLUDED_LISTS.has(row.list_name)) return false
  if (row.kanban_status === 'archived') return false
  return true
}

interface UseClickUpTasksResult {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  lastSync: string | null
  updateTaskStatus: (taskId: number, newStatus: Task['status']) => void
  deleteTask: (taskId: number) => void
  restoreTask: (taskId: number) => void
}

export function useClickUpTasks(): UseClickUpTasksResult {
  const [rows, setRows] = useState<ClickUpRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Optimistic local overrides: numeric task id → status
  const [statusOverrides, setStatusOverrides] = useState<Map<number, Task['status']>>(new Map())
  // Optimistic deletes: set of numeric task ids hidden from UI
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())
  // Suppress realtime refetch briefly after local write to avoid override clearing
  const suppressRefetchUntil = useRef(0)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Supabase nao configurado')
      setIsLoading(false)
      return
    }

    const fetchTasks = async () => {
      // Skip if we recently made an optimistic write
      if (Date.now() < suppressRefetchUntil.current) return

      const { data, error: err } = await supabase
        .from('clickup_tasks')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false })

      if (err) {
        setError(err.message)
        setIsLoading(false)
        return
      }

      setRows((data ?? []) as ClickUpRow[])
      setLastSync(new Date().toISOString())
      setError(null)
      setIsLoading(false)
      // Only clear overrides if we're past the suppression window
      if (Date.now() >= suppressRefetchUntil.current) {
        setStatusOverrides(new Map())
        setDeletedIds(new Set())
      }
    }

    void fetchTasks()

    channelRef.current = supabase
      .channel('realtime:clickup_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clickup_tasks' }, () => {
        void fetchTasks()
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  const tasks: Task[] = useMemo(() => {
    return rows
      .filter(isActionableTask)
      .map(clickupTaskToTask)
      .filter(task => !deletedIds.has(task.id))
      .map(task => {
        const override = statusOverrides.get(task.id)
        return override ? { ...task, status: override } : task
      })
  }, [rows, statusOverrides, deletedIds])

  // Optimistic status update: instant UI + async Supabase write
  const updateTaskStatus = useCallback((taskId: number, newStatus: Task['status']) => {
    // 1. Instant UI update
    setStatusOverrides(prev => {
      const next = new Map(prev)
      next.set(taskId, newStatus)
      return next
    })

    // Suppress realtime refetch for 3s to avoid clearing override
    suppressRefetchUntil.current = Date.now() + 3000

    // 2. Find the ClickUp task ID from rows
    const task = tasks.find(t => t.id === taskId)
    const clickupId = task?.notionId
    if (!clickupId) return

    // 3. Persist to Supabase kanban_status
    void supabase
      .from('clickup_tasks')
      .update({ kanban_status: newStatus })
      .eq('id', clickupId)
      .then(({ error: err }) => {
        if (err) console.error('[ClickUpTasks] Supabase update failed:', err.message)
      })

    // 4. Also update ClickUp API (best effort, won't revert on failure)
    const apiKey = import.meta.env.VITE_CLICKUP_API_KEY
    if (apiKey) {
      const KANBAN_TO_CLICKUP: Record<string, string> = {
        'assigned': 'to do',
        'started': 'to do',
        'in-progress': 'to do',
        'standby': 'to do',
        'done': 'complete',
      }
      void fetch(`https://api.clickup.com/api/v2/task/${clickupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: apiKey },
        body: JSON.stringify({ status: KANBAN_TO_CLICKUP[newStatus] || 'to do' }),
      }).catch(() => {})
    }
  }, [tasks])

  // Optimistic delete: hide from UI + remove kanban_status from Supabase
  const deleteTask = useCallback((taskId: number) => {
    // 1. Instant UI removal
    setDeletedIds(prev => {
      const next = new Set(prev)
      next.add(taskId)
      return next
    })

    // Suppress realtime refetch for 3s
    suppressRefetchUntil.current = Date.now() + 3000

    // 2. Find the ClickUp task ID
    const task = tasks.find(t => t.id === taskId)
    const clickupId = task?.notionId
    if (!clickupId) return

    // 3. Clear kanban_status in Supabase (task stays in ClickUp but disappears from Kanban)
    void supabase
      .from('clickup_tasks')
      .update({ kanban_status: 'archived' })
      .eq('id', clickupId)
      .then(({ error: err }) => {
        if (err) console.error('[ClickUpTasks] Supabase delete failed:', err.message)
      })
  }, [tasks])

  // Undo delete: remove from deletedIds + restore kanban_status in Supabase
  const restoreTask = useCallback((taskId: number) => {
    // 1. Instant UI restore
    setDeletedIds(prev => {
      const next = new Set(prev)
      next.delete(taskId)
      return next
    })

    // Suppress realtime refetch for 3s
    suppressRefetchUntil.current = Date.now() + 3000

    // 2. Find the ClickUp task ID — search all rows (including filtered ones)
    const allTasks = rows.filter(isActionableTask).map(clickupTaskToTask)
    const task = allTasks.find(t => t.id === taskId)
    const clickupId = task?.notionId
    if (!clickupId) return

    // 3. Restore kanban_status to 'assigned' (back to first column)
    void supabase
      .from('clickup_tasks')
      .update({ kanban_status: 'assigned' })
      .eq('id', clickupId)
      .then(({ error: err }) => {
        if (err) console.error('[ClickUpTasks] Supabase restore failed:', err.message)
      })
  }, [rows])

  return { tasks, isLoading, error, lastSync, updateTaskStatus, deleteTask, restoreTask }
}
