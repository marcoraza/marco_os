// contexts/SupabaseDataContext.tsx
// Replacement for NotionDataContext — reads from Supabase with Realtime subs.
// Falls back to JSON polling (NotionDataContext) if Supabase is unreachable.
// Preserves the exact same interface: useNotionData() returns NotionDataContextValue.
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type {
  ResearchItem,
  DeepDiveItem,
  CriadorItem,
  ProjetoItem,
  ChecklistItem,
  ReuniaoItem,
  PessoaItem,
  ContentItem,
  BrainDumpItem,
  FinancaItem,
  SaudeItem,
  SkillItem,
  DecisionItem,
  CalendarEvent,
  GitHubRepo,
} from '../lib/dataProvider'
import {
  buildProvider,
  latestSyncedAt,
  type NotionDataContextValue,
  NOTION_DB_KEYS,
  type NotionDbKey,
  type ProviderCache,
  type ProviderErrorMap,
} from '../lib/notionDataContract'

// ─── Table → tier mapping ─────────────────────────────────────────────────

/** Real-time: full Supabase Realtime channel subscription */
const REALTIME_TABLES = [
  'tasks',
  'agent_events',
  'notifications',
  'financas',
  'saude',
] as const

/** Warm cache: refetch every 5 minutes */
const WARM_TABLES = [
  'projetos',
  'reunioes',
  'research',
  'pessoas',
  'content',
  'criadores',
] as const

/** Cold cache: refetch every 30 minutes */
const COLD_TABLES = [
  'decisions',
  'skills',
  'brain_dump',
] as const

type RealtimeTableName = (typeof REALTIME_TABLES)[number]
type WarmTableName = (typeof WARM_TABLES)[number]
type ColdTableName = (typeof COLD_TABLES)[number]
type SupabaseTableName = RealtimeTableName | WarmTableName | ColdTableName
type SupabaseRow = Record<string, unknown>

