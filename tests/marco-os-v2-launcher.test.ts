import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MARCO_OS_V2_URL, resolveMarcoOsV2Url } from '../lib/marcoOsV2';

test('resolveMarcoOsV2Url falls back to the local V2 runtime when empty', () => {
  assert.equal(resolveMarcoOsV2Url(''), DEFAULT_MARCO_OS_V2_URL);
  assert.equal(resolveMarcoOsV2Url(undefined), DEFAULT_MARCO_OS_V2_URL);
});

test('resolveMarcoOsV2Url preserves absolute configured URLs', () => {
  assert.equal(resolveMarcoOsV2Url('https://mc.example.com/v2'), 'https://mc.example.com/v2');
});

test('resolveMarcoOsV2Url resolves relative URLs against the current origin', () => {
  const originalWindow = globalThis.window;

  Object.defineProperty(globalThis, 'window', {
    value: { location: { origin: 'https://marco.local' } },
    configurable: true,
  });

  try {
    assert.equal(resolveMarcoOsV2Url('/mission-control-v2'), 'https://marco.local/mission-control-v2');
  } finally {
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
    });
  }
});
