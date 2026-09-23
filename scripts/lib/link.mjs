import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { entries, retired } from '../manifest.mjs';
import { stat, directory } from './files.mjs';
import { render } from './render.mjs';
import { checkPublicationRoot, withLock, publish } from './publish.mjs';

const inside = (parent, child) => child === parent || child.startsWith(parent + path.sep);

// Resolve existing ancestors without creating destination directories.
function physical(p) {
  if (stat(p)) return fs.realpathSync(p);
  const parent = path.dirname(p);
  if (parent === p) return p;
  return path.join(physical(parent), path.basename(p));
}

export function destinationRoot(value, root, home) {
  if (!value || value.startsWith('~') || value.split(/[\\/]/).includes('..')) {
    throw new Error(`Unsafe destination root: ${value}`);
  }
  const resolved = physical(path.resolve(value));
  const forbidden = ['/', physical(home), path.dirname(physical(home)), physical(os.tmpdir())];
  if (forbidden.includes(resolved) || inside(resolved, root) || inside(root, resolved)) {
    throw new Error(`Unsafe destination root: ${value}`);
  }
  if (stat(resolved) && !stat(resolved).isDirectory()) throw new Error(`Destination is not a directory: ${value}`);
  return resolved;
}

function inspectParents(action) {
  let parent = path.dirname(action.destination);
  while (inside(action.base, parent)) {
    if (stat(parent) && !stat(parent).isDirectory()) throw new Error(`Unsafe destination parent: ${parent}`);
    if (parent === action.base) break;
    parent = path.dirname(parent);
  }
}

function identity(p) {
  const info = stat(p);
  if (!info) return 'absent';
  const content = info.isSymbolicLink() ? fs.readlinkSync(p) : info.isFile()
    ? createHash('sha256').update(fs.readFileSync(p)).digest('hex') : 'directory';
  return JSON.stringify([info.dev, info.ino, info.mode, content]);
}

function owned(action) {
  if (!stat(action.destination)?.isSymbolicLink()) return false;
  const target = path.resolve(path.dirname(action.destination), fs.readlinkSync(action.destination));
  return action.owners.some(owner => target === owner || physical(target) === physical(owner));
}

const digest = content => createHash('sha256').update(content).digest('hex');

// Keep ownership and the last installed content hash in TOML comments, not a sidecar.
function managedCopy(source, body) {
  return `# Managed by opencode-extensions
# Source: ${JSON.stringify(source)}
# Content-SHA256: ${digest(body)}

${body}`;
}

function unchangedCopy(action) {
  const text = fs.readFileSync(action.destination, 'utf8');
  const match = /^# Managed by opencode-extensions\n# Source: (.+)\n# Content-SHA256: ([a-f0-9]{64})\n\n([\s\S]*)$/.exec(text);
  return Boolean(match && match[1] === JSON.stringify(action.source) && digest(match[3]) === match[2]);
}