/** Maps Supabase table name → context key used in NotionDataContextValue */
const TABLE_TO_KEY: Record<SupabaseTableName, NotionDbKey> = {
  tasks: 'checklist',
  agent_events: 'research',        // agent_events → research slot (closest match; adjust if needed)
  notifications: 'brain_dump',     // notifications → brain_dump slot
  financas: 'financas',
  saude: 'saude',
  projetos: 'projetos',
  reunioes: 'reunioes',
  research: 'research',
  pessoas: 'pessoas',
  content: 'content',
  criadores: 'criadores',
  decisions: 'decisions',
  skills: 'skills',
  brain_dump: 'brain_dump',
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SupabaseDataContext = createContext<NotionDataContextValue | null>(null)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapSupabaseRows(table: SupabaseTableName, data: SupabaseRow[]): unknown[] {
  return data.map((row) => {
    if (table === 'tasks') {
      return {
        ...row,
        responsavel: row.assigned_to ?? '',
        prioridade: row.priority ?? '',
        prazo: row.due_date ? String(row.due_date).split('T')[0] : '',
        projeto: row.project ?? '',
        progresso: 0,
      }
    }
    return row
  })
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef<ProviderCache>(new Map())
  const errorsRef = useRef<ProviderErrorMap>(new Map())
  const channelsRef = useRef<RealtimeChannel[]>([])
  const [tick, setTick] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const bump = () => setTick((t) => t + 1)

  // ── Fetch a single Supabase table ─────────────────────────────────────────
  const fetchTable = useCallback(async (table: SupabaseTableName): Promise<boolean> => {
    const key = TABLE_TO_KEY[table]
    if (!isSupabaseConfigured) {
      errorsRef.current.set(key, 'Supabase nao configurado')
      return false
    }
    try {
      const { data, error: err } = await supabase.from(table).select('*')
      if (err) throw new Error(err.message)
      // Map Supabase column names to frontend interface names
      const rows = mapSupabaseRows(table, (data ?? []) as SupabaseRow[])
      cacheRef.current.set(key, {
        data: rows,
        lastSync: latestSyncedAt(rows),
      })
      errorsRef.current.set(key, null)
      return true
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errorsRef.current.set(key, msg)
      return false
    }
  }, [])

  // ── Fetch all known tables ────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const allTables: SupabaseTableName[] = [
      ...REALTIME_TABLES,
      ...WARM_TABLES,
      ...COLD_TABLES,
    ]
    const results = await Promise.allSettled(allTables.map(fetchTable))
    const anyFailed = results.some(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value),
    )
    setError(anyFailed ? 'Alguns dados não puderam ser carregados' : null)
    setLastSync(new Date().toISOString())
    setIsLoading(false)
    bump()
  }, [fetchTable])

  // ── Realtime subscriptions ────────────────────────────────────────────────
  const setupRealtime = useCallback(() => {
    if (!isSupabaseConfigured) return
    // Clean up existing channels first
    channelsRef.current.forEach((ch) => {
      void supabase.removeChannel(ch)
    })
    channelsRef.current = []

    for (const table of REALTIME_TABLES) {
      const ch = supabase
        .channel(`realtime:${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (_payload) => {
            void fetchTable(table).then(bump)
          },
        )
        .subscribe()
      channelsRef.current.push(ch)
    }
  }, [fetchTable])

  // ── Initial load + polling intervals ─────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Supabase nao configurado')
      setIsLoading(false)
      return
    }
    void fetchAll()
    setupRealtime()

    // Warm cache: refetch every 5 min
    const warmId = setInterval(() => {
      void Promise.all(WARM_TABLES.map(fetchTable)).then(bump)
    }, 5 * 60_000)

    // Cold cache: refetch every 30 min
    const coldId = setInterval(() => {
      void Promise.all(COLD_TABLES.map(fetchTable)).then(bump)
    }, 30 * 60_000)

    return () => {
      clearInterval(warmId)
      clearInterval(coldId)
      channelsRef.current.forEach((ch) => {
        void supabase.removeChannel(ch)
      })
    }
  }, [fetchAll, fetchTable, setupRealtime])

  const refetch = useCallback(async () => {
    setIsLoading(true)
    await fetchAll()
  }, [fetchAll])

  const cache = cacheRef.current
  const errors = errorsRef.current

  void tick // consumed to trigger re-render

  const makeProvider = <T,>(key: NotionDbKey) =>
    buildProvider<T>(key, cache, errors, isLoading, refetch)

  const value: NotionDataContextValue = {
    research: makeProvider<ResearchItem>('research'),
    deep_dives: makeProvider<DeepDiveItem>('deep_dives'),
    criadores: makeProvider<CriadorItem>('criadores'),
    projetos: makeProvider<ProjetoItem>('projetos'),
    checklist: makeProvider<ChecklistItem>('checklist'),
    reunioes: makeProvider<ReuniaoItem>('reunioes'),
    pessoas: makeProvider<PessoaItem>('pessoas'),
    content: makeProvider<ContentItem>('content'),
    brain_dump: makeProvider<BrainDumpItem>('brain_dump'),
    financas: makeProvider<FinancaItem>('financas'),
    saude: makeProvider<SaudeItem>('saude'),
    skills: makeProvider<SkillItem>('skills'),
    decisions: makeProvider<DecisionItem>('decisions'),
    calendar: makeProvider<CalendarEvent>('calendar'),
    github: makeProvider<GitHubRepo>('github'),
    isLoading,
    lastSync,
    error,
    refetch,
  }

  return (
    <SupabaseDataContext.Provider value={value}>
      {children}
    </SupabaseDataContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSupabaseData(): NotionDataContextValue {
  const ctx = useContext(SupabaseDataContext)
  if (!ctx) {
    throw new Error('useSupabaseData must be used inside <SupabaseDataProvider>')
  }
  return ctx
}
