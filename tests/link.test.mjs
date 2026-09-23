import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as TOML from 'smol-toml';
import { render } from '../scripts/lib/render.mjs';
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
  for (const file of [destination, oracle]) assert.equal(fs.lstatSync(file).isFile(), true);
  assert.equal(TOML.parse(fs.readFileSync(destination, 'utf8')).name, 'developer');
  assert.equal(TOML.parse(fs.readFileSync(oracle, 'utf8')).name, 'oracle');
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
  assert.equal(fs.lstatSync(developer).isFile(), true);
  assert.deepEqual(TOML.parse(fs.readFileSync(developer, 'utf8')), TOML.parse(render(root)['codex/agents/developer.toml']));
  assert.equal(fs.existsSync(retired), false);
  assert.equal(fs.readFileSync(userFile, 'utf8'), 'preserve');
  const grill = path.join(env.CODEX_SKILLS_DIR, 'grill-me-architecture/SKILL.md');
  assert.equal(fs.realpathSync(grill), path.join(root, 'skills/grill-me-architecture/SKILL.md'));
  const showMe = path.join(env.CODEX_SKILLS_DIR, 'show-me/SKILL.md');
  assert.equal(fs.realpathSync(showMe), path.join(root, 'skills/show-me/SKILL.md'));
  for (const name of ['show-me', 'grill-me-architecture']) {
    const dir = path.join(env.CODEX_SKILLS_DIR, name);
    assert.equal(fs.readlinkSync(dir), path.join(root, 'skills', name));
    assert.equal(fs.lstatSync(path.join(dir, 'SKILL.md')).isFile(), true);
  }
  const inode = fs.lstatSync(developer).ino;
  generateAndLink(root, { withLibrarian: true, withReview: true }, env, quiet);
  assert.equal(fs.lstatSync(developer).ino, inode);
  assert.equal(fs.lstatSync(path.join(env.CODEX_AGENTS_DIR, 'github_librarian.toml')).isFile(), true);
  assert.ok(fs.existsSync(path.join(env.OPENCODE_CONFIG_DIR, 'commands/review-work.md')));
});

test('retired Architect links are removed only when owned by this checkout', t => {
  const { root, env, base } = fixture(t);
  const destination = path.join(env.CODEX_SKILLS_DIR, 'architect');
  for (const source of ['codex/skills/architect', 'generated/current/codex/skills/architect']) {
    symlink(path.join(root, source), destination);
    generateAndLink(root, { harness: 'codex' }, env, quiet);
    assert.equal(fs.lstatSync(destination, { throwIfNoEntry: false }), undefined);
  }
  const foreign = path.join(base, 'foreign/architect');
  symlink(foreign, destination);
  generateAndLink(root, { harness: 'codex', force: true }, env, quiet);
  assert.equal(fs.readlinkSync(destination), foreign);
  fs.unlinkSync(destination);
  put(path.join(destination, 'SKILL.md'), 'user-owned skill');
  generateAndLink(root, { harness: 'codex', force: true }, env, quiet);
  assert.equal(fs.readFileSync(path.join(destination, 'SKILL.md'), 'utf8'), 'user-owned skill');
});

