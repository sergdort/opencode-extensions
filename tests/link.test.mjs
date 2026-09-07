import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateAndLink, installation, applyInstallation } from '../scripts/lib/link.mjs';
import { fixture, put, symlink } from './helpers.mjs';

const quiet = () => {};
test('legacy links through a checkout alias are owned even after source removal', t => {
  const { root, env, base } = fixture(t);
  const alias = path.join(base, 'checkout-alias');
  symlink(root, alias);
  const destination = path.join(env.CODEX_AGENTS_DIR, 'developer.toml');
  symlink(path.join(alias, 'codex/agents/developer.toml'), destination);
  put(path.join(root, 'codex/agents/oracle.toml'), 'existing legacy source');
  const oracle = path.join(env.CODEX_AGENTS_DIR, 'oracle.toml');
  symlink(path.join(alias, 'codex/agents/oracle.toml'), oracle);
  const retired = path.join(env.CODEX_SKILLS_DIR, 'decompose');
  symlink(path.join(alias, 'codex/skills/decompose'), retired);
  generateAndLink(root, { harness: 'codex' }, env, quiet);
  assert.equal(fs.readlinkSync(destination), path.join(root, 'generated/current/codex/agents/developer.toml'));
  assert.equal(fs.readlinkSync(oracle), path.join(root, 'generated/current/codex/agents/oracle.toml'));
  assert.equal(fs.existsSync(retired), false);
});

test('isolated installation, current and dangling legacy links, retired links, and optional packages', t => {
  const { root, env } = fixture(t);
  const developer = path.join(env.CODEX_AGENTS_DIR, 'developer.toml');
  symlink(path.join(root, 'codex/agents/developer.toml'), developer);
  const retired = path.join(env.CODEX_SKILLS_DIR, 'decompose');
  symlink(path.join(root, 'codex/skills/decompose'), retired);
  const userFile = path.join(env.CODEX_SKILLS_DIR, 'unrelated.md'); put(userFile, 'preserve');
  generateAndLink(root, { withLibrarian: true, withReview: true }, env, quiet);
  assert.match(fs.readlinkSync(developer), /generated\/current\/codex\/agents\/developer.toml$/);
  assert.equal(fs.existsSync(retired), false);
  assert.equal(fs.readFileSync(userFile, 'utf8'), 'preserve');
  const grill = path.join(env.CODEX_SKILLS_DIR, 'grill-me-architecture/SKILL.md');
  assert.equal(fs.realpathSync(grill), path.join(root, 'skills/grill-me-architecture/SKILL.md'));
  const inode = fs.lstatSync(developer).ino;
  generateAndLink(root, { withLibrarian: true, withReview: true }, env, quiet);
  assert.equal(fs.lstatSync(developer).ino, inode);
  assert.ok(fs.existsSync(path.join(env.CODEX_AGENTS_DIR, 'github_librarian.toml')));
  assert.ok(fs.existsSync(path.join(env.OPENCODE_CONFIG_DIR, 'commands/review-work.md')));
});

test('dry run, conflicts and missing sources leave current output and destinations unchanged', t => {
  const { root, base, env } = fixture(t);
  generateAndLink(root, { dryRun: true }, env, quiet);
  assert.equal(fs.existsSync(path.join(root, 'generated')), false);
  assert.deepEqual(fs.readdirSync(path.join(base, 'home')), []);
  const conflict = path.join(env.CODEX_AGENTS_DIR, 'oracle.toml'); put(conflict, 'USER');
  assert.throws(() => generateAndLink(root, {}, env, quiet), /conflicting destination/);
  assert.equal(fs.readFileSync(conflict, 'utf8'), 'USER');
  assert.equal(fs.existsSync(path.join(root, 'generated/current')), false);
  generateAndLink(root, { force: true }, env, quiet);
  const current = fs.readlinkSync(path.join(root, 'generated/current'));
  fs.unlinkSync(path.join(root, 'canonical/utilities/bro.md'));
  assert.throws(() => generateAndLink(root, {}, env, quiet), /bro.md/);
  assert.equal(fs.readlinkSync(path.join(root, 'generated/current')), current);
});

test('foreign links, directory conflicts and broad destination roots remain protected', t => {
  const { root, env, base } = fixture(t);
  const destination = path.join(env.CODEX_AGENTS_DIR, 'oracle.toml');
  symlink(path.join(base, 'another-checkout/oracle.toml'), destination);
  assert.throws(() => installation(root, { force: true }, env), /conflicting destination/);
  assert.equal(fs.readlinkSync(destination), path.join(base, 'another-checkout/oracle.toml'));
  fs.unlinkSync(destination); fs.mkdirSync(destination);
  assert.throws(() => installation(root, { force: true }, env), /conflicting destination/);
  for (const value of ['/', env.HOME, root, path.join(root, 'nested'), '..']) {
    assert.throws(() => installation(root, { harness: 'opencode' }, { ...env, OPENCODE_CONFIG_DIR: value }), /Unsafe destination/);
  }
});

test('selected link edits with shared publication; partial installation can resume', t => {
  const { root, env } = fixture(t);
  generateAndLink(root, {}, env, quiet);
  const skill = path.join(env.CODEX_SKILLS_DIR, 'bro');
  const inode = fs.lstatSync(skill).ino;
  const canonical = path.join(root, 'canonical/utilities/bro.md');
  fs.appendFileSync(canonical, '\nShared update.\n');
  const notices = [];
  generateAndLink(root, { harness: 'opencode' }, env, message => notices.push(message));
  assert.equal(fs.lstatSync(skill).ino, inode);
  assert.match(fs.readFileSync(path.join(skill, 'SKILL.md'), 'utf8'), /Shared update/);
  assert.match(notices.join('\n'), /BOTH payloads/);
  const newEnv = { ...env, CODEX_SKILLS_DIR: path.join(env.HOME, 'new-skills'), CODEX_AGENTS_DIR: path.join(env.HOME, 'new-agents') };
  const actions = installation(root, { harness: 'codex' }, newEnv);
  assert.throws(() => applyInstallation(actions, (_, count) => { if (count === 2) throw Error('injected'); }, quiet), /Installation incomplete/);
  generateAndLink(root, { harness: 'codex' }, newEnv, quiet);
  assert.ok(fs.existsSync(path.join(newEnv.CODEX_AGENTS_DIR, 'developer_luna.toml')));
});

test('changed destinations after preflight and symlink parents stop installation', t => {
  const { root, env, base } = fixture(t);
  const actions = installation(root, {}, env);
  put(actions[0].destination, 'new user content');
  assert.throws(() => applyInstallation(actions, undefined, quiet), /changed after preflight/);
  assert.equal(fs.readFileSync(actions[0].destination, 'utf8'), 'new user content');
  fs.unlinkSync(actions[0].destination);
  const foreign = path.join(base, 'foreign'); fs.mkdirSync(foreign);
  symlink(foreign, path.join(env.CODEX_SKILLS_DIR, 'grill-me-architecture'));
  assert.throws(() => installation(root, {}, env), /Unsafe destination parent/);
});
