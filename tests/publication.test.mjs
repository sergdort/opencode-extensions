import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { withLock, publish, checkPublicationRoot } from '../scripts/lib/publish.mjs';
import { contentHash, readTree } from '../scripts/lib/files.mjs';
import { fixture, put, symlink } from './helpers.mjs';

test('atomic publication, repeatability, failure checkpoints and writer exclusion', t => {
  const { root } = fixture(t);
  const first = { 'opencode/a.md': 'first', 'codex/b.md': 'first' };
  const second = { 'opencode/a.md': 'second', 'codex/b.md': 'second' };
  const current = path.join(root, 'generated/current');
  withLock(root, () => publish(root, first));
  const target = fs.readlinkSync(current);
  const inode = fs.lstatSync(current).ino;
  withLock(root, () => publish(root, first));
  assert.equal(fs.lstatSync(current).ino, inode);
  for (const point of ['before-release', 'before-current']) {
    assert.throws(() => withLock(root, () => publish(root, second, at => { if (at === point) throw Error('injected'); })), /injected/);
    assert.equal(fs.readlinkSync(current), target);
    assert.deepEqual(readTree(fs.realpathSync(current)), first);
  }
  assert.throws(() => withLock(root, () => publish(root, second, at => { if (at === 'after-current') throw Error('injected'); })), /injected/);
  assert.deepEqual(readTree(fs.realpathSync(current)), second);
  assert.throws(() => withLock(root, () => withLock(root, () => {})), /lock exists/);
  assert.equal(fs.existsSync(path.join(root, 'generated/.lock')), false);
  fs.mkdirSync(path.join(root, 'generated/.lock'));
  assert.throws(() => withLock(root, () => {}), /manually/);
  fs.rmdirSync(path.join(root, 'generated/.lock')); // Explicit recovery of this test-owned stale lock.
  assert.equal(withLock(root, () => 'recovered'), 'recovered');
  put(path.join(root, 'generated/releases', contentHash(second), 'codex/b.md'), 'tampered');
  assert.throws(() => withLock(root, () => publish(root, second)), /differs/);
});

test('generated root and payload links cannot redirect writes', t => {
  const { root, base } = fixture(t);
  const other = path.join(base, 'other'); fs.mkdirSync(other);
  symlink(other, path.join(root, 'generated'));
  assert.throws(() => withLock(root, () => publish(root, { a: 'x' })), /Unsafe generated/);
  assert.deepEqual(fs.readdirSync(other), []);
  fs.unlinkSync(path.join(root, 'generated')); fs.mkdirSync(path.join(root, 'generated'));
  symlink(other, path.join(root, 'generated/current'));
  assert.throws(() => checkPublicationRoot(root), /unmanaged current/);
});
