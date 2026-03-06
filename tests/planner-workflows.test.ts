import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlanExportTasks, getPlanExportCandidates, getPlannerResumeTarget, summarizePlanDrift, summarizePlanExecution } from '../lib/plannerWorkflows';
import type { StoredPlan } from '../data/models';

const basePlan: StoredPlan = {
  id: 'plan-1',
  title: 'Plano Alpha',
  context: 'Contexto',
  projectId: 'pessoal',
  summary: 'Resumo',
  objectives: [],
  steps: [],
  risks: [],
  checklist: [],
  suggestedTasks: [
    { title: 'Mapear escopo', tag: 'PLANEJAMENTO', priority: 'high', deadline: '2026-03-08' },
    { title: 'Executar MVP', tag: 'DEV', priority: 'medium', deadline: '2026-03-10' },
  ],
  exported: false,
  createdAt: '2026-03-06T10:00:00.000Z',
  updatedAt: '2026-03-06T10:00:00.000Z',
};

test('buildPlanExportTasks preserves suggested task context for app tasks', () => {
  const tasks = buildPlanExportTasks(basePlan, 'pessoal');

  assert.equal(tasks.length, 2);
  assert.deepEqual(tasks[0], {
    title: 'Mapear escopo',
    tag: 'PLANEJAMENTO',
    projectId: 'pessoal',
    status: 'assigned',
    priority: 'high',
    deadline: '2026-03-08',
  });
});

test('getPlannerResumeTarget prefers the last opened plan over plain updatedAt', () => {
  const target = getPlannerResumeTarget([
    { ...basePlan, id: 'older', updatedAt: '2026-03-06T08:00:00.000Z' },
    { ...basePlan, id: 'recent-open', updatedAt: '2026-03-06T07:00:00.000Z', lastOpenedAt: '2026-03-06T11:00:00.000Z' },
  ]);

  assert.equal(target?.id, 'recent-open');
});

test('summarizePlanExecution links exported task ids to runtime task progress', () => {
  const summary = summarizePlanExecution(
    { ...basePlan, exportedTaskIds: [101, 102] },
    [
      { id: 101, title: 'Mapear escopo', tag: 'PLANEJAMENTO', projectId: 'pessoal', status: 'done', priority: 'high', deadline: '2026-03-08', assignee: 'MA', dependencies: 0 },
      { id: 102, title: 'Executar MVP', tag: 'DEV', projectId: 'pessoal', status: 'in-progress', priority: 'medium', deadline: '2026-03-10', assignee: 'MA', dependencies: 0 },
      { id: 103, title: 'Outra tarefa', tag: 'GERAL', projectId: 'pessoal', status: 'assigned', priority: 'low', deadline: '2026-03-12', assignee: 'MA', dependencies: 0 },
    ]
  );

  assert.deepEqual(summary, {
    total: 2,
    done: 1,
    inProgress: 1,
    open: 0,
  });
});

test('getPlanExportCandidates only returns suggested tasks not already linked', () => {
  const candidates = getPlanExportCandidates(
    { ...basePlan, exportedTaskIds: [101] },
    [
      { id: 101, title: 'Mapear escopo', tag: 'PLANEJAMENTO', projectId: 'pessoal', status: 'done', priority: 'high', deadline: '2026-03-08', assignee: 'MA', dependencies: 0 },
    ],
    'pessoal'
  );

  assert.deepEqual(candidates.map((task) => task.title), ['Executar MVP']);
});

test('summarizePlanDrift reports missing and extra tasks around the linked plan', () => {
  const drift = summarizePlanDrift(
    { ...basePlan, exportedTaskIds: [101] },
    [
      { id: 101, title: 'Mapear escopo', tag: 'PLANEJAMENTO', projectId: 'pessoal', status: 'done', priority: 'high', deadline: '2026-03-08', assignee: 'MA', dependencies: 0 },
      { id: 999, title: 'Task improvisada', tag: 'OPS', projectId: 'pessoal', status: 'assigned', priority: 'low', deadline: '2026-03-11', assignee: 'MA', dependencies: 0 },
    ]
  );

  assert.deepEqual(drift.missing.map((task) => task.title), ['Executar MVP']);
  assert.deepEqual(drift.extra.map((task) => task.title), ['Task improvisada']);
});
