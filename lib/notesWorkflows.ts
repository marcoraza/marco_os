import type { StoredNote } from '../data/models';

export type NoteListMode = 'all' | 'starred' | 'recent';

const TAG_PATTERN = /(^|\s)#([\p{L}\p{N}_-]+)/gu;
const WIKI_LINK_PATTERN = /\[\[([^\]]+)\]\]/g;

export function extractNoteTags(note: Pick<StoredNote, 'title' | 'body' | 'tags'>): string[] {
  const tags = new Set<string>(note.tags ?? []);
  const text = `${note.title} ${note.body}`;
  for (const match of text.matchAll(TAG_PATTERN)) {
    tags.add(match[2].toLowerCase());
  }
  return [...tags];
}

export function extractWikiLinks(body: string): string[] {
  return Array.from(body.matchAll(WIKI_LINK_PATTERN), (match) => match[1].trim()).filter(Boolean);
}

export function filterNotes(notes: StoredNote[], query: string, mode: NoteListMode): StoredNote[] {
  const normalizedQuery = query.trim().toLowerCase();
  return notes.filter((note) => {
    if (mode === 'starred' && !note.starred) return false;
    if (mode === 'recent') {
      const ageMs = Date.now() - new Date(note.updatedAt).getTime();
      if (ageMs > 1000 * 60 * 60 * 24 * 7) return false;
    }
    if (!normalizedQuery) return true;
    const tags = extractNoteTags(note).join(' ');
    return `${note.title} ${note.body} ${tags}`.toLowerCase().includes(normalizedQuery);
  });
}

export function getRelatedNotes(notes: StoredNote[], selectedNote: StoredNote): StoredNote[] {
  const outgoing = new Set(extractWikiLinks(selectedNote.body).map((link) => link.toLowerCase()));
  return notes.filter((note) => {
    if (note.id === selectedNote.id) return false;
    const title = note.title.toLowerCase();
    const backlinks = extractWikiLinks(note.body).map((link) => link.toLowerCase());
    return outgoing.has(title) || backlinks.includes(selectedNote.title.toLowerCase());
  });
}

export function rankPaletteNotes(notes: StoredNote[]): StoredNote[] {
  return [...notes].sort((left, right) => {
    if (Boolean(left.starred) !== Boolean(right.starred)) {
      return left.starred ? -1 : 1;
    }
    return right.updatedAt.localeCompare(left.updatedAt);
  });
}
