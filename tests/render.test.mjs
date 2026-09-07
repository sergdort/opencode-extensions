import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import * as TOML from 'smol-toml';
import { render, validatePayload } from '../scripts/lib/render.mjs';
import { entries, mappings } from '../scripts/manifest.mjs';
import { readTree, writeTree, assertTree } from '../scripts/lib/files.mjs';
import { repository, fixture, put } from './helpers.mjs';

const skills = ['architect', 'bro', 'handoff', 'plan-feature', 'review-work', 'start-work'];
const expectedNames = [
  ...['bro', 'handoff', 'plan-feature', 'review-work', 'start-work'].map(n => `opencode/commands/${n}.md`),
  ...['architect', 'developer', 'developer-luna', 'oracle', 'contrarian'].map(n => `opencode/agents/${n}.md`),
  'opencode/ARCHITECT_INSTRUCTIONS.md',
  ...skills.flatMap(n => [`codex/skills/${n}/SKILL.md`, `codex/skills/${n}/agents/openai.yaml`]),
  ...['developer', 'developer_luna', 'oracle', 'contrarian'].map(n => `codex/agents/${n}.toml`),
].sort();

test('complete native inventory, deterministic rendering and policy invariants', () => {
  const files = render(repository);
  assert.deepEqual(Object.keys(files).sort(), expectedNames);
  assert.deepEqual(render(repository), files);
  for (const skill of skills) {
    const key = `codex/skills/${skill}/agents/openai.yaml`;
    assert.equal(YAML.parse(files[key]).policy.allow_implicit_invocation, false);
    for (const broken of [undefined, 'policy: {}\n', 'policy:\n  allow_implicit_invocation: true\n']) {
      const changed = { ...files };
      if (broken === undefined) delete changed[key]; else changed[key] = broken;
      assert.throws(() => validatePayload(changed), /Manual-only policy/);
    }
  }
  for (const name of ['developer', 'developer_luna']) {
    const role = TOML.parse(files[`codex/agents/${name}.toml`]);
    assert.equal(role.name, name);
    assert.match(role.developer_instructions, /task-owned local commits/);
    assert.match(role.developer_instructions, /protected worktree content and index entries/);
    assert.doesNotMatch(role.developer_instructions, /never stage or commit/i);
  }
  const workflow = files['codex/skills/start-work/SKILL.md'];
  assert.match(workflow, /submission review/i);
  assert.match(workflow, /same Developer/);
  assert.match(workflow, /Oracle evidence/);
  assert.doesNotMatch(workflow, /\$decompose|Ticket:|`developer-luna`|\/start-work|\/plan-feature/);
  assert.match(files['codex/skills/review-work/SKILL.md'], /read-only `oracle`/);
});

test('golden files match complete payload; tests never update fixtures', t => {
  const before = readTree(path.join(repository, 'tests/golden'));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-golden-'));
  t.after(() => fs.rmSync(temp, { recursive: true }));
  const output = render(repository);
  writeTree(temp, output);
  try { assertTree(readTree(temp), before); }
  catch (error) {
    const diff = spawnSync('git', ['diff', '--no-index', '--', path.join(repository, 'tests/golden'), temp], { encoding: 'utf8' });
    assert.fail(`${error.message}\n${diff.stdout}\nReview changes, then run npm run snapshots:update explicitly.`);
  }
  assert.deepEqual(readTree(path.join(repository, 'tests/golden')), before);
  assert.throws(() => assertTree({ ...output, unexpected: 'extra' }, before), /differs/);
  const missing = { ...output }; delete missing[expectedNames[0]];
  assert.throws(() => assertTree(missing, before), /differs/);
  assert.throws(() => assertTree({ ...output, [expectedNames[0]]: 'changed' }, before), /differs/);
});

test('missing inputs, unknown values, missing mappings and unsafe outputs fail', t => {
  const { root } = fixture(t);
  const source = path.join(root, 'canonical/utilities/bro.md');
  const body = fs.readFileSync(source, 'utf8');
  fs.unlinkSync(source);
  assert.throws(() => render(root), /bro.md/);
  put(source, body + '\n{{ unknown_required_value }}\n');
  assert.throws(() => render(root), /undefined|null/);
  put(source, body);
  const config = structuredClone(mappings); delete config.codex.roles.bounded;
  assert.throws(() => render(root, entries, config), /Missing native mapping/);
  const bad = structuredClone(entries); bad[0].output = '../escape';
  assert.throws(() => render(root, bad), /Unsafe relative file/);
  assert.throws(() => render(root, [...entries, entries[0]]), /Duplicate output/);
});

test('TOML body round trips and literal Markdown data is not recursively rendered', t => {
  const { root } = fixture(t);
  const literal = 'Quotes: """ and \'\'\'; slashes: \\; dollars: $& $$; braces: {{ literal }}; Unicode: cafe\u0301';
  put(path.join(root, 'templates/literal.njk'), '{{ text }}');
  const files = render(root, [{ harness: 'codex', output: 'codex/agents/literal.toml', template: 'templates/literal.njk',
    format: 'toml', metadata: { name: 'literal', description: 'test' }, context: { text: literal } }]);
  assert.equal(TOML.parse(files['codex/agents/literal.toml']).developer_instructions, literal + '\n');
});
