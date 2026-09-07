import path from 'node:path';
import assert from 'node:assert/strict';
import nunjucks from 'nunjucks';
import YAML from 'yaml';
import * as TOML from 'smol-toml';
import { entries, mappings } from '../manifest.mjs';
import { relativeFile } from './files.mjs';

export function frontmatter(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`Missing frontmatter: ${file}`);
  return YAML.parse(match[1]);
}

export function validatePayload(files) {
  for (const [name, text] of Object.entries(files)) {
    relativeFile(name);
    if (!text.trim()) throw new Error(`Empty output: ${name}`);
    if (name.endsWith('.toml')) {
      const obj = TOML.parse(text);
      for (const field of ['name', 'description', 'developer_instructions']) {
        if (typeof obj[field] !== 'string' || !obj[field].trim()) throw new Error(`Missing ${field}: ${name}`);
      }
    } else if (name.endsWith('.yaml')) YAML.parse(text);
    else if (name.endsWith('.json')) JSON.parse(text);
    else if (name.endsWith('/SKILL.md')) {
      const metadata = frontmatter(text, name);
      if (!metadata.name || !metadata.description) throw new Error(`Invalid skill metadata: ${name}`);
      const policyPath = name.replace(/SKILL.md$/, 'agents/openai.yaml');
      if (YAML.parse(files[policyPath] ?? '')?.policy?.allow_implicit_invocation !== false) {
        throw new Error(`Manual-only policy required: ${policyPath}`);
      }
    } else if (/opencode\/(commands|agents)\//.test(name)) {
      if (!frontmatter(text, name)?.description) throw new Error(`Missing description: ${name}`);
    }
  }
}

export function render(root, manifest = entries, nativeMappings = mappings) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(root, { noCache: true }), {
    autoescape: false, throwOnUndefined: true,
  });
  const files = {};
  for (const entry of manifest) {
    relativeFile(entry.output);
    relativeFile(entry.template);
    if (Object.hasOwn(files, entry.output)) throw new Error(`Duplicate output: ${entry.output}`);
    const mapping = nativeMappings[entry.harness];
    for (const group of ['commands', 'roles', 'inputs']) {
      for (const key of Object.keys(mappings.opencode[group])) {
        if (typeof mapping?.[group]?.[key] !== 'string' || !mapping[group][key]) {
          throw new Error(`Missing native mapping: ${entry.harness}.${group}.${key}`);
        }
      }
    }
    const context = { ...mapping, ...entry.context };
    for (const key of entry.required ?? []) {
      if (context[key] === undefined || context[key] === null) throw new Error(`Missing required context: ${entry.output}.${key}`);
    }
    if (entry.metadata) context.frontmatter = YAML.stringify(entry.metadata).trimEnd();
    let text = env.render(entry.template, context).trimEnd() + '\n';
    if (entry.format === 'toml') {
      const obj = { ...entry.metadata, developer_instructions: text };
      text = TOML.stringify(obj);
      assert.deepEqual(TOML.parse(text), obj, `TOML round trip: ${entry.output}`);
    }
    files[entry.output] = text;
  }
  validatePayload(files);
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => a < b ? -1 : 1));
}
