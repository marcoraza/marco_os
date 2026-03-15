import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDb } from '../data/db';
import type { StoredNote } from '../data/models';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AtomicNote {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  projectId?: string;
}

interface UseAtomicNotesReturn {
  notes: AtomicNote[];
  addNote: (title: string, content: string, tags?: string[]) => Promise<void>;
  searchNotes: (query: string) => AtomicNote[];
  getBacklinks: (title: string) => AtomicNote[];
  linkCount: Map<string, number>;
  isLoading: boolean;
}

// ─── Wiki-link extractor ──────────────────────────────────────────────────────
function extractWikiLinks(text: string): string[] {
  const matches = text.matchAll(/\[\[([^\]]+)\]\]/g);
  return Array.from(matches, m => m[1]);
}

// ─── StoredNote → AtomicNote conversion ──────────────────────────────────────
function toAtomicNote(n: StoredNote): AtomicNote {
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    // Tags stored in title as #tag or in body — not in StoredNote schema, default empty
    tags: [],
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    projectId: n.projectId,
  };
}

// ─── Fuzzy search (simple substring) ─────────────────────────────────────────
function fuzzyMatch(note: AtomicNote, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const titleMatch = note.title.toLowerCase().includes(q);
  const bodyMatch = note.body.toLowerCase().includes(q);
  const tagMatch = note.tags.some(t => t.toLowerCase().includes(q));
  return titleMatch || bodyMatch || tagMatch;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAtomicNotes(): UseAtomicNotesReturn {
  const [notes, setNotes] = useState<AtomicNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from IndexedDB
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const db = await getDb();
        const stored = await db.getAll('notes');
        // Sort newest first
        stored.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        if (!cancelled) {
          setNotes(stored.map(toAtomicNote));
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[useAtomicNotes] load failed:', err);
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  // Add a new note
  const addNote = useCallback(async (title: string, content: string, tags: string[] = []): Promise<void> => {
    const now = new Date().toISOString();
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `note-${Date.now()}`;

    const stored: StoredNote = {
      id,
      title: title.trim(),
      body: content,
      createdAt: now,
      updatedAt: now,
      projectId: 'pessoal',
    };

    try {
      const db = await getDb();
      await db.put('notes', stored);

      const newNote = toAtomicNote(stored);
      // Attach tags in memory (not in DB schema but tracked in hook)
      newNote.tags = tags;

      setNotes(prev => [newNote, ...prev]);
    } catch (err) {
      console.error('[useAtomicNotes] addNote failed:', err);
      throw err;
    }
  }, []);

  // Fuzzy search — returns filtered notes
  const searchNotes = useCallback((query: string): AtomicNote[] => {
    if (!query.trim()) return notes;
    return notes.filter(n => fuzzyMatch(n, query));
  }, [notes]);

  // Find notes that reference [[title]] (backlinks)
  const getBacklinks = useCallback((title: string): AtomicNote[] => {
    const pattern = `[[${title}]]`;
    return notes.filter(n => n.body.includes(pattern) || n.title.includes(pattern));
  }, [notes]);

  // Build linkCount map: term → number of notes referencing it
  const linkCount = useMemo((): Map<string, number> => {
    const map = new Map<string, number>();
    for (const note of notes) {
      const links = extractWikiLinks(note.body);
      for (const link of links) {
        map.set(link, (map.get(link) ?? 0) + 1);
      }
    }
    return map;
  }, [notes]);

  return { notes, addNote, searchNotes, getBacklinks, linkCount, isLoading };
}

export default useAtomicNotes;
