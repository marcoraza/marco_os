import React, { useEffect, useMemo, useState } from 'react';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

type MemoryItem = {
  id: string;
  content: string;
  author: string;
  createdAt: string;
};

interface MissionControlDbSchema extends DBSchema {
  mc_tasks: {
    key: string;
    value: { id: string; title: string; assignee: string; status: string };
  };
  mc_content: {
    key: string;
    value: { id: string; title: string; project: string; stage: string };
  };
  mc_memories: {
    key: string;
    value: MemoryItem;
  };
  mc_agents: {
    key: string;
    value: { id: string; name: string; role: string; status: 'idle' | 'working' | 'done' };
  };
}

let dbPromise: Promise<IDBPDatabase<MissionControlDbSchema>> | null = null;

function getMissionControlDb() {
  if (!dbPromise) {
    dbPromise = openDB<MissionControlDbSchema>('marco-os-mission-control', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('mc_tasks')) db.createObjectStore('mc_tasks', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('mc_content')) db.createObjectStore('mc_content', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('mc_memories')) db.createObjectStore('mc_memories', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('mc_agents')) db.createObjectStore('mc_agents', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

const seedMemories: MemoryItem[] = [
  {
    id: 'mc-memory-1',
    content: 'Frank: Keep campaign launches synced with product milestones every Monday.',
    author: 'Frank',
    createdAt: '2026-02-14T09:00:00.000Z',
  },
  {
    id: 'mc-memory-2',
    content: 'Frank: The fastest win this quarter is publishing weekly Mission Control recaps.',
    author: 'Frank',
    createdAt: '2026-02-15T11:30:00.000Z',
  },
  {
    id: 'mc-memory-3',
    content: 'Frank: Route all urgent bugs through Tasks Board before assigning subagents.',
    author: 'Frank',
    createdAt: '2026-02-16T16:45:00.000Z',
  },
];

const MemoryScreen: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const db = await getMissionControlDb();
      const existing = await db.getAll('mc_memories');
      if (existing.length === 0) {
        const tx = db.transaction('mc_memories', 'readwrite');
        for (const memory of seedMemories) await tx.store.put(memory);
        await tx.done;
        setMemories(seedMemories);
      } else {
        setMemories(existing);
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      const db = await getMissionControlDb();
      const tx = db.transaction('mc_memories', 'readwrite');
      await tx.store.clear();
      for (const memory of memories) await tx.store.put(memory);
      await tx.done;
    })();
  }, [memories, hydrated]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return memories;
    return memories.filter(memory => memory.content.toLowerCase().includes(term));
  }, [memories, query]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black uppercase tracking-wide text-text-primary">Memory</h2>
      <div className="bg-surface border border-border-panel rounded-md p-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memory content..."
          className="w-full bg-bg-base border border-border-panel rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-brand-mint/40"
        />
      </div>

      <div className="space-y-2">
        {filtered.map(memory => (
          <article key={memory.id} className="bg-surface border border-border-panel rounded-md p-4">
            <p className="text-sm text-text-primary leading-relaxed">{memory.content}</p>
            <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-text-secondary">
              <span>{memory.author}</span>
              <span className="text-border-panel">•</span>
              <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default MemoryScreen;
