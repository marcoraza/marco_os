import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { mcApi } from '../../../lib/mcApi';
import { useMissionControlStore, type MCMemoryFile } from '../../../store/missionControl';

// ── Props ────────────────────────────────────────────────────────────────────

interface MCMemoryBrowserPanelProps {
  agentId?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const SKELETON_TREE_COUNT = 5;
const SEARCH_DEBOUNCE_MS = 300;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function relativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

// ── Search result type ───────────────────────────────────────────────────────

interface SearchResult {
  path: string;
  snippet: string;
  rank: number;
}

// ── TreeNode ─────────────────────────────────────────────────────────────────

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: MCMemoryFile;
  depth: number;
  selectedPath: string;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isDir = node.type === 'directory';
  const isSelected = node.path === selectedPath;

  return (
    <div>
      <button
        onClick={() => (isDir ? setExpanded(!expanded) : onSelect(node.path))}
        className={cn(
          'w-full flex items-center gap-1.5 py-1 px-1 rounded-sm text-left transition-colors',
          'hover:bg-surface-hover',
          isSelected && 'bg-brand-mint/10 border border-brand-mint/20',
          !isSelected && 'border border-transparent',
          'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        {isDir && (
          <Icon
            name={expanded ? 'expand_more' : 'chevron_right'}
            size="xs"
            className="text-text-secondary shrink-0"
          />
        )}
        {!isDir && <span className="w-3 shrink-0" />}
        <Icon
          name={isDir ? 'folder' : 'description'}
          size="xs"
          className={isDir ? 'text-accent-orange' : 'text-accent-blue'}
        />
        <span className="text-[10px] text-text-primary truncate">{node.name}</span>
        {node.size != null && (
          <span className="text-[8px] font-mono text-text-secondary ml-auto shrink-0">
            {formatSize(node.size)}
          </span>
        )}
      </button>
      {isDir &&
        expanded &&
        node.children?.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

// ── SearchResultItem ─────────────────────────────────────────────────────────

function SearchResultItem({
  result,
  isSelected,
  onSelect,
}: {
  result: SearchResult;
  isSelected: boolean;
  onSelect: (path: string) => void;
}) {
  const fileName = result.path.split('/').pop() || result.path;

  return (
    <button
      onClick={() => onSelect(result.path)}
      className={cn(
        'w-full flex flex-col gap-0.5 py-1.5 px-2 rounded-sm text-left transition-colors',
        'hover:bg-surface-hover',
        isSelected && 'bg-brand-mint/10 border border-brand-mint/20',
        !isSelected && 'border border-transparent',
        'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon name="description" size="xs" className="text-accent-blue shrink-0" />
        <span className="text-[10px] font-bold text-text-primary truncate">{fileName}</span>
      </div>
      <span className="text-[9px] font-mono text-text-secondary truncate pl-4">
        {result.snippet}
      </span>
      <span className="text-[8px] font-mono text-text-secondary/60 truncate pl-4">
        {result.path}
      </span>
    </button>
  );
}

// ── Skeleton components ──────────────────────────────────────────────────────

function TreeSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: SKELETON_TREE_COUNT }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5 px-1">
          <div className="w-3 h-3 bg-border-panel animate-pulse rounded-sm shrink-0" />
          <div className="w-3 h-3 bg-border-panel animate-pulse rounded-sm shrink-0" />
          <div
            className="h-3 bg-border-panel animate-pulse rounded-sm"
            style={{ width: `${60 + Math.random() * 40}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function ContentSkeleton() {
  return <div className="bg-border-panel animate-pulse rounded-sm h-full" />;
}

// ── Main component ───────────────────────────────────────────────────────────

export function MCMemoryBrowserPanel({ agentId }: MCMemoryBrowserPanelProps) {
  const memoryFiles = useMissionControlStore((s) => s.memoryFiles);
  const setMemoryFiles = useMissionControlStore((s) => s.setMemoryFiles);

  const [selectedPath, setSelectedPath] = useState('');
  const [content, setContent] = useState('');
  const [loadingTree, setLoadingTree] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [treeError, setTreeError] = useState(false);
  const [contentError, setContentError] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch tree ───────────────────────────────────────────────────────────

  const fetchTree = useCallback(async () => {
    setLoadingTree(true);
    setTreeError(false);
    try {
      const res = await mcApi.get<{ tree: MCMemoryFile[] } | MCMemoryFile[]>(
        '/api/memory?action=tree',
      );
      const files = Array.isArray(res) ? res : res.tree;
      setMemoryFiles(files);
    } catch {
      setTreeError(true);
    } finally {
      setLoadingTree(false);
    }
  }, [setMemoryFiles]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // ── Fetch content ────────────────────────────────────────────────────────

  const fetchContent = useCallback(async (path: string) => {
    if (!path) return;
    setLoadingContent(true);
    setContentError(false);
    setContent('');
    try {
      const encoded = encodeURIComponent(path);
      const res = await mcApi.get<{ content: string } | string>(
        `/api/memory?action=content&path=${encoded}`,
      );
      const text = typeof res === 'string' ? res : res.content;
      setContent(text);
    } catch {
      setContentError(true);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const handleSelect = useCallback(
    (path: string) => {
      setSelectedPath(path);
      fetchContent(path);
    },
    [fetchContent],
  );

  // ── Search with debounce ─────────────────────────────────────────────────

  const isSearchActive = searchQuery.trim().length > 0;

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const encoded = encodeURIComponent(trimmed);
        const res = await mcApi.get<{ results: SearchResult[] }>(
          `/api/memory?action=search&query=${encoded}`,
        );
        setSearchResults(res.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery]);

  // ── File modified display ────────────────────────────────────────────────

  const selectedFile = useMemo(() => {
    function findFile(nodes: MCMemoryFile[], path: string): MCMemoryFile | null {
      for (const node of nodes) {
        if (node.path === path) return node;
        if (node.children) {
          const found = findFile(node.children, path);
          if (found) return found;
        }
      }
      return null;
    }
    if (!selectedPath) return null;
    return findFile(memoryFiles, selectedPath);
  }, [memoryFiles, selectedPath]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-3 h-[calc(100vh-240px)]">
      {/* Left: tree + search */}
      <div className="w-64 shrink-0 flex flex-col bg-surface border border-border-panel rounded-sm p-2 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
            Memoria
          </span>
          <button
            onClick={fetchTree}
            className={cn(
              'p-0.5 rounded-sm transition-colors',
              'hover:bg-surface-hover',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
            )}
            title="Atualizar"
          >
            <Icon name="refresh" size="xs" className="text-text-secondary" />
          </button>
        </div>

        {/* Search input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-[10px] font-mono text-text-primary placeholder:text-text-secondary/50 focus:border-brand-mint/30 focus:outline-none mb-2"
          placeholder="Buscar na memoria..."
        />

        {/* Tree or search results */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loadingTree && memoryFiles.length === 0 ? (
            <TreeSkeleton />
          ) : treeError && memoryFiles.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <Icon name="error_outline" size="sm" className="text-accent-red" />
              <p className="text-text-secondary text-[10px] text-center">
                Falha ao carregar arvore
              </p>
              <button
                onClick={fetchTree}
                className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-2 py-1 hover:bg-brand-mint/20 transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
              >
                Tentar novamente
              </button>
            </div>
          ) : isSearchActive ? (
            searching ? (
              <TreeSkeleton />
            ) : searchResults.length === 0 ? (
              <p className="text-text-secondary text-[10px] text-center py-4">
                Nenhum resultado para "{searchQuery.trim()}"
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-text-secondary mb-1">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                </span>
                {searchResults
                  .sort((a, b) => b.rank - a.rank)
                  .map((result) => (
                    <SearchResultItem
                      key={result.path}
                      result={result}
                      isSelected={result.path === selectedPath}
                      onSelect={handleSelect}
                    />
                  ))}
              </div>
            )
          ) : memoryFiles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">
                folder_off
              </span>
              <p className="text-text-secondary text-[10px] text-center">
                Nenhum arquivo de memoria encontrado
              </p>
            </div>
          ) : (
            memoryFiles.map((node) => (
              <TreeNode
                key={node.path}
                node={node}
                depth={0}
                selectedPath={selectedPath}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: content preview */}
      <div className="flex-1 min-w-0">
        <div className="bg-bg-base border border-border-panel rounded-sm p-3 h-full overflow-y-auto">
          {!selectedPath ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">
                description
              </span>
              <p className="text-text-secondary text-xs text-center">
                Selecione um arquivo para visualizar
              </p>
            </div>
          ) : loadingContent ? (
            <ContentSkeleton />
          ) : contentError ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Icon name="error_outline" size="sm" className="text-accent-red" />
              <p className="text-text-secondary text-xs text-center">
                Falha ao carregar conteudo
              </p>
              <button
                onClick={() => fetchContent(selectedPath)}
                className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-2 py-1 hover:bg-brand-mint/20 transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              {/* File header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-text-secondary truncate">
                  {selectedPath}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {selectedFile?.modified && (
                    <span className="text-[8px] font-mono text-text-secondary">
                      {relativeTime(selectedFile.modified)}
                    </span>
                  )}
                  {selectedFile?.size != null && (
                    <span className="text-[8px] font-mono text-text-secondary">
                      {formatSize(selectedFile.size)}
                    </span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-b border-border-panel mb-2" />

              {/* Content */}
              <pre className="text-[10px] font-mono text-text-primary whitespace-pre-wrap break-words">
                {content}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
