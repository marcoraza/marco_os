import { useEffect, useRef } from 'react';
import type { StoredContact, StoredEvent, StoredNote, StoredAgent } from '../data/models';
import type { Project, Task } from '../lib/appTypes';
import { defaultAgents } from '../data/agentsSeed';

interface AppHydrationParams {
  defaultProjects: Project[];
  defaultTasks: Task[];
  activeProjectId: string;
  activeAgentId: string;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setNotes: React.Dispatch<React.SetStateAction<StoredNote[]>>;
  setEvents: React.Dispatch<React.SetStateAction<StoredEvent[]>>;
  setAgentRoster: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveProjectId: React.Dispatch<React.SetStateAction<string>>;
  setActiveAgentId: React.Dispatch<React.SetStateAction<string>>;
  setPaletteContacts: React.Dispatch<React.SetStateAction<StoredContact[]>>;
  storedAgentToAgent: (agent: StoredAgent) => any;
}

export function useAppHydration({
  defaultProjects,
  defaultTasks,
  activeProjectId,
  activeAgentId,
  setProjects,
  setTasks,
  setNotes,
  setEvents,
  setAgentRoster,
  setActiveProjectId,
  setActiveAgentId,
  setPaletteContacts,
  storedAgentToAgent,
}: AppHydrationParams) {
  const didHydrateRef = useRef(false);

  useEffect(() => {
    (async () => {
      const repository = await import('../data/repository');
      try {
        await repository.bootstrapIfEmpty({ projects: defaultProjects, tasks: defaultTasks, notes: [], events: [] });
        const existingAgents = await repository.loadAgents();
        const hasRealIds = existingAgents.some((agent) => agent.id === 'main');
        const hasOldIds = existingAgents.some((agent) => ['frank', 'head-code', 'planner', 'qa'].includes(agent.id));

        if (!hasRealIds || hasOldIds) {
          for (const oldAgent of existingAgents) {
            if (['frank', 'head-code', 'planner', 'qa'].includes(oldAgent.id)) {
              await repository.deleteAgent(oldAgent.id);
            }
          }
          for (const agent of defaultAgents) {
            await repository.putAgent(agent);
          }
        }

        const { projects, tasks, notes, events } = await repository.loadAll();
        if (projects.length) setProjects(projects);
        if (tasks.length) setTasks(tasks);
        setNotes(notes);
        setEvents(events);
        if (projects.length && !projects.some((project) => project.id === activeProjectId)) {
          setActiveProjectId(projects[0].id);
        }
      } catch (err) {
        console.error('[Marco OS] hydration (core):', err);
      }

      try {
        const agents = await repository.loadAgents();
        if (agents.length) {
          setAgentRoster(agents.map(storedAgentToAgent));
          if (!agents.some((agent) => agent.id === activeAgentId)) {
            setActiveAgentId(agents[0].id);
          }
        } else {
          console.warn('[Marco OS] No agents in DB after bootstrap — using in-memory fallback');
          setAgentRoster(defaultAgents.map(storedAgentToAgent));
          setActiveAgentId(defaultAgents[0].id);
        }
      } catch (err) {
        console.error('[Marco OS] hydration (agents):', err);
        setAgentRoster(defaultAgents.map(storedAgentToAgent));
        setActiveAgentId(defaultAgents[0].id);
      }

      try {
        const contacts = await repository.loadContacts();
        setPaletteContacts(contacts);
      } catch (err) {
        console.error('[Marco OS] hydration (contacts):', err);
      }

      didHydrateRef.current = true;
    })();
  }, [
    activeAgentId,
    activeProjectId,
    defaultProjects,
    defaultTasks,
    setActiveAgentId,
    setActiveProjectId,
    setAgentRoster,
    setEvents,
    setNotes,
    setPaletteContacts,
    setProjects,
    setTasks,
    storedAgentToAgent,
  ]);

  return didHydrateRef;
}

interface DebouncedPersistenceParams {
  projects: Project[];
  tasks: Task[];
  notes: StoredNote[];
  events: StoredEvent[];
  didHydrateRef: React.MutableRefObject<boolean>;
  onPersisted?: () => void;
}

export function useDebouncedPersistence({
  projects,
  tasks,
  notes,
  events,
  didHydrateRef,
  onPersisted,
}: DebouncedPersistenceParams) {
  const persistTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});

  const schedulePersist = (key: string, fn: () => void, delayMs = 350) => {
    const previous = persistTimersRef.current[key];
    if (previous) clearTimeout(previous);
    persistTimersRef.current[key] = setTimeout(fn, delayMs);
  };

  useEffect(() => {
    if (!didHydrateRef.current) return;
    schedulePersist('projects', () => {
      void import('../data/repository').then(({ saveProjects }) => saveProjects(projects)).then(() => onPersisted?.());
    });
  }, [didHydrateRef, onPersisted, projects]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    schedulePersist('tasks', () => {
      void import('../data/repository').then(({ saveTasks }) => saveTasks(tasks)).then(() => onPersisted?.());
    });
  }, [didHydrateRef, onPersisted, tasks]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    schedulePersist('notes', () => {
      void import('../data/repository').then(({ saveNotes }) => saveNotes(notes)).then(() => onPersisted?.());
    });
  }, [didHydrateRef, notes, onPersisted]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    schedulePersist('events', () => {
      void import('../data/repository').then(({ saveEvents }) => saveEvents(events)).then(() => onPersisted?.());
    });
  }, [didHydrateRef, events, onPersisted]);
}
