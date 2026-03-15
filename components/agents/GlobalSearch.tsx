import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';

interface SearchResult {
  id?: string;
  source: 'tasks' | 'memory' | 'crons' | 'agents' | string;
  title: string;
  snippet?: string;
  filePath?: string;
  matchingLine?: string;
  notionUrl?: string;
  url?: string;
}

interface GroupedResults {
  tasks: SearchResult[];
  memory: SearchResult[];
  crons: SearchResult[];
  agents: SearchResult[];
}

const SOURCE_META: Record<string, { icon: string; label: string }> = {
  tasks: { icon: 'task_alt', label: 'Tarefas' },
  memory: { icon: 'memory', label: 'Memória' },
  crons: { icon: 'schedule', label: 'Crons' },
  agents: { icon: 'smart_toy', label: 'Agentes' },
};

const bridgeBase = import.meta.env.VITE_FORM_API_URL || '';
const bridgeHeaders: Record<string, string> = {
  Authorization: `Bearer ${import.meta.env.VITE_FORM_API_TOKEN || ''}`,
};

function groupResults(results: SearchResult[]): GroupedResults {
  const grouped: GroupedResults = { tasks: [], memory: [], crons: [], agents: [] };
  for (const r of results) {
    const key = r.source as keyof GroupedResults;
    if (key in grouped) grouped[key].push(r);
  }
  return grouped;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    if (!bridgeBase) {
      setResults([]);
      setSearched(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${bridgeBase}/search?q=${encodeURIComponent(q)}`,
        { headers: bridgeHeaders }
      );
      const data = await res.json();
      const list = data.ok ? (data.results ?? data.data ?? []) : [];
      setResults(Array.isArray(list) ? list : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  const grouped = groupResults(results);
  const hasResults = results.length > 0;
  const orderedSources: (keyof GroupedResults)[] = ['tasks', 'memory', 'crons', 'agents'];

  const openResult = (r: SearchResult) => {
    const url = r.notionUrl ?? r.url;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <SectionLabel icon="search">BUSCA GLOBAL</SectionLabel>

      {/* Search input */}
      <div className="relative">
        <Icon
          name="search"
          size="sm"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar em tarefas, memória, crons, agentes..."
          className="w-full bg-surface border border-border-panel rounded-sm pl-9 pr-4 py-2.5 text-[12px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-mint/40"
        />
        {loading && (
          <Icon
            name="progress_activity"
            size="sm"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-mint animate-spin"
          />
        )}
      </div>

      {/* Empty state – before any search */}
      {!searched && !loading && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Icon name="search" size="lg" className="opacity-20" />
            <span className="text-[11px]">Digite para pesquisar</span>
          </div>
        </Card>
      )}

      {/* No results */}
      {searched && !loading && !hasResults && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Icon name="search_off" size="lg" className="opacity-30" />
            <span className="text-[11px]">Nenhum resultado encontrado para &ldquo;{query}&rdquo;</span>
          </div>
        </Card>
      )}

      {/* Grouped results */}
      {hasResults && (
        <div className="space-y-4">
          {orderedSources
            .filter((src) => grouped[src].length > 0)
            .map((src) => {
              const meta = SOURCE_META[src] ?? { icon: 'search', label: src };
              return (
                <div key={src} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon name={meta.icon} size="sm" className="text-text-secondary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                      {meta.label}
                    </span>
                    <span className="text-[9px] font-mono text-text-secondary/60">
                      ({grouped[src].length})
                    </span>
                  </div>
                  <Card className="p-0 overflow-hidden">
                    <div className="divide-y divide-border-panel/50">
                      {grouped[src].map((result, idx) => (
                        <div
                          key={result.id ?? idx}
                          onClick={() => openResult(result)}
                          className={cn(
                            'px-4 py-3 space-y-1 transition-colors',
                            (result.notionUrl || result.url) && 'cursor-pointer hover:bg-surface/60 group'
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <Icon
                              name={meta.icon}
                              size="xs"
                              className="text-text-secondary shrink-0 mt-0.5"
                            />
                            <span
                              className={cn(
                                'text-[12px] font-medium text-text-primary leading-snug',
                                (result.notionUrl || result.url) && 'group-hover:text-brand-mint transition-colors'
                              )}
                            >
                              {result.title}
                            </span>
                          </div>
                          {result.snippet && (
                            <p className="text-[10px] text-text-secondary pl-5 line-clamp-2">
                              {result.snippet}
                            </p>
                          )}
                          {src === 'memory' && result.filePath && (
                            <p className="text-[9px] font-mono text-text-secondary/60 pl-5 truncate">
                              {result.filePath}
                              {result.matchingLine && (
                                <span className="ml-2 text-brand-mint/70">{result.matchingLine}</span>
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
