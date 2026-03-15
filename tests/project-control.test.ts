import test from 'node:test';
import assert from 'node:assert/strict';
import { derivePlanMilestones, summarizeProjectControl } from '../lib/projectControl';

test('summarizeProjectControl aggregates project scoped tasks, notes and events', () => {
  const summary = summarizeProjectControl(
    { id: 'p1', name: 'Projeto 1', color: '#fff', deletable: true },
    [
      { id: 1, title: 'A', tag: 'DEV', projectId: 'p1', status: 'assigned', priority: 'high', deadline: '2026-03-08', assignee: 'MA', dependencies: 0 },
      { id: 2, title: 'B', tag: 'DEV', projectId: 'p1', status: 'done', priority: 'low', deadline: '2026-03-09', assignee: 'MA', dependencies: 0 },
      { id: 3, title: 'C', tag: 'DEV', projectId: 'p2', status: 'assigned', priority: 'high', deadline: '2026-03-10', assignee: 'MA', dependencies: 0 },
    ],
    [
      { id: 'n1', title: 'Nota', body: '', createdAt: '', updatedAt: '', projectId: 'p1' },
      { id: 'n2', title: 'Outra', body: '', createdAt: '', updatedAt: '', projectId: 'p2' },
    ],
    [
      { id: 'e1', title: 'Call', date: '2026-03-08', createdAt: '', updatedAt: '', projectId: 'p1' },
    ],
  );

  assert.deepEqual(summary, { open: 1, critical: 1, done: 1, notes: 1, upcomingEvents: 1 });
});

test('derivePlanMilestones creates kickoff review and delivery markers', () => {
  const milestones = derivePlanMilestones('Plano', ['2026-03-08', '2026-03-10', '2026-03-15']);

  assert.deepEqual(milestones, [
    { id: 'Plano-kickoff', label: 'Kickoff', deadline: '2026-03-08' },
    { id: 'Plano-review', label: 'Review', deadline: '2026-03-10' },
    { id: 'Plano-delivery', label: 'Entrega', deadline: '2026-03-15' },
  ]);
});