test('shared show-me conflicts are preserved before publication', t => {
  const { root, env, base } = fixture(t);
  const destination = path.join(env.CODEX_SKILLS_DIR, 'show-me/SKILL.md');
  put(destination, 'personal show-me');
  assert.throws(() => generateAndLink(root, {}, env, quiet), /conflicting destination/);
  assert.equal(fs.readFileSync(destination, 'utf8'), 'personal show-me');
  assert.equal(fs.existsSync(path.join(root, 'generated/current')), false);
  fs.unlinkSync(destination);
  const foreign = path.join(base, 'personal/SKILL.md');
  symlink(foreign, destination);
  assert.throws(() => generateAndLink(root, { force: true }, env, quiet), /conflicting destination/);
  assert.equal(fs.readlinkSync(destination), foreign);
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

test('changed destinations after preflight and foreign skill directory links stop installation', t => {
  const { root, env, base } = fixture(t);
  const actions = installation(root, {}, env);
  put(actions[0].destination, 'new user content');
  assert.throws(() => applyInstallation(actions, undefined, quiet), /changed after preflight/);
  assert.equal(fs.readFileSync(actions[0].destination, 'utf8'), 'new user content');
  fs.unlinkSync(actions[0].destination);
  const foreign = path.join(base, 'foreign'); fs.mkdirSync(foreign);
  symlink(foreign, path.join(env.CODEX_SKILLS_DIR, 'grill-me-architecture'));
  assert.throws(() => installation(root, {}, env), /conflicting destination/);
});

test('shared skill file-link installs are preserved until explicitly moved, then directory links install', t => {
  const { root, env, base } = fixture(t);
  for (const name of ['show-me', 'grill-me-architecture']) {
    symlink(path.join(root, 'skills', name, 'SKILL.md'), path.join(env.CODEX_SKILLS_DIR, name, 'SKILL.md'));
  }
  for (const options of [{ dryRun: true }, {}, { force: true }]) {
    assert.throws(() => generateAndLink(root, { harness: 'codex', ...options }, env, quiet), /conflicting destination/);
    assert.equal(fs.existsSync(path.join(root, 'generated/current')), false);
    for (const name of ['show-me', 'grill-me-architecture']) {
      assert.equal(fs.lstatSync(path.join(env.CODEX_SKILLS_DIR, name)).isDirectory(), true);
      assert.equal(fs.readlinkSync(path.join(env.CODEX_SKILLS_DIR, name, 'SKILL.md')), path.join(root, 'skills', name, 'SKILL.md'));
    }
  }
  for (const name of ['show-me', 'grill-me-architecture']) {
    fs.renameSync(path.join(env.CODEX_SKILLS_DIR, name), path.join(base, name + '-old'));
  }
  generateAndLink(root, { harness: 'codex' }, env, quiet);
  for (const name of ['show-me', 'grill-me-architecture']) {
    const dir = path.join(env.CODEX_SKILLS_DIR, name);
    assert.equal(fs.readlinkSync(dir), path.join(root, 'skills', name));
    const inode = fs.lstatSync(dir).ino;
    generateAndLink(root, { harness: 'codex' }, env, quiet);
    assert.equal(fs.lstatSync(dir).ino, inode);
    assert.equal(fs.readlinkSync(path.join(base, name + '-old/SKILL.md')), path.join(root, 'skills', name, 'SKILL.md'));
  }
});

test('Codex copies migrate owned generated links, update unchanged content, and preserve edits', t => {
  const { root, env } = fixture(t);
  const agent = path.join(env.CODEX_AGENTS_DIR, 'developer.toml');
  symlink(path.join(root, 'generated/current/codex/agents/developer.toml'), agent);
  generateAndLink(root, { harness: 'codex', dryRun: true }, env, quiet);
  assert.equal(fs.lstatSync(agent).isSymbolicLink(), true);
  generateAndLink(root, { harness: 'codex' }, env, quiet);
  const before = fs.readFileSync(agent, 'utf8');
  assert.equal(fs.lstatSync(agent).isFile(), true);
  fs.appendFileSync(path.join(root, 'canonical/roles/developer.md'), '\nUpdated developer rule.\n');
  generateAndLink(root, { harness: 'opencode' }, env, quiet);
  assert.equal(fs.readFileSync(agent, 'utf8'), before);
  generateAndLink(root, { harness: 'codex', dryRun: true }, env, quiet);
  assert.equal(fs.readFileSync(agent, 'utf8'), before);
  generateAndLink(root, { harness: 'codex' }, env, quiet);
  assert.match(TOML.parse(fs.readFileSync(agent, 'utf8')).developer_instructions, /Updated developer rule/);
  const edited = fs.readFileSync(agent, 'utf8').replace('model = "gpt-6-sol"', 'model = "personal-model"');
  fs.writeFileSync(agent, edited);
  const current = fs.readlinkSync(path.join(root, 'generated/current'));
  assert.throws(() => generateAndLink(root, { harness: 'codex' }, env, quiet), /conflicting destination/);
  assert.equal(fs.readFileSync(agent, 'utf8'), edited);
  assert.equal(fs.readlinkSync(path.join(root, 'generated/current')), current);
  generateAndLink(root, { harness: 'codex', force: true }, env, quiet);
  assert.equal(TOML.parse(fs.readFileSync(agent, 'utf8')).model, 'gpt-6-sol');
});

test('copy ownership requires this checkout and an intact body; preflight catches later edits', t => {
  const { root, env } = fixture(t);
  generateAndLink(root, { harness: 'codex' }, env, quiet);
  const agent = path.join(env.CODEX_AGENTS_DIR, 'oracle.toml');
  const original = fs.readFileSync(agent, 'utf8');
  for (const edited of [original.replace(root, root + '-foreign'), original + '# local edit\n', original.replace('Content-SHA256:', 'Other-hash:')]) {
    fs.writeFileSync(agent, edited);
    assert.throws(() => installation(root, { harness: 'codex' }, env), /conflicting destination/);
    assert.equal(fs.readFileSync(agent, 'utf8'), edited);
  }
  fs.writeFileSync(agent, original);
  const actions = installation(root, { harness: 'codex' }, env);
  fs.appendFileSync(agent, '# changed after preflight\n');
  assert.throws(() => applyInstallation(actions, undefined, quiet), /changed after preflight/);
  assert.match(fs.readFileSync(agent, 'utf8'), /changed after preflight/);
});

test('partial copy installation resumes and optional Librarian uses managed copies', t => {
  const { root, env } = fixture(t);
  const librarian = path.join(root, 'codex/optional/librarian/agents/github_librarian.toml');
  const installed = path.join(env.CODEX_AGENTS_DIR, 'github_librarian.toml');
  symlink(librarian, installed);
  const actions = installation(root, { harness: 'codex', withLibrarian: true }, env);
  let copies = 0;
  assert.throws(() => applyInstallation(actions, action => {
    if (action.operation === 'copy' && ++copies === 2) throw Error('injected copy failure');
  }, quiet), /Installation incomplete.*Changed:.*developer.toml.*Pending:.*developer_luna.toml/s);
  generateAndLink(root, { harness: 'codex', withLibrarian: true }, env, quiet);
  assert.equal(fs.lstatSync(installed).isFile(), true);
  fs.appendFileSync(librarian, '\n# source update\n');
  generateAndLink(root, { harness: 'codex', withLibrarian: true }, env, quiet);
  assert.match(fs.readFileSync(installed, 'utf8'), /source update/);
});
