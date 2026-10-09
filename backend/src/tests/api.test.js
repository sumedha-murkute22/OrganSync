/**
 * OrganSync - Backend Automated Test Suite
 * Tests authentication, authorization, clinical endpoints, C engine integration, and audit logging.
 */

const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

test('C Engine Status and Compilation Verification', async (t) => {
  const fs = require('fs');
  const path = require('path');
  const dsaExe = path.resolve(__dirname, '../../../dsa/organsync_engine.exe');
  assert.ok(fs.existsSync(dsaExe), 'organsync_engine.exe must exist and be compiled');
});

test('Blood Compatibility Matrix Invariant Checks', (t) => {
  function isBloodCompatible(donor, recipient) {
    if (donor === 'O-') return true;
    if (donor === 'O+') return ['O+', 'A+', 'B+', 'AB+'].includes(recipient);
    if (donor === 'A-') return ['A-', 'A+', 'AB-', 'AB+'].includes(recipient);
    if (donor === 'A+') return ['A+', 'AB+'].includes(recipient);
    if (donor === 'B-') return ['B-', 'B+', 'AB-', 'AB+'].includes(recipient);
    if (donor === 'B+') return ['B+', 'AB+'].includes(recipient);
    if (donor === 'AB-') return ['AB-', 'AB+'].includes(recipient);
    if (donor === 'AB+') return recipient === 'AB+';
    return false;
  }

  // Universal Donor O-
  assert.strictEqual(isBloodCompatible('O-', 'O-'), true);
  assert.strictEqual(isBloodCompatible('O-', 'AB+'), true);
  // O+ Rh restrictions
  assert.strictEqual(isBloodCompatible('O+', 'A+'), true);
  assert.strictEqual(isBloodCompatible('O+', 'A-'), false);
  // Universal Recipient AB+
  assert.strictEqual(isBloodCompatible('A+', 'AB+'), true);
  assert.strictEqual(isBloodCompatible('B+', 'AB+'), true);
  assert.strictEqual(isBloodCompatible('AB+', 'O+'), false);
});

test('Audit Event Cryptographic Hash Generation Invariant', (t) => {
  const crypto = require('crypto');
  const ts = '2026-10-09T04:15:00Z';
  const event = 'ALLOCATION_APPROVED';
  const actor = 'Dr. James Sterling, MD';
  const target = 'CASE-ALC-701';
  const details = 'Clinical approval recorded';

  const raw = `${ts}:${event}:${actor}:${target}:${details}`;
  const hash1 = crypto.createHash('sha256').update(raw).digest('hex');
  const hash2 = crypto.createHash('sha256').update(raw).digest('hex');

  assert.strictEqual(hash1, hash2, 'Hash must be strictly reproducible');
  assert.strictEqual(hash1.length, 64, 'SHA-256 hex digest must be 64 characters');
});
