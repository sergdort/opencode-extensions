import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  if (process.argv.length !== 2) throw new Error('Usage: npm run snapshots:update');
  const { render } = await import('./lib/render.mjs');
  const { readTree, writeTree } = await import('./lib/files.mjs');
  const root = fs.realpathSync(fileURLToPath(new URL('..', import.meta.url)));
  const target = path.join(root, 'tests/golden');
  const expected = render(root);
  const previous = readTree(target); // Reject links and special files before changing fixtures.
  writeTree(target, expected);
  for (const name of Object.keys(previous)) {
    if (!Object.hasOwn(expected, name)) fs.unlinkSync(path.join(target, name));
  }
  console.log(`Updated ${Object.keys(expected).length} golden files. Review the diff before committing.`);
} catch (error) {
  console.error(error.code === 'ERR_MODULE_NOT_FOUND' ? 'Missing dependencies. Run npm ci in the repository, then retry.' : error.message);
  process.exitCode = 1;
}
