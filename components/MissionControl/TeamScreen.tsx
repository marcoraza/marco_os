import React, { useEffect, useState } from 'react';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

type AgentStatus = 'idle' | 'working' | 'done';

type AgentCard = {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
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
    value: { id: string; content: string; author: string; createdAt: string };
  };
  mc_agents: {
    key: string;
    value: AgentCard;
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

const seedAgents: AgentCard[] = [
  { id: 'mc-agent-frank', name: 'Frank', role: 'orchestrator', status: 'idle' },
  { id: 'mc-agent-codex', name: 'Codex', role: 'coder', status: 'idle' },
  { id: 'mc-agent-kimi', name: 'Kimi', role: 'researcher', status: 'idle' },
  { id: 'mc-agent-larry', name: 'Larry', role: 'marketing', status: 'idle' },
];

const statusClasses: Record<AgentStatus, string> = {
  idle: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
  working: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
  done: 'bg-brand-mint/15 text-brand-mint border-brand-mint/30',
};

const TeamScreen: React.FC = () => {
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const db = await getMissionControlDb();
      const existing = await db.getAll('mc_agents');
      if (existing.length === 0) {
        const tx = db.transaction('mc_agents', 'readwrite');
        for (const agent of seedAgents) await tx.store.put(agent);
        await tx.done;
        setAgents(seedAgents);
      } else {
        setAgents(existing);
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      const db = await getMissionControlDb();
      const tx = db.transaction('mc_agents', 'readwrite');
      await tx.store.clear();
      for (const agent of agents) await tx.store.put(agent);
      await tx.done;
    })();
  }, [agents, hydrated]);

  const setStatus = (id: string, status: AgentStatus) => {
    setAgents(prev => prev.map(agent => agent.id === id ? { ...agent, status } : agent));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black uppercase tracking-wide text-text-primary">Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {agents.map(agent => (
          <article key={agent.id} className="bg-surface border border-border-panel rounded-md p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-black uppercase tracking-wide text-text-primary">{agent.name}</h3>
              <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-black uppercase tracking-wide ${statusClasses[agent.status]}`}>
                {agent.status}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wide text-text-secondary mt-2">{agent.role}</p>
            <div className="mt-4 flex items-center gap-2">
              {(['idle', 'working', 'done'] as AgentStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => setStatus(agent.id, status)}
                  className={`px-2 py-1 rounded-sm border text-[10px] font-black uppercase tracking-wide transition-colors ${
                    agent.status === status
                      ? 'border-brand-mint/40 text-brand-mint bg-brand-mint/10'
                      : 'border-border-panel text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default TeamScreen;
