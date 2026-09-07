import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const usage = `Usage: link-global.sh [--harness both|opencode|codex] [--dry-run] [--force] [--with-review] [--with-librarian]

Generate BOTH core payloads and link the selected harness destinations.
Selection limits link edits, not updates to already-linked generated content.
Run npm ci explicitly first. No dependency installation or config editing occurs.
--force replaces conflicting regular files only, never directories or foreign links.
--with-review links OpenCode review-work (requires an existing read-only review agent).
--with-librarian adds the optional Codex Librarian. OpenCode keeps its existing Librarian links.
Overrides: OPENCODE_CONFIG_DIR, XDG_CONFIG_HOME, AGENTS_SKILLS_DIR,
CODEX_SKILLS_DIR, CODEX_AGENTS_DIR. Restart/reload both already-linked harnesses.`;

try {
  const args = process.argv.slice(2);
  const options = {};
  let help = false;
  while (args.length) {
    const arg = args.shift();
    if (arg === '--harness') options.harness = args.shift();
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--with-review') options.withReview = true;
    else if (arg === '--with-librarian') options.withLibrarian = true;
    else if (['--help', '-h'].includes(arg)) help = true;
    else throw new Error(`Unknown argument: ${arg}\n${usage}`);
    if (arg === '--harness' && !options.harness) throw new Error('Missing --harness value');
  }
  if (help) console.log(usage);
  else {
    const { generateAndLink } = await import('./lib/link.mjs');
    generateAndLink(fs.realpathSync(fileURLToPath(new URL('..', import.meta.url))), options);
  }
} catch (error) {
  console.error(error.code === 'ERR_MODULE_NOT_FOUND' ? 'Missing dependencies. Run npm ci in the repository, then retry.' : error.message);
  process.exitCode = 1;
}
