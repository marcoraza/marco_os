import type { Project, Task } from './appTypes';
import type { StoredEvent, StoredNote } from '../data/models';

export function summarizeProjectControl(
  project: Project | undefined,
  tasks: Task[],
  notes: StoredNote[],
  events: StoredEvent[],
) {
  if (!project) {
    return {
      open: 0,
      critical: 0,
      done: 0,
      notes: 0,
      upcomingEvents: 0,
    };
  }

  const scopedTasks = tasks.filter((task) => task.projectId === project.id);
  return {
    open: scopedTasks.filter((task) => task.status !== 'done').length,
    critical: scopedTasks.filter((task) => task.status !== 'done' && task.priority === 'high').length,
    done: scopedTasks.filter((task) => task.status === 'done').length,
    notes: notes.filter((note) => note.projectId === project.id).length,
    upcomingEvents: events.filter((event) => event.projectId === project.id).length,
  };
}

export function derivePlanMilestones(title: string, deadlines: string[]) {
  const sorted = [...deadlines].filter(Boolean).sort();
  if (sorted.length === 0) return [];
  return [
    { id: `${title}-kickoff`, label: 'Kickoff', deadline: sorted[0] },
    { id: `${title}-review`, label: 'Review', deadline: sorted[Math.floor((sorted.length - 1) / 2)] },
    { id: `${title}-delivery`, label: 'Entrega', deadline: sorted[sorted.length - 1] },
  ];
}
