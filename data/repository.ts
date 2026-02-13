import type { StoredEvent, StoredNote, StoredProject, StoredTask } from './models';
import { getDb } from './db';

export type BootstrapPayload = {
  projects: StoredProject[];
  tasks: StoredTask[];
  notes?: StoredNote[];
  events?: StoredEvent[];
};

export async function bootstrapIfEmpty(payload: BootstrapPayload) {
  const db = await getDb();

  const countProjects = await db.count('projects');
  const countTasks = await db.count('tasks');

  if (countProjects === 0 && payload.projects?.length) {
    const tx = db.transaction('projects', 'readwrite');
    for (const p of payload.projects) await tx.store.put(p);
    await tx.done;
  }

  if (countTasks === 0 && payload.tasks?.length) {
    const tx = db.transaction('tasks', 'readwrite');
    for (const t of payload.tasks) await tx.store.put(t);
    await tx.done;
  }

  const countNotes = await db.count('notes');
  if (countNotes === 0 && payload.notes?.length) {
    const tx = db.transaction('notes', 'readwrite');
    for (const n of payload.notes) await tx.store.put(n);
    await tx.done;
  }

  const countEvents = await db.count('events');
  if (countEvents === 0 && payload.events?.length) {
    const tx = db.transaction('events', 'readwrite');
    for (const e of payload.events) await tx.store.put(e);
    await tx.done;
  }
}

export async function loadAll() {
  const db = await getDb();
  const [projects, tasks, notes, events] = await Promise.all([
    db.getAll('projects'),
    db.getAll('tasks'),
    db.getAll('notes'),
    db.getAll('events'),
  ]);

  // Keep deterministic ordering for UI
  projects.sort((a, b) => a.name.localeCompare(b.name));
  tasks.sort((a, b) => a.id - b.id);
  notes.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  events.sort((a, b) => a.date.localeCompare(b.date));

  return { projects, tasks, notes, events };
}

export async function saveProjects(projects: StoredProject[]) {
  const db = await getDb();
  const tx = db.transaction('projects', 'readwrite');
  await tx.store.clear();
  for (const p of projects) await tx.store.put(p);
  await tx.done;
}

export async function saveTasks(tasks: StoredTask[]) {
  const db = await getDb();
  const tx = db.transaction('tasks', 'readwrite');
  await tx.store.clear();
  for (const t of tasks) await tx.store.put(t);
  await tx.done;
}

export async function saveNotes(notes: StoredNote[]) {
  const db = await getDb();
  const tx = db.transaction('notes', 'readwrite');
  await tx.store.clear();
  for (const n of notes) await tx.store.put(n);
  await tx.done;
}

export async function saveEvents(events: StoredEvent[]) {
  const db = await getDb();
  const tx = db.transaction('events', 'readwrite');
  await tx.store.clear();
  for (const e of events) await tx.store.put(e);
  await tx.done;
}
