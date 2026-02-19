import React, { useEffect, useMemo, useState } from 'react';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

type ContentStage = 'idea' | 'script' | 'thumbnail' | 'filming' | 'published';

type ContentCard = {
  id: string;
  title: string;
  project: string;
  stage: ContentStage;
};

interface MissionControlDbSchema extends DBSchema {
  mc_tasks: {
    key: string;
    value: { id: string; title: string; assignee: string; status: string };
  };
  mc_content: {
    key: string;
    value: ContentCard;
  };
  mc_memories: {
    key: string;
    value: { id: string; content: string; author: string; createdAt: string };
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

const columns: Array<{ id: ContentStage; label: string }> = [
  { id: 'idea', label: 'Idea' },
  { id: 'script', label: 'Script' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'filming', label: 'Filming' },
  { id: 'published', label: 'Published' },
];

const seedCards: ContentCard[] = [
  { id: 'mc-content-1', title: 'Agent stack deep dive', project: 'YouTube', stage: 'idea' },
  { id: 'mc-content-2', title: 'Mission Control tutorial', project: 'Product', stage: 'script' },
  { id: 'mc-content-3', title: 'Weekly operating review', project: 'Newsletter', stage: 'thumbnail' },
  { id: 'mc-content-4', title: 'Automation sprint recap', project: 'YouTube', stage: 'filming' },
  { id: 'mc-content-5', title: 'AI team onboarding', project: 'Docs', stage: 'published' },
];

const ContentPipeline: React.FC = () => {
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const db = await getMissionControlDb();
      const existing = await db.getAll('mc_content');
      if (existing.length === 0) {
        const tx = db.transaction('mc_content', 'readwrite');
        for (const card of seedCards) await tx.store.put(card);
        await tx.done;
        setCards(seedCards);
      } else {
        setCards(existing);
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      const db = await getMissionControlDb();
      const tx = db.transaction('mc_content', 'readwrite');
      await tx.store.clear();
      for (const card of cards) await tx.store.put(card);
      await tx.done;
    })();
  }, [cards, hydrated]);

  const byStage = useMemo(() => {
    return {
      idea: cards.filter(c => c.stage === 'idea'),
      script: cards.filter(c => c.stage === 'script'),
      thumbnail: cards.filter(c => c.stage === 'thumbnail'),
      filming: cards.filter(c => c.stage === 'filming'),
      published: cards.filter(c => c.stage === 'published'),
    };
  }, [cards]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black uppercase tracking-wide text-text-primary">Content Pipeline</h2>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        {columns.map(col => (
          <div key={col.id} className="bg-surface border border-border-panel rounded-md p-3 min-h-[300px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">{col.label}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-sm border border-border-panel bg-bg-base text-text-secondary">
                {byStage[col.id].length}
              </span>
            </div>
            <div className="space-y-2">
              {byStage[col.id].map(card => (
                <article key={card.id} className="rounded-sm border border-border-panel bg-bg-base p-3">
                  <p className="text-sm font-semibold text-text-primary">{card.title}</p>
                  <p className="text-[11px] text-text-secondary mt-1 uppercase tracking-wide">{card.project}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentPipeline;
