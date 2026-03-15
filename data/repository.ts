import type { StoredAgent, StoredAgentRun, StoredContact, StoredContentEntry, StoredEvent, StoredFinanceEntry, StoredHealthEntry, StoredNote, StoredPlan, StoredProject, StoredProjectEntry, StoredReuniao, StoredSkill, StoredTask } from './models';
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

// ─── Contacts CRUD ────────────────────────────────────────────────────────────

export async function loadContacts(): Promise<StoredContact[]> {
  const db = await getDb();
  const all = await db.getAll('contacts');
  all.sort((a, b) => a.name.localeCompare(b.name));
  return all;
}

export async function saveContacts(contacts: StoredContact[]) {
  const db = await getDb();
  const tx = db.transaction('contacts', 'readwrite');
  await tx.store.clear();
  for (const c of contacts) await tx.store.put(c);
  await tx.done;
}

export async function putContact(contact: StoredContact) {
  const db = await getDb();
  await db.put('contacts', contact);
}

export async function deleteContact(id: string) {
  const db = await getDb();
  await db.delete('contacts', id);
}

export async function bootstrapContactsIfEmpty(contacts: StoredContact[]) {
  const db = await getDb();
  const existing = await db.getAll('contacts');
  if (existing.length === 0 && contacts.length) {
    const tx = db.transaction('contacts', 'readwrite');
    for (const c of contacts) await tx.store.put(c);
    await tx.done;
  }
}

// ─── Plans CRUD ───────────────────────────────────────────────────────────────

export async function loadPlans(projectId?: string): Promise<StoredPlan[]> {
  const db = await getDb();
  let all: StoredPlan[];
  if (projectId) {
    all = await db.getAllFromIndex('plans', 'by-project', projectId);
  } else {
    all = await db.getAll('plans');
  }
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all;
}

export async function putPlan(plan: StoredPlan) {
  const db = await getDb();
  await db.put('plans', plan);
}

export async function deletePlan(id: string) {
  const db = await getDb();
  await db.delete('plans', id);
}

// ─── Agents CRUD ──────────────────────────────────────────────────────────────

export async function loadAgents(): Promise<StoredAgent[]> {
  const db = await getDb();
  const all = await db.getAll('agents');
  all.sort((a, b) => a.name.localeCompare(b.name));
  return all;
}

export async function saveAgents(agents: StoredAgent[]) {
  const db = await getDb();
  const tx = db.transaction('agents', 'readwrite');
  await tx.store.clear();
  for (const a of agents) await tx.store.put(a);
  await tx.done;
}

export async function putAgent(agent: StoredAgent) {
  const db = await getDb();
  await db.put('agents', agent);
}

export async function deleteAgent(id: string) {
  const db = await getDb();
  await db.delete('agents', id);
}

export async function getAgent(id: string): Promise<StoredAgent | undefined> {
  const db = await getDb();
  return db.get('agents', id);
}

// ─── Agent Runs CRUD ──────────────────────────────────────────────────────────

export async function loadAgentRuns(agentId?: string): Promise<StoredAgentRun[]> {
  const db = await getDb();
  let all: StoredAgentRun[];
  if (agentId) {
    all = await db.getAllFromIndex('agentRuns', 'by-agent', agentId);
  } else {
    all = await db.getAll('agentRuns');
  }
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all;
}

export async function putAgentRun(run: StoredAgentRun) {
  const db = await getDb();
  await db.put('agentRuns', run);
}

export async function deleteAgentRun(id: string) {
  const db = await getDb();
  await db.delete('agentRuns', id);
}

// ─── Finance Entries CRUD ─────────────────────────────────────────────────────

export async function loadFinanceEntries(): Promise<StoredFinanceEntry[]> {
  const db = await getDb();
  const all = await db.getAll('financeEntries');
  all.sort((a, b) => b.data.localeCompare(a.data));
  return all;
}

export async function putFinanceEntry(entry: StoredFinanceEntry) {
  const db = await getDb();
  await db.put('financeEntries', entry);
}

export async function deleteFinanceEntry(id: string) {
  const db = await getDb();
  await db.delete('financeEntries', id);
}

// ─── Health Entries CRUD ─────────────────────────────────────────────────────

export async function loadHealthEntries(): Promise<StoredHealthEntry[]> {
  const db = await getDb();
  const all = await db.getAll('healthEntries');
  all.sort((a, b) => b.data.localeCompare(a.data));
  return all;
}

export async function putHealthEntry(entry: StoredHealthEntry) {
  const db = await getDb();
  await db.put('healthEntries', entry);
}

export async function deleteHealthEntry(id: string) {
  const db = await getDb();
  await db.delete('healthEntries', id);
}

// ─── Reunioes CRUD ───────────────────────────────────────────────────────────

export async function loadReunioes(): Promise<StoredReuniao[]> {
  const db = await getDb();
  const all = await db.getAll('reunioes');
  all.sort((a, b) => b.date.localeCompare(a.date));
  return all;
}

export async function putReuniao(reuniao: StoredReuniao) {
  const db = await getDb();
  await db.put('reunioes', reuniao);
}

export async function deleteReuniao(id: string) {
  const db = await getDb();
  await db.delete('reunioes', id);
}

// ─── Skills CRUD ─────────────────────────────────────────────────────────────

export async function loadSkills(): Promise<StoredSkill[]> {
  const db = await getDb();
  const all = await db.getAll('skills');
  all.sort((a, b) => a.name.localeCompare(b.name));
  return all;
}

export async function putSkill(skill: StoredSkill) {
  const db = await getDb();
  await db.put('skills', skill);
}

export async function deleteSkill(id: string) {
  const db = await getDb();
  await db.delete('skills', id);
}

// ─── Content Entries CRUD ────────────────────────────────────────────────────

export async function loadContentEntries(): Promise<StoredContentEntry[]> {
  const db = await getDb();
  const all = await db.getAll('contentEntries');
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all;
}

export async function putContentEntry(entry: StoredContentEntry) {
  const db = await getDb();
  await db.put('contentEntries', entry);
}

export async function deleteContentEntry(id: string) {
  const db = await getDb();
  await db.delete('contentEntries', id);
}

// ─── Projetos Entries CRUD ──────────────────────────────────────────────────

export async function loadProjetosEntries(): Promise<StoredProjectEntry[]> {
  const db = await getDb();
  const all = await db.getAll('projetosEntries');
  all.sort((a, b) => a.name.localeCompare(b.name));
  return all;
}

export async function putProjetosEntry(entry: StoredProjectEntry) {
  const db = await getDb();
  await db.put('projetosEntries', entry);
}

export async function deleteProjetosEntry(id: string) {
  const db = await getDb();
  await db.delete('projetosEntries', id);
}

export async function bootstrapAgentsIfEmpty(agents: StoredAgent[]) {
  const db = await getDb();
  const existing = await db.getAll('agents');
  const expectedIds = new Set(agents.map(a => a.id));
  const needsReseed = existing.length === 0 || !existing.some(a => expectedIds.has(a.id));
  if (needsReseed && agents.length) {
    const tx = db.transaction('agents', 'readwrite');
    await tx.store.clear();
    for (const a of agents) await tx.store.put(a);
    await tx.done;
  }
}
