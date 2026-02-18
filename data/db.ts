import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StoredAgent, StoredAgentRun, StoredContact, StoredEvent, StoredNote, StoredProject, StoredTask } from './models';

interface MarcoOSDbSchema extends DBSchema {
  projects: {
    key: string;
    value: StoredProject;
  };
  tasks: {
    key: number;
    value: StoredTask;
    indexes: { 'by-project': string };
  };
  notes: {
    key: string;
    value: StoredNote;
    indexes: { 'by-project': string };
  };
  events: {
    key: string;
    value: StoredEvent;
    indexes: { 'by-project': string };
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
  agents: {
    key: string;
    value: StoredAgent;
  };
  agentRuns: {
    key: string;
    value: StoredAgentRun;
    indexes: { 'by-agent': string };
  };
  contacts: {
    key: string;
    value: StoredContact;
  };
}

let dbPromise: Promise<IDBPDatabase<MarcoOSDbSchema>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<MarcoOSDbSchema>('marco-os', 3, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('projects', { keyPath: 'id' });

          const tasks = db.createObjectStore('tasks', { keyPath: 'id' });
          tasks.createIndex('by-project', 'projectId');

          const notes = db.createObjectStore('notes', { keyPath: 'id' });
          notes.createIndex('by-project', 'projectId');

          const events = db.createObjectStore('events', { keyPath: 'id' });
          events.createIndex('by-project', 'projectId');

          db.createObjectStore('meta', { keyPath: 'key' });
        }

        if (oldVersion < 2) {
          db.createObjectStore('agents', { keyPath: 'id' });

          const runs = db.createObjectStore('agentRuns', { keyPath: 'id' });
          runs.createIndex('by-agent', 'agentId');
        }

        if (oldVersion < 3) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}
