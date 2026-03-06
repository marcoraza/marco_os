import test from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../utils/cn';
import { calculateHealthScore, getScoreColor } from '../utils/scoreUtils';
import { formatRelative, getDayKey, groupByWeek } from '../utils/dateUtils';
import { createPaletteEvent, createPaletteNote, createPaletteTask, createProject, mergeLiveAgent } from '../data/domainFactories';

test('cn joins only truthy classes', () => {
  assert.equal(cn('base', undefined, false, 'active', null, 'done'), 'base active done');
});

test('calculateHealthScore applies weights correctly', () => {
  assert.equal(calculateHealthScore([
    { label: 'sleep', value: 80, weight: 0.5 },
    { label: 'focus', value: 60, weight: 0.5 },
  ]), 70);
});

test('getScoreColor returns expected buckets', () => {
  assert.equal(getScoreColor(80), 'text-brand-mint');
  assert.equal(getScoreColor(50), 'text-accent-orange');
  assert.equal(getScoreColor(20), 'text-accent-red');
});

test('dateUtils formats recent dates and groups by week', () => {
  const realNow = Date.now;
  Date.now = () => new Date('2026-03-06T12:00:00.000Z').getTime();

  try {
    assert.equal(formatRelative('2026-03-06T11:59:30.000Z'), 'agora');
    assert.equal(formatRelative('2026-03-06T11:15:00.000Z'), '45min atrás');
    assert.equal(formatRelative('2026-03-06T09:00:00.000Z'), '3h atrás');
    assert.equal(getDayKey(new Date('2026-03-06T12:00:00.000Z')), '2026-03-06');

    const items = [
      { id: 1, date: new Date('2026-03-04T12:00:00.000Z') },
      { id: 2, date: new Date('2026-03-05T12:00:00.000Z') },
    ];
    const grouped = groupByWeek(items, (item) => item.date);

    assert.equal(grouped.size, 1);
    assert.deepEqual(grouped.get('2026-03-01')?.map((item) => item.id), [1, 2]);
  } finally {
    Date.now = realNow;
  }
});

test('domainFactories create stable app entities', () => {
  const project = createProject('Projeto X', '#0A84FF');
  assert.equal(project.name, 'Projeto X');
  assert.equal(project.icon, 'folder');
  assert.equal(project.deletable, true);

  const task = createPaletteTask('Fechar sprint', 'pessoal');
  assert.equal(task.projectId, 'pessoal');
  assert.equal(task.status, 'assigned');
  assert.equal(task.priority, 'medium');

  const note = createPaletteNote('Idea', 'pessoal', '2026-03-06T10:00:00.000Z');
  assert.equal(note.title, 'Idea');
  assert.equal(note.projectId, 'pessoal');
  assert.equal(note.createdAt, '2026-03-06T10:00:00.000Z');

  const event = createPaletteEvent('Review', 'pessoal', '2026-03-06T10:00:00.000Z');
  assert.equal(event.title, 'Review');
  assert.equal(event.date, '2026-03-06');
});

test('mergeLiveAgent preserves fallback values when live payload is partial', () => {
  const merged = mergeLiveAgent(
    {
      id: 'main',
      name: 'Frank',
      role: 'coordinator',
      status: 'online',
      lastHeartbeat: 'old',
      uptime: '1h',
      tags: ['gateway'],
    },
    {
      id: 'main',
      name: 'Frank',
      role: 'coordinator',
      status: 'busy',
      tags: ['live'],
    },
  );

  assert.equal(merged.status, 'busy');
  assert.equal(merged.lastHeartbeat, 'old');
  assert.equal(merged.uptime, '1h');
  assert.deepEqual(merged.tags, ['live']);
});
