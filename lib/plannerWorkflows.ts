import type { StoredPlan } from '../data/models';
import type { Task } from './appTypes';

export function buildPlanExportTasks(
  plan: Pick<StoredPlan, 'title' | 'suggestedTasks'>,
  projectId: string,
): Omit<Task, 'id' | 'assignee' | 'dependencies'>[] {
  return (plan.suggestedTasks ?? []).map((task) => ({
    title: task.title,
    tag: task.tag,
    projectId,
    status: 'assigned',
    priority: task.priority,
    deadline: task.deadline,
  }));
}

export function getPlanExportCandidates(
  plan: Pick<StoredPlan, 'suggestedTasks' | 'exportedTaskIds'>,
  tasks: Task[],
  projectId: string,
) {
  const exportedIds = new Set(plan.exportedTaskIds ?? []);
  const existingTitles = new Set(
    tasks
      .filter((task) => task.projectId === projectId)
      .filter((task) => exportedIds.has(task.id))
      .map((task) => task.title)
  );

  return (plan.suggestedTasks ?? []).filter((task) => !existingTitles.has(task.title));
}

export function getPlannerResumeTarget(history: StoredPlan[]): StoredPlan | null {
  if (history.length === 0) return null;
  return [...history].sort((left, right) => {
    const leftTs = new Date(left.lastOpenedAt ?? left.updatedAt).getTime();
    const rightTs = new Date(right.lastOpenedAt ?? right.updatedAt).getTime();
    return rightTs - leftTs;
  })[0] ?? null;
}

export function summarizePlanExecution(
  plan: Pick<StoredPlan, 'projectId' | 'suggestedTasks' | 'exportedTaskIds'>,
  tasks: Task[],
) {
  const exportedIds = new Set(plan.exportedTaskIds ?? []);
  const plannedTitles = new Set((plan.suggestedTasks ?? []).map((task) => task.title));

  const matchedTasks = tasks.filter((task) => {
    if (exportedIds.size > 0) {
      return exportedIds.has(task.id);
    }
    return task.projectId === plan.projectId && plannedTitles.has(task.title);
  });

  return matchedTasks.reduce(
    (summary, task) => {
      summary.total += 1;
      if (task.status === 'done') summary.done += 1;
      else if (task.status === 'in-progress' || task.status === 'started') summary.inProgress += 1;
      else summary.open += 1;
      return summary;
    },
    { total: 0, done: 0, inProgress: 0, open: 0 }
  );
}

export function summarizePlanDrift(
  plan: Pick<StoredPlan, 'projectId' | 'suggestedTasks' | 'exportedTaskIds'>,
  tasks: Task[],
) {
  const plannedTitles = new Set((plan.suggestedTasks ?? []).map((task) => task.title));
  const exportedIds = new Set(plan.exportedTaskIds ?? []);
  const linkedTasks = tasks.filter((task) => exportedIds.has(task.id));
  const missing = (plan.suggestedTasks ?? []).filter((task) => !linkedTasks.some((linked) => linked.title === task.title));
  const extra = tasks.filter((task) => task.projectId === plan.projectId && !plannedTitles.has(task.title) && !exportedIds.has(task.id));

  return {
    missing,
    extra,
  };
}
