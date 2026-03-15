import test from 'node:test';
import assert from 'node:assert/strict';
import { extractNoteTags, filterNotes, getRelatedNotes, rankPaletteNotes } from '../lib/notesWorkflows';
import { calculateHealthCheckinStreak, getUpcomingFinanceEntries, summarizeFinanceMonth, summarizeWeeklyHealth } from '../lib/dailySystems';

test('extractNoteTags merges explicit and inline tags', () => {
  const tags = extractNoteTags({
    title: 'Plano #Sprint',
    body: 'Relacionar com #Agents e #Planner',
    tags: ['manual'],
  });

  assert.deepEqual(tags.sort(), ['agents', 'manual', 'planner', 'sprint']);
});

test('filterNotes supports favorites mode and text query', () => {
  const notes = [
    { id: '1', title: 'Alpha', body: '[[Beta]] #ops', createdAt: '', updatedAt: '2026-03-06T10:00:00.000Z', starred: true },
    { id: '2', title: 'Beta', body: 'plain body', createdAt: '', updatedAt: '2026-02-01T10:00:00.000Z', starred: false },
  ];

  const filtered = filterNotes(notes, 'ops', 'starred');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, '1');
});

test('getRelatedNotes resolves wiki links and backlinks', () => {
  const notes = [
    { id: '1', title: 'Alpha', body: 'See [[Beta]]', createdAt: '', updatedAt: '' },
    { id: '2', title: 'Beta', body: 'Links back to [[Alpha]]', createdAt: '', updatedAt: '' },
    { id: '3', title: 'Gamma', body: 'No links', createdAt: '', updatedAt: '' },
  ];

  const related = getRelatedNotes(notes, notes[0]);
  assert.deepEqual(related.map((note) => note.id), ['2']);
});

test('rankPaletteNotes prioritizes starred notes before recency', () => {
  const ranked = rankPaletteNotes([
    { id: '1', title: 'Recent normal', body: '', createdAt: '', updatedAt: '2026-03-06T10:00:00.000Z', starred: false },
    { id: '2', title: 'Older starred', body: '', createdAt: '', updatedAt: '2026-03-05T10:00:00.000Z', starred: true },
  ]);

  assert.deepEqual(ranked.map((note) => note.id), ['2', '1']);
});

test('summarizeFinanceMonth and upcoming entries use real dates', () => {
  const entries = [
    { id: '1', name: 'Salario', valor: 10000, tipo: 'entrada' as const, categoria: 'trabalho', data: '2026-03-05', recorrente: true, createdAt: '', updatedAt: '' },
    { id: '2', name: 'Aluguel', valor: 2500, tipo: 'saida' as const, categoria: 'casa', data: '2026-03-10', recorrente: true, createdAt: '', updatedAt: '' },
    { id: '3', name: 'Mercado', valor: 800, tipo: 'saida' as const, categoria: 'alimentacao', data: '2026-03-22', recorrente: false, createdAt: '', updatedAt: '' },
  ];

  assert.deepEqual(summarizeFinanceMonth(entries, '2026-03'), { income: 10000, expenses: 3300, balance: 6700 });
  assert.equal(getUpcomingFinanceEntries(entries, '2026-03-06', 7).length, 1);
});

test('health summaries compute streak and weekly average from check-ins', () => {
  const entries = [
    { id: '1', name: 'Check-in diario', tipo: 'humor' as const, valor: 8, data: '2026-03-06', createdAt: '', updatedAt: '' },
    { id: '2', name: 'Check-in diario', tipo: 'humor' as const, valor: 7, data: '2026-03-05', createdAt: '', updatedAt: '' },
    { id: '3', name: 'Check-in diario', tipo: 'humor' as const, valor: 9, data: '2026-03-03', createdAt: '', updatedAt: '' },
  ];

  assert.equal(calculateHealthCheckinStreak(entries), 2);
  assert.deepEqual(summarizeWeeklyHealth(entries, '2026-03-06'), { totalCheckins: 3, averageMood: 8 });
});
