import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parsePhoneNumber } from '../src/lib/phone.ts';

test('normalizes an international telephone number into a tel link', () => {
  assert.deepEqual(parsePhoneNumber('+94 25 112 3456'), {
    status: 'ready',
    number: '+94251123456',
    displayNumber: '+94 25 112 3456',
    href: 'tel:+94251123456',
  });
});

test('omits telephone action when configuration is empty', () => {
  assert.deepEqual(parsePhoneNumber('  '), { status: 'missing' });
});

test('rejects local, malformed, and overlong telephone numbers', () => {
  for (const value of ['0771234567', 'abc', '+012345678', '+1234567', '+1234567890123456', null]) {
    assert.deepEqual(parsePhoneNumber(value), { status: 'invalid' });
  }
});