export function installation(root, options = {}, environment = process.env, files = render(root)) {
  const home = environment.HOME || os.homedir();
  const selected = options.harness ?? 'both';
  if (!['both', 'opencode', 'codex'].includes(selected)) throw new Error(`Unknown harness: ${selected}`);
  const oc = selected !== 'codex';
  const cx = selected !== 'opencode';
  const bases = {};
  if (oc) {
    bases.opencode = destinationRoot(environment.OPENCODE_CONFIG_DIR || path.join(environment.XDG_CONFIG_HOME || path.join(home, '.config'), 'opencode'), root, home);
    bases.sharedOpenCode = destinationRoot(environment.AGENTS_SKILLS_DIR || path.join(home, '.agents/skills'), root, home);
  }
  if (cx) {
    bases.skills = destinationRoot(environment.CODEX_SKILLS_DIR || path.join(home, '.agents/skills'), root, home);
    bases.agents = destinationRoot(environment.CODEX_AGENTS_DIR || path.join(home, '.codex/agents'), root, home);
  }
  const actions = new Map();
  function add(base, relative, source, legacy = [], remove = false, body) {
    const destination = path.join(base, relative);
    const owners = [source, ...legacy.map(p => path.join(root, p))];
    const action = { base, destination, source, owners, remove, content: body === undefined ? undefined : managedCopy(source, body) };
    const existing = actions.get(destination);
    if (existing && existing.source !== source) throw new Error(`Conflicting install destinations: ${destination}`);
    actions.set(destination, action);
  }
  for (const entry of entries) {
    if ((entry.harness === 'opencode' && !oc) || (entry.harness === 'codex' && !cx)) continue;
    if (entry.output === 'opencode/commands/review-work.md' && !options.withReview) continue;
    let relative = entry.output.replace(/^(opencode|codex)\//, '');
    let output = entry.output;
    if (relative.endsWith('/agents/openai.yaml')) continue;
    if (relative.endsWith('/SKILL.md')) { relative = relative.replace(/\/SKILL.md$/, ''); output = output.replace(/\/SKILL.md$/, ''); }
    const base = entry.harness === 'opencode' ? bases.opencode : relative.startsWith('skills/') ? bases.skills : bases.agents;
    if (entry.harness === 'codex') relative = relative.replace(/^(skills|agents)\//, '');
    add(base, relative, path.join(root, 'generated/current', output), entry.legacy ? [entry.legacy] : [], false,
      entry.harness === 'codex' && output.startsWith('codex/agents/') ? files[output] : undefined);
  }
  for (const item of retired) {
    if ((item.harness === 'opencode' && !oc) || (item.harness === 'codex' && !cx)) continue;
    const base = item.harness === 'opencode' ? bases.opencode : bases.skills;
    const relative = item.harness === 'opencode' ? item.destination : item.destination.replace(/^skills\//, '');
    add(base, relative, path.join(root, 'generated/current', item.harness, item.destination), [item.legacy], true);
  }
  for (const name of ['show-me', 'grill-me-architecture']) {
    const source = path.join(root, 'skills', name);
    if (!stat(path.join(source, 'SKILL.md'))?.isFile()) throw new Error(`Missing bundled shared skill: ${source}/SKILL.md`);
    if (oc) add(bases.sharedOpenCode, name, source);
    if (cx) add(bases.skills, name, source);
  }
  // Optional-package sources remain independent of generation.
  if (oc) {
    add(bases.opencode, 'agents/github-librarian.md', path.join(root, 'opencode/agents/librarian/agents/github-librarian.md'));
    add(bases.opencode, 'commands/github-librarian.md', path.join(root, 'opencode/commands/github-librarian.md'));
  }
  if (cx && options.withLibrarian) {
    add(bases.skills, 'github-librarian', path.join(root, 'codex/optional/librarian/skills/github-librarian'));
    const source = path.join(root, 'codex/optional/librarian/agents/github_librarian.toml');
    add(bases.agents, 'github_librarian.toml', source, [], false, fs.readFileSync(source, 'utf8'));
  }
  const list = [...actions.values()];
  for (const action of list) {
    for (const other of list) {
      if (action !== other && inside(action.destination, other.destination)) {
        throw new Error(`Overlapping install destinations: ${action.destination} and ${other.destination}`);
      }
    }
    inspectParents(action);
    action.identity = identity(action.destination);
    const info = stat(action.destination);
    const write = action.content === undefined ? 'link' : 'copy';
    if (action.remove) {
      action.operation = !info ? 'skip' : owned(action) ? 'remove' : 'report';
    } else if (!info) action.operation = write;
    else if (owned(action)) {
      const target = path.resolve(path.dirname(action.destination), fs.readlinkSync(action.destination));
      action.operation = write === 'copy' ? 'copy' : target === action.source ? 'current' : 'link';
    } else if (info.isFile() && write === 'copy' && unchangedCopy(action)) {
      action.operation = fs.readFileSync(action.destination, 'utf8') === action.content ? 'current' : 'copy';
    } else if (info.isFile() && options.force) action.operation = write;
    else throw new Error(`Preserve conflicting destination: ${action.destination}. Regular files require --force; directories and foreign links require explicit manual migration.`);
    if (!action.remove && !inside(path.join(root, 'generated/current'), action.source) && !stat(action.source)) {
      throw new Error(`Missing optional source: ${action.source}`);
    }
  }
  return list;
}

export function applyInstallation(actions, checkpoint = () => {}, report = console.log) {
  const changed = [];
  try {
    for (const action of actions) {
      if (action.operation === 'skip') continue;
      inspectParents(action);
      if (identity(action.destination) !== action.identity) throw new Error(`Destination changed after preflight: ${action.destination}`);
      if (action.operation === 'report') { report(`Unmanaged obsolete entry remains; inspect manually: ${action.destination}`); continue; }
      if (action.operation === 'current') { report(`Current: ${action.destination}`); continue; }
      checkpoint(action, changed.length);
      if (action.operation === 'remove') fs.unlinkSync(action.destination);
      else {
        directory(path.dirname(action.destination));
        const temporary = path.join(path.dirname(action.destination), `.agent-link-${randomUUID()}`);
        try {
          if (action.operation === 'copy') fs.writeFileSync(temporary, action.content, { flag: 'wx', mode: 0o600 });
          else fs.symlinkSync(action.source, temporary);
          fs.renameSync(temporary, action.destination);
        } finally { if (stat(temporary)) fs.unlinkSync(temporary); }
      }
      changed.push(action.destination);
      report(`${action.operation === 'remove' ? 'Removed owned obsolete link' : action.operation === 'copy' ? 'Copied' : 'Linked'}: ${action.destination}`);
    }
  } catch (error) {
    const pending = actions.filter(a => ['link', 'copy', 'remove'].includes(a.operation) && !changed.includes(a.destination)).map(a => a.destination);
    throw new Error(`${error.message}\nInstallation incomplete. Changed: ${changed.join(', ') || 'none'}. Pending: ${pending.join(', ') || 'none'}. Rerun before reloading either harness.`);
  }
  return changed;
}

export function generateAndLink(root, options = {}, environment = process.env, report = console.log) {
  root = fs.realpathSync(root);
  const run = () => {
    checkPublicationRoot(root);
    const files = render(root);
    const actions = installation(root, options, environment, files);
    if (options.dryRun) {
      report('Dry run: validate and regenerate BOTH payloads; selection limits global installation edits only.');
      for (const action of actions) report(`${action.operation}: ${action.destination} -> ${action.source}`);
    } else {
      publish(root, files);
      applyInstallation(actions, undefined, report);
    }
    report('Generation updates BOTH payloads. Rerun the Codex helper after source updates to refresh agent copies. Restart OpenCode and reload Codex after installation.');
    return { files, actions };
  };
  // A dry run neither publishes output nor creates a lock or destination directory.
  return options.dryRun ? run() : withLock(root, run);
}
