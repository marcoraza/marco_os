import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProvider, latestSyncedAt } from '../lib/notionDataContract';
import { buildProjectIdMap, checklistItemToTask, formatDeadline } from '../utils/taskMappings';
import type { Task } from '../lib/appTypes';

test('buildProvider returns stable empty defaults when cache is missing', async () => {
  const provider = buildProvider('research', new Map(), new Map(), false, async () => {});

  assert.deepEqual(provider.items, []);
  assert.equal(provider.isLoading, false);
  assert.equal(provider.lastSync, null);
  assert.equal(provider.error, null);
  await assert.doesNotReject(provider.refetch());
});

test('latestSyncedAt extracts the most recent synced_at value', () => {
  const syncedAt = latestSyncedAt([
    { id: '1', synced_at: '2026-03-06T08:00:00.000Z' },
    { id: '2', synced_at: '2026-03-06T09:30:00.000Z' },
    { id: '3' },
  ]);

  assert.equal(syncedAt, '2026-03-06T09:30:00.000Z');
  assert.equal(latestSyncedAt([]), null);
});

test('buildProjectIdMap normalizes project names for lookups', () => {
  const map = buildProjectIdMap([
    { id: 'pessoal', name: 'Pessoal', color: '#00FF95', icon: 'person', deletable: false },
    { id: 'zaremba-gestao', name: 'Zaremba - Gestão', color: '#0A84FF', icon: 'folder', deletable: true },
  ]);

  assert.equal(map.get('pessoal'), 'pessoal');
  assert.equal(map.get('zaremba - gestão'), 'zaremba-gestao');
  assert.equal(map.get('zarembagesto'), 'zaremba-gestao');
});

test('checklistItemToTask maps status, project and notion id correctly', () => {
  const projectIdMap = buildProjectIdMap([
    { id: 'pessoal', name: 'Pessoal', color: '#00FF95', icon: 'person', deletable: false },
    { id: 'trabalho', name: 'Trabalho', color: '#0A84FF', icon: 'folder', deletable: true },
  ]);

  const task = checklistItemToTask({
    id: 'notion-1',
    title: 'Revisar orçamento',
    status: 'Em progresso',
    prioridade: 'Alta',
    responsavel: 'Marco',
    prazo: '2026-03-07',
    projeto: 'Trabalho',
    progresso: 0,
    notion_url: 'https://example.com',
  }, projectIdMap);

  assert.equal(task.title, 'Revisar orçamento');
  assert.equal(task.status, 'in-progress');
  assert.equal(task.priority, 'high');
  assert.equal(task.projectId, 'trabalho');
  assert.equal(task.assignee, 'Marco');
  assert.equal((task as Task & { notionId?: string }).notionId, 'notion-1');
});

test('formatDeadline keeps relative labels deterministic', () => {
  const RealDate = Date;
  class MockDate extends Date {
    constructor(...args: ConstructorParameters<typeof Date>) {
      super(...(args.length ? args : ['2026-03-06T12:00:00.000Z']));
    }
    static now() {
      return new RealDate('2026-03-06T12:00:00.000Z').getTime();
    }
  }

  // @ts-expect-error test clock shim
  global.Date = MockDate;

  try {
    assert.equal(formatDeadline('2026-03-06T12:00:00.000Z'), 'Hoje');
    assert.equal(formatDeadline('2026-03-07T12:00:00.000Z'), 'Amanhã');
    assert.equal(formatDeadline('2026-03-05T12:00:00.000Z'), 'Ontem');
    assert.equal(formatDeadline(undefined), 'A definir');
  } finally {
    global.Date = RealDate;
  }
});
