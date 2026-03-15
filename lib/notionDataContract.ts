import type {
  BrainDumpItem,
  CalendarEvent,
  ChecklistItem,
  ContentItem,
  CriadorItem,
  DataProvider,
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
} from './dataProvider';

export const NOTION_DB_KEYS = [
  'research',
  'deep_dives',
  'criadores',
  'projetos',
  'checklist',
  'reunioes',
  'pessoas',
  'content',
  'brain_dump',
  'financas',
  'saude',
  'skills',
  'decisions',
  'calendar',
  'github',
] as const;

export type NotionDbKey = (typeof NOTION_DB_KEYS)[number];

export const NOTION_DB_FILENAMES: Record<NotionDbKey, string> = {
  research: 'research',
  deep_dives: 'deep-dives',
  criadores: 'criadores',
  projetos: 'projetos',
  checklist: 'checklists',
  reunioes: 'reunioes',
  pessoas: 'pessoas',
  content: 'content',
  brain_dump: 'brain-dump',
  financas: 'financas',
  saude: 'saude',
  skills: 'skills',
  decisions: 'decisions',
  calendar: 'calendar',
  github: 'github',
};

export interface NotionDataContextValue {
  research: DataProvider<ResearchItem>;
  deep_dives: DataProvider<DeepDiveItem>;
  criadores: DataProvider<CriadorItem>;
  projetos: DataProvider<ProjetoItem>;
  checklist: DataProvider<ChecklistItem>;
  reunioes: DataProvider<ReuniaoItem>;
  pessoas: DataProvider<PessoaItem>;
  content: DataProvider<ContentItem>;
  brain_dump: DataProvider<BrainDumpItem>;
  financas: DataProvider<FinancaItem>;
  saude: DataProvider<SaudeItem>;
  skills: DataProvider<SkillItem>;
  decisions: DataProvider<DecisionItem>;
  calendar: DataProvider<CalendarEvent>;
  github: DataProvider<GitHubRepo>;
  isLoading: boolean;
  lastSync: string | null;
  error: string | null;
  refetch: () => Promise<void>;
}

export type ProviderCacheEntry = { data: unknown[]; lastSync: string | null };
export type ProviderCache = Map<NotionDbKey, ProviderCacheEntry>;
export type ProviderErrorMap = Map<NotionDbKey, string | null>;

export function buildProvider<T>(
  key: NotionDbKey,
  cache: ProviderCache,
  errors: ProviderErrorMap,
  isLoading: boolean,
  refetch: () => Promise<void>,
): DataProvider<T> {
  const entry = cache.get(key);
  return {
    items: (entry?.data ?? []) as T[],
    isLoading,
    lastSync: entry?.lastSync ?? null,
    error: errors.get(key) ?? null,
    refetch,
  };
}

export function latestSyncedAt(rows: unknown[]): string | null {
  if (rows.length === 0) return null;
  let latest: string | null = null;
  for (const row of rows) {
    const record = row as Record<string, unknown>;
    const syncedAt = record.synced_at;
    if (typeof syncedAt === 'string' && (!latest || syncedAt > latest)) {
      latest = syncedAt;
    }
  }
  return latest ?? new Date().toISOString();
}
