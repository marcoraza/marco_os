import React, { useEffect, useMemo, useState } from 'react';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type Assignee = 'Marco' | 'Frank' | 'Subagent';

type MissionTask = {
  id: string;
  title: string;
  assignee: Assignee;
  status: TaskStatus;
};

interface MissionControlDbSchema extends DBSchema {
  mc_tasks: {
    key: string;
    value: MissionTask;
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

const seedTasks: MissionTask[] = [
  { id: 'mc-task-1', title: 'Set weekly sprint priorities', assignee: 'Frank', status: 'todo' },
  { id: 'mc-task-2', title: 'Ship analytics parser fix', assignee: 'Subagent', status: 'in-progress' },
  { id: 'mc-task-3', title: 'Review Q1 launch checklist', assignee: 'Marco', status: 'done' },
];

const columns: Array<{ id: TaskStatus; label: string }> = [
  { id: 'todo', label: 'Todo' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

const badgeClasses: Record<Assignee, string> = {
  Marco: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
  Frank: 'bg-brand-mint/15 text-brand-mint border-brand-mint/30',
  Subagent: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
};

const TasksBoard: React.FC = () => {
  const [tasks, setTasks] = useState<MissionTask[]>([]);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const db = await getMissionControlDb();
      const existing = await db.getAll('mc_tasks');
      if (existing.length === 0) {
        const tx = db.transaction('mc_tasks', 'readwrite');
        for (const task of seedTasks) await tx.store.put(task);
        await tx.done;
        setTasks(seedTasks);
      } else {
        setTasks(existing);
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      const db = await getMissionControlDb();
      const tx = db.transaction('mc_tasks', 'readwrite');
      await tx.store.clear();
      for (const task of tasks) await tx.store.put(task);
      await tx.done;
    })();
  }, [tasks, hydrated]);

  const byColumn = useMemo(() => {
    return {
      todo: tasks.filter(t => t.status === 'todo'),
      'in-progress': tasks.filter(t => t.status === 'in-progress'),
      done: tasks.filter(t => t.status === 'done'),
    };
  }, [tasks]);

  const onDropToColumn = (status: TaskStatus) => {
    if (!dragTaskId) return;
    setTasks(prev => prev.map(task => task.id === dragTaskId ? { ...task, status } : task));
    setDragTaskId(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black uppercase tracking-wide text-text-primary">Tasks Board</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {columns.map(col => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropToColumn(col.id)}
            className="bg-surface border border-border-panel rounded-md p-3 min-h-[340px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">{col.label}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-sm border border-border-panel bg-bg-base text-text-secondary">
                {byColumn[col.id].length}
              </span>
            </div>

            <div className="space-y-2">
              {byColumn[col.id].map(task => (
                <article
                  key={task.id}
                  draggable
                  onDragStart={() => setDragTaskId(task.id)}
                  onDragEnd={() => setDragTaskId(null)}
                  className="rounded-sm border border-border-panel bg-bg-base p-3 cursor-grab active:cursor-grabbing"
                >
                  <p className="text-sm font-semibold text-text-primary">{task.title}</p>
                  <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-sm border text-[10px] font-black uppercase tracking-wide ${badgeClasses[task.assignee]}`}>
                    {task.assignee}
                  </span>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksBoard;
