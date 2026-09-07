import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const stat = p => fs.lstatSync(p, { throwIfNoEntry: false });

export function relativeFile(name) {
  if (typeof name !== 'string' || !name || path.isAbsolute(name) || name.includes('\\') ||
      name.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error(`Unsafe relative file: ${name}`);
  }
  return name;
}

export function directory(p) {
  const info = stat(p);
  if (info && !info.isDirectory()) throw new Error(`Expected a real directory, not a link or file: ${p}`);
  if (!info) {
    directory(path.dirname(p));
    fs.mkdirSync(p);
  }
}

export function readTree(root) {
  if (!stat(root)) return {};
  if (!stat(root).isDirectory()) throw new Error(`Expected a real payload directory: ${root}`);
  const result = {};
  function visit(dir, prefix = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
      const name = prefix + entry.name;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(file, name + '/');
      else if (entry.isFile()) result[name] = fs.readFileSync(file, 'utf8');
      else throw new Error(`Unexpected link or special file in payload: ${file}`);
    }
  }
  visit(root);
  return result;
}

export function writeTree(root, files) {
  directory(root);
  for (const name of Object.keys(files).sort()) {
    const destination = path.join(root, relativeFile(name));
    directory(path.dirname(destination));
    if (stat(destination) && !stat(destination).isFile()) throw new Error(`Unsafe output file: ${destination}`);
    fs.writeFileSync(destination, files[name]);
  }
}

export function contentHash(files) {
  // JSON length boundaries prevent ambiguous path/content concatenation.
  return createHash('sha256').update(JSON.stringify(Object.keys(files).sort().map(p => [p, files[p]]))).digest('hex');
}

export function assertTree(actual, expected) {
  const changed = [...new Set([...Object.keys(actual), ...Object.keys(expected)])]
    .sort().filter(p => actual[p] !== expected[p]);
  if (changed.length) throw new Error(`Payload differs: ${changed.join(', ')}`);
}
