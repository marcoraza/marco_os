import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeAgentRoster } from '../hooks/useAgentRosterSync';
import { isMissionTitleValid } from '../components/MissionModal';
import { getToastAppearance } from '../components/ui/Toast';
import { extractProviderItems } from '../lib/providerData';

test('mergeAgentRoster updates known agents and ignores invalid live payload sets', () => {
  const previous = [
    {
      id: 'main',
      name: 'Frank',
      role: 'coordinator' as const,
      status: 'online' as const,
      lastHeartbeat: 'old',
      uptime: '1h',
      tags: ['gateway'],
      currentMission: 'Legacy',
    },
  ];

  const ignored = mergeAgentRoster(previous, [
    { id: 'ghost', name: 'Ghost', role: 'sub-agent', status: 'offline' },
  ]);
  assert.equal(ignored, previous);

  const merged = mergeAgentRoster(previous, [
    {
      id: 'main',
      name: 'Frank',
      role: 'coordinator',
      status: 'busy',
      currentMission: 'Nova missao',
    },
    {
      id: 'coder',
      name: 'Coder',
      role: 'sub-agent',
      status: 'online',
      tags: ['code'],
    },
  ]);

  assert.notEqual(merged, previous);
  assert.equal(merged[0].status, 'busy');
  assert.equal(merged[0].lastHeartbeat, 'old');
  assert.equal(merged[0].currentMission, 'Nova missao');
  assert.equal(merged[1].id, 'coder');
});

test('isMissionTitleValid rejects blank titles', () => {
  assert.equal(isMissionTitleValid('Fechar sprint'), true);
  assert.equal(isMissionTitleValid('   '), false);
});

test('getToastAppearance maps variants to consistent icons and colors', () => {
  assert.deepEqual(getToastAppearance('success'), {
    icon: 'check_circle',
    className: 'bg-surface border border-brand-mint/30 shadow-lg',
    iconClassName: 'text-brand-mint',
  });
  assert.equal(getToastAppearance('error').icon, 'error');
  assert.equal(getToastAppearance('info').iconClassName, 'text-accent-blue');
});

test('extractProviderItems normalizes provider payloads', () => {
  assert.deepEqual(
    extractProviderItems<{ id: string }>([{ _meta: true, items: [{ id: '1' }] }]),
    [{ id: '1' }],
  );
  assert.deepEqual(extractProviderItems([{ id: '2' }]), [{ id: '2' }]);
  assert.deepEqual(extractProviderItems(null), []);
});
