import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fixture, repository, put, symlink } from './helpers.mjs';
import { render } from '../scripts/lib/render.mjs';
import { readTree, assertTree } from '../scripts/lib/files.mjs';

function executableFixture(t) {
  const fixtureData = fixture(t);
  const { root } = fixtureData;
  for (const name of ['scripts', 'package.json', 'link-global.sh', 'codex/link-global.sh', 'opencode/link-global.sh']) {
    fs.cpSync(path.join(repository, name), path.join(root, name), { recursive: true });
  }
  symlink(path.join(repository, 'node_modules'), path.join(root, 'node_modules'));
  return fixtureData;
}

test('snapshot update is explicit and replaces the complete fixture set', t => {
  const { root } = executableFixture(t);
  const golden = path.join(root, 'tests/golden');
  put(path.join(golden, 'obsolete.md'), 'obsolete');
  put(path.join(golden, 'opencode/commands/bro.md'), 'outdated snapshot');
  const result = spawnSync(process.execPath, ['scripts/update-snapshots.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assertTree(readTree(golden), render(root));
  assert.equal(fs.existsSync(path.join(root, 'generated')), false);
  const before = readTree(golden);
  put(path.join(root, 'canonical/utilities/bro.md'), '{{ missing_value }}');
  const invalid = spawnSync(process.execPath, ['scripts/update-snapshots.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.deepEqual(readTree(golden), before);
});

test('scoped helpers share validation and never install dependencies', t => {
  const { root, env } = executableFixture(t);
  const run = (script, args) => spawnSync('bash', [script, ...args], { cwd: root, env: { ...process.env, ...env }, encoding: 'utf8' });
  assert.equal(run('link-global.sh', ['--unknown']).status, 1);
  assert.equal(run('link-global.sh', ['--harness']).status, 1);
  const dry = run('codex/link-global.sh', ['--dry-run']);
  assert.equal(dry.status, 0, dry.stderr);
  assert.match(dry.stdout, /BOTH payloads/);
  assert.equal(fs.existsSync(path.join(root, 'generated')), false);
  const result = run('codex/link-global.sh', []);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(env.OPENCODE_CONFIG_DIR), false);
  assert.equal(fs.lstatSync(path.join(env.CODEX_SKILLS_DIR, 'bro')).isSymbolicLink(), true);
  fs.unlinkSync(path.join(root, 'node_modules'));
  const missing = run('link-global.sh', ['--dry-run']);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /npm ci/);
});
