// contexts/NotionDataContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import type {
  BrainDumpItem,
  CalendarEvent,
  ChecklistItem,
  ContentItem,
  CriadorItem,
  DecisionItem,
  DeepDiveItem,
  FinancaItem,
  GitHubRepo,
  PessoaItem,
  ProjetoItem,
  ResearchItem,
  ReuniaoItem,
  SaudeItem,
  SkillItem,
} from "../lib/dataProvider";
import {
  buildProvider,
  type NotionDataContextValue,
  NOTION_DB_FILENAMES,
  NOTION_DB_KEYS,
  type ProviderCache,
  type ProviderErrorMap,
} from "../lib/notionDataContract";

// ─── Context ─────────────────────────────────────────────────────────────────

const NotionDataContext = createContext<NotionDataContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Provider ────────────────────────────────────────────────────────────────

export function NotionDataProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef<ProviderCache>(new Map());
  const errorsRef = useRef<ProviderErrorMap>(new Map());
  const [tick, setTick] = useState(0); // bump to trigger re-render after fetch
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchAll = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    let anyError: string | null = null;

    for (let i = 0; i < NOTION_DB_KEYS.length; i++) {
      const name = NOTION_DB_KEYS[i];
      try {
        const base = import.meta.env.BASE_URL ?? '/';
        const filename = NOTION_DB_FILENAMES[name];
        const res = await fetch(`${base}data/${filename}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown[] = await res.json();
        cacheRef.current.set(name, { data, lastSync: new Date().toISOString() });
        errorsRef.current.set(name, null); // clear per-DB error on success
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errorsRef.current.set(name, msg);
        anyError = msg;
        // keep previous cache entry — no update needed, it stays
      }
      if (i < NOTION_DB_KEYS.length - 1) await sleep(100);
    }

    setError(anyError);
    setLastSync(new Date().toISOString());
    setIsLoading(false);
    setTick((t) => t + 1);
    fetchingRef.current = false;
  }, []);

  // Single interval — 30s polling
  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 30_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const refetch = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  // Rebuild context value on every tick
  const cache = cacheRef.current;
  const errors = errorsRef.current;
  const value: NotionDataContextValue = {
    research: buildProvider<ResearchItem>("research", cache, errors, isLoading, refetch),
    deep_dives: buildProvider<DeepDiveItem>("deep_dives", cache, errors, isLoading, refetch),
    criadores: buildProvider<CriadorItem>("criadores", cache, errors, isLoading, refetch),
    projetos: buildProvider<ProjetoItem>("projetos", cache, errors, isLoading, refetch),
    checklist: buildProvider<ChecklistItem>("checklist", cache, errors, isLoading, refetch),
    reunioes: buildProvider<ReuniaoItem>("reunioes", cache, errors, isLoading, refetch),
    pessoas: buildProvider<PessoaItem>("pessoas", cache, errors, isLoading, refetch),
    content: buildProvider<ContentItem>("content", cache, errors, isLoading, refetch),
    brain_dump: buildProvider<BrainDumpItem>("brain_dump", cache, errors, isLoading, refetch),
    financas: buildProvider<FinancaItem>("financas", cache, errors, isLoading, refetch),
    saude: buildProvider<SaudeItem>("saude", cache, errors, isLoading, refetch),
    skills: buildProvider<SkillItem>("skills", cache, errors, isLoading, refetch),
    decisions: buildProvider<DecisionItem>("decisions", cache, errors, isLoading, refetch),
    calendar: buildProvider<CalendarEvent>("calendar", cache, errors, isLoading, refetch),
    github: buildProvider<GitHubRepo>("github", cache, errors, isLoading, refetch),
    isLoading,
    lastSync,
    error,
    refetch,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void tick; // consumed to trigger re-render

  return (
    <NotionDataContext.Provider value={value}>
      {children}
    </NotionDataContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNotionData(): NotionDataContextValue {
  const ctx = useContext(NotionDataContext);
  if (!ctx) {
    throw new Error("useNotionData must be used inside <NotionDataProvider>");
  }
  return ctx;
}
