import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StoredAgent, StoredAgentRun, StoredContact, StoredContentEntry, StoredEvent, StoredFinanceEntry, StoredHealthEntry, StoredNote, StoredPlan, StoredProject, StoredProjectEntry, StoredReuniao, StoredSkill, StoredTask } from './models';
import type { ChatMessage } from './types/chat';

export type { ChatMessage } from './types/chat';

export interface ChatSession {
  id: string;
  agentId: string;
  sectionId: string;
  openClawSessionId: string | null;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

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
  plans: {
    key: string;
    value: StoredPlan;
    indexes: { 'by-project': string };
  };
  financeEntries: {
    key: string;
    value: StoredFinanceEntry;
  };
  healthEntries: {
    key: string;
    value: StoredHealthEntry;
  };
  reunioes: {
    key: string;
    value: StoredReuniao;
  };
  skills: {
    key: string;
    value: StoredSkill;
  };
  contentEntries: {
    key: string;
    value: StoredContentEntry;
  };
  projetosEntries: {
    key: string;
    value: StoredProjectEntry;
  };
  chat_sessions: {
    key: string;
    value: ChatSession;
  };
}

let dbPromise: Promise<IDBPDatabase<MarcoOSDbSchema>> | null = null;

// Force nuke & rebuild if DB is stuck from a bad migration
const DB_RESET_KEY = 'marco-os-db-reset-v7';
async function ensureCleanDb() {
  if (!localStorage.getItem(DB_RESET_KEY)) {
    console.warn('[Marco OS] Forcing DB reset to v7…');
    try {
      const delReq = indexedDB.deleteDatabase('marco-os');
      await new Promise<void>((resolve, reject) => {
        delReq.onsuccess = () => resolve();
        delReq.onerror = () => reject(delReq.error);
        delReq.onblocked = () => {
          console.warn('[Marco OS] DB delete blocked — proceeding anyway');
          resolve();
        };
      });
    } catch (e) {
      console.warn('[Marco OS] DB delete failed:', e);
    }
    localStorage.setItem(DB_RESET_KEY, '1');
  }
}

export function getDb() {
  if (!dbPromise) {
    dbPromise = ensureCleanDb().then(() =>
      openDB<MarcoOSDbSchema>('marco-os', 6, {
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

          if (oldVersion < 4) {
            const plans = db.createObjectStore('plans', { keyPath: 'id' });
            plans.createIndex('by-project', 'projectId');
          }

          if (oldVersion < 5) {
            db.createObjectStore('financeEntries', { keyPath: 'id' });
            db.createObjectStore('healthEntries', { keyPath: 'id' });
            db.createObjectStore('reunioes', { keyPath: 'id' });
            db.createObjectStore('skills', { keyPath: 'id' });
          }

          if (oldVersion < 6) {
            db.createObjectStore('contentEntries', { keyPath: 'id' });
            db.createObjectStore('projetosEntries', { keyPath: 'id' });
          }

          if (oldVersion < 7) {
            db.createObjectStore('chat_sessions', { keyPath: 'id' });
          }
        },
      })
    );
  }
  return dbPromise;
}
