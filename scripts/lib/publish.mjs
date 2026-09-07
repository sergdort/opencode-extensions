import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { stat, directory, readTree, writeTree, assertTree, contentHash } from './files.mjs';

export function checkPublicationRoot(root) {
  const generated = path.join(root, 'generated');
  for (const p of [generated, path.join(generated, 'releases')]) {
    if (stat(p) && !stat(p).isDirectory()) throw new Error(`Unsafe generated directory: ${p}`);
  }
  const current = path.join(generated, 'current');
  if (stat(current) && (!stat(current).isSymbolicLink() ||
      !/^releases\/[a-f0-9]{64}$/.test(fs.readlinkSync(current)))) {
    throw new Error(`Refusing unmanaged current pointer: ${current}`);
  }
}

export function withLock(root, action) {
  checkPublicationRoot(root);
  const generated = path.join(root, 'generated');
  directory(generated);
  const lock = path.join(generated, '.lock');
  try { fs.mkdirSync(lock); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    throw new Error(`Generation/link lock exists: ${lock}. Check for a running invocation. Remove this lock manually only after confirming none is active.`);
  }
  try {
    for (const name of fs.readdirSync(generated)) {
      if (name.startsWith('.stage-') || name.startsWith('.current-')) {
        console.warn(`Unpublished temporary entry retained; inspect before manual cleanup: ${path.join(generated, name)}`);
      }
    }
    return action();
  }
  finally { fs.rmdirSync(lock); }
}

// Call only under withLock. Fault injection is used by filesystem tests.
export function publish(root, files, checkpoint = () => {}) {
  checkPublicationRoot(root);
  const generated = path.join(root, 'generated');
  directory(path.join(generated, 'releases'));
  const hash = contentHash(files);
  const target = `releases/${hash}`;
  const release = path.join(generated, target);
  if (stat(release)) assertTree(readTree(release), files);
  else {
    const staging = fs.mkdtempSync(path.join(generated, '.stage-'));
    try {
      writeTree(staging, files);
      assertTree(readTree(staging), files);
      checkpoint('before-release');
      fs.renameSync(staging, release);
    } finally {
      // staging is a unique directory created by this invocation, never a user path.
      if (stat(staging)) fs.rmSync(staging, { recursive: true });
    }
  }
  checkpoint('before-current');
  const current = path.join(generated, 'current');
  if (!stat(current) || fs.readlinkSync(current) !== target) {
    const temporary = path.join(generated, `.current-${randomUUID()}`);
    try {
      fs.symlinkSync(target, temporary);
      fs.renameSync(temporary, current);
    } finally { if (stat(temporary)) fs.unlinkSync(temporary); }
  }
  checkpoint('after-current');
  return hash;
}
