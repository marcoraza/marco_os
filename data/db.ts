import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StoredEvent, StoredNote, StoredProject, StoredTask } from './models';

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
}

let dbPromise: Promise<IDBPDatabase<MarcoOSDbSchema>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<MarcoOSDbSchema>('marco-os', 1, {
      upgrade(db) {
        db.createObjectStore('projects', { keyPath: 'id' });

        const tasks = db.createObjectStore('tasks', { keyPath: 'id' });
        tasks.createIndex('by-project', 'projectId');

        const notes = db.createObjectStore('notes', { keyPath: 'id' });
        notes.createIndex('by-project', 'projectId');

        const events = db.createObjectStore('events', { keyPath: 'id' });
        events.createIndex('by-project', 'projectId');

        db.createObjectStore('meta', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
}
