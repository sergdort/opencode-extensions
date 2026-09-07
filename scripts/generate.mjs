import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

try {
  if (process.argv.length !== 2) throw new Error('Usage: npm run generate');
  const { render } = await import('./lib/render.mjs');
  const { withLock, publish } = await import('./lib/publish.mjs');
  const root = fs.realpathSync(fileURLToPath(new URL('..', import.meta.url)));
  const hash = withLock(root, () => publish(root, render(root)));
  console.log(`Generated both harnesses: ${hash}`);
  console.log('Restart OpenCode and reload Codex if linked to this checkout.');
} catch (error) {
  console.error(error.code === 'ERR_MODULE_NOT_FOUND' ? 'Missing dependencies. Run npm ci in the repository, then retry.' : error.message);
  process.exitCode = 1;
}
