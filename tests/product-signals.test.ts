import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildExecutiveBriefing,
  buildRelationshipNextStep,
  buildWeeklyReview,
  inferRelationshipSegment,
  rankTopTags,
  scoreRelationship,
  summarizeDelegationQueue,
} from '../lib/productSignals';

test('buildExecutiveBriefing prioritizes urgent operational pressure', () => {
  const briefing = buildExecutiveBriefing({
    meetingsToday: 2,
    tasksDueToday: 4,
    urgentTasks: 3,
    activeProjects: 5,
    pendingFollowUps: 1,
    balance: -200,
    healthCheckins: 0,
  });

  assert.equal(briefing.summary, '3 prioridade(s) alta(s) pedem ação hoje');
  assert.deepEqual(briefing.priorities.slice(0, 2), [
    '3 prioridade(s) alta(s) pedem ação hoje',
    '1 follow-up(s) pendente(s)',
  ]);
  assert.equal(briefing.balanceTone, 'negative');
});

test('buildWeeklyReview returns top tags and main focus', () => {
  const review = buildWeeklyReview({
    pendingKnowledge: 2,
    decisionsThisWeek: 3,
    tasksDoneThisWeek: 4,
    healthCheckinsThisWeek: 1,
    tags: ['ai', 'ops', 'ai', 'planning'],
  });

  assert.equal(review.headline, 'revisar 2 anotação(ões) pendente(s)');
  assert.equal(review.topTags[0].tag, 'ai');
  assert.equal(review.retention, 44);
});

test('summarizeDelegationQueue counts statuses correctly', () => {
  const summary = summarizeDelegationQueue([
    { id: '1', agentId: 'a1', mission: 'A', priority: 'high', status: 'pending', createdAt: '' },
    { id: '2', agentId: 'a1', mission: 'B', priority: 'high', status: 'sent', createdAt: '' },
    { id: '3', agentId: 'a2', mission: 'C', priority: 'low', status: 'failed', createdAt: '' },
  ]);

  assert.deepEqual(summary, {
    total: 3,
    pending: 1,
    sent: 1,
    running: 0,
    done: 0,
    failed: 1,
  });
});

test('relationship helpers infer segment, score and next step', () => {
  const segment = inferRelationshipSegment({
    role: 'Angel Investor',
    company: 'SeedLatam',
    tags: ['Investidor'],
  });
  const score = scoreRelationship({
    status: 'warm',
    lastContact: 'Há 15 dias',
    tags: ['Investidor'],
    interactionLog: [{ id: '1', type: 'meeting', title: 'Call', happenedAt: '2026-03-01' }],
    nextFollowUp: '2026-03-05',
  });
  const nextStep = buildRelationshipNextStep({ name: 'Marcos', nextFollowUp: '2026-03-05', status: 'warm' }, segment);

  assert.equal(segment, 'investidor');
  assert.equal(score, 21);
  assert.equal(nextStep, 'Retomar contato com Marcos hoje');
});

test('rankTopTags sorts by frequency then alphabetically', () => {
  assert.deepEqual(rankTopTags(['ops', 'ai', 'ops', 'planning', 'ai', 'ai']), [
    { tag: 'ai', count: 3 },
    { tag: 'ops', count: 2 },
    { tag: 'planning', count: 1 },
  ]);
});
