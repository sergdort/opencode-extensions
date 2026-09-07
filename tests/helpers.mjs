import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repository = fs.realpathSync(fileURLToPath(new URL('..', import.meta.url)));

export function fixture(t) {
  const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'agent-generation-test-')));
  t.after(() => fs.rmSync(base, { recursive: true })); // This test owns the entire mkdtemp fixture.
  const root = path.join(base, 'checkout');
  fs.mkdirSync(root);
  for (const name of ['canonical', 'templates', 'skills', 'opencode/agents/librarian', 'opencode/commands/github-librarian.md', 'codex/optional']) {
    fs.cpSync(path.join(repository, name), path.join(root, name), { recursive: true });
  }
  const home = path.join(base, 'home');
  fs.mkdirSync(home);
  const env = { HOME: home, OPENCODE_CONFIG_DIR: path.join(home, 'opencode'), CODEX_SKILLS_DIR: path.join(home, 'skills'),
    CODEX_AGENTS_DIR: path.join(home, 'agents'), AGENTS_SKILLS_DIR: path.join(home, 'skills') };
  return { base, root, env };
}

export function put(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

export function symlink(target, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.symlinkSync(target, destination);
}
