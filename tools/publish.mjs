#!/usr/bin/env node
/** Publish one committed revision to Gitee, GitHub and branch-based Pages. */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const REMOTES = new Map([
  ['origin', 'https://gitee.com/larria/zhiyin-3d-model.git'],
  ['github', 'https://github.com/larria/Voyah-Courage-3D-Unity.git'],
]);
function git(args, { cwd = ROOT, env = process.env, input } = {}) {
  const result = spawnSync('git', args, { cwd, env, input, maxBuffer: 256 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString('utf8').trim() || `git ${args[0]} failed (${result.status})`);
  return result.stdout; // Keep binary resources as Buffer throughout export.
}
const text = (args, options) => git(args, options).toString('utf8').trim();
function remoteSha(remote, branch) {
  const rows = text(['ls-remote', '--heads', remote, `refs/heads/${branch}`]);
  return rows ? rows.split(/\s+/)[0] : null;
}
function exportSite(revision, destination) {
  const manifestBytes = git(['show', `${revision}:offline-manifest.json`]);
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  if (!Array.isArray(manifest.files)) throw new Error('Invalid manifest files');
  const seen = new Set();
  for (const item of manifest.files) {
    const name = item.path;
    if (typeof name !== 'string' || !name || name.includes('\\') || name.includes('\0') ||
        path.posix.isAbsolute(name) || name.split('/').some(part => !part || part === '.' || part === '..') ||
        seen.has(name) || ['offline-manifest.json', '.nojekyll', 'source-revision.json'].includes(name)) {
      throw new Error(`Invalid manifest path: ${name}`);
    }
    seen.add(name);
    const content = git(['show', `${revision}:${name}`]);
    if (content.length !== item.bytes || createHash('sha256').update(content).digest('hex') !== item.sha256) {
      throw new Error(`Manifest mismatch: ${name}`);
    }
    const target = path.join(destination, name);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  for (const required of ['index.html', 'examples/api.html', 'components/car-player.js',
    'components/charging-controls.js', 'components/mirror-controls.js', 'unity-player/Build/ZY.wasm']) {
    if (!seen.has(required)) throw new Error(`Manifest is missing required entry files: ${required}`);
  }
  writeFileSync(path.join(destination, 'offline-manifest.json'), manifestBytes);
  writeFileSync(path.join(destination, '.nojekyll'), '');
  writeFileSync(path.join(destination, 'source-revision.json'), `${JSON.stringify({ source: revision }, null, 2)}\n`);
  console.log(`Validated ${seen.size} files; site: ${destination}`);
}
function options(argv) {
  const args = { revision: 'HEAD', preview: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      console.log('Usage: npm run publish -- [--revision REVISION] [--preview DIRECTORY]\nDefault: publish all three targets. Preview exports committed files without pushing.');
      return null;
    }
    if (arg !== '--revision' && arg !== '--preview') throw new Error(`Unknown argument: ${arg}`);
    const value = argv[++i];
    if (!value || value.startsWith('-')) throw new Error(`Missing value for ${arg}`);
    args[arg.slice(2)] = value;
  }
  return args;
}
function previewDestination(value) {
  const destination = path.resolve(ROOT, value);
  const relative = path.relative(ROOT, destination);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('Preview must be inside the project');
  }
  if (existsSync(destination)) throw new Error('Preview directory already exists; choose a new path');
  let ancestor = path.dirname(destination);
  while (!existsSync(ancestor)) ancestor = path.dirname(ancestor);
  const physical = path.relative(ROOT, realpathSync(ancestor));
  if (physical === '..' || physical.startsWith(`..${path.sep}`) || path.isAbsolute(physical)) {
    throw new Error('Preview must be inside the project (including symlink parents)');
  }
  return destination;
}
function main() {
  const args = options(process.argv.slice(2));
  if (!args) return;
  const revision = text(['rev-parse', '--verify', '--end-of-options', `${args.revision}^{commit}`]);
  if (args.preview !== null) {
    const destination = previewDestination(args.preview);
    mkdirSync(destination, { recursive: true });
    try { exportSite(revision, destination); }
    catch (error) { rmSync(destination, { recursive: true, force: true }); throw error; }
    return;
  }
  if (text(['status', '--porcelain'])) throw new Error('Commit changes before publishing; working tree must be clean');
  for (const [remote, url] of REMOTES) {
    if (text(['remote', 'get-url', remote]) !== url) throw new Error(`Unexpected remote URL: ${remote}`);
    if (text(['remote', 'get-url', '--push', remote]) !== url) throw new Error(`Unexpected push URL: ${remote}`);
  }
  // Check source ancestry before any outward-facing write.
  for (const remote of REMOTES.keys()) {
    if (remoteSha(remote, 'main')) {
      git(['fetch', '--no-tags', remote, 'refs/heads/main']);
      git(['merge-base', '--is-ancestor', text(['rev-parse', 'FETCH_HEAD']), revision]);
    }
  }
  let parent = remoteSha('github', 'gh-pages');
  if (parent) {
    git(['fetch', '--no-tags', 'github', 'refs/heads/gh-pages']);
    parent = text(['rev-parse', 'FETCH_HEAD']);
  }
  const base = path.join(ROOT, '.publish');
  mkdirSync(base, { recursive: true });
  const temporary = mkdtempSync(path.join(base, 'deploy-'));
  try {
    const site = path.join(temporary, 'site');
    mkdirSync(site);
    exportSite(revision, site);
    const env = { ...process.env, GIT_DIR: text(['rev-parse', '--absolute-git-dir']),
      GIT_WORK_TREE: site, GIT_INDEX_FILE: path.join(temporary, 'index') };
    const isolated = { cwd: site, env };
    git(['add', '--all'], isolated);
    const tree = text(['write-tree'], isolated);
    const deployment = parent && text(['rev-parse', `${parent}^{tree}`]) === tree ? parent :
      text(['commit-tree', tree, ...(parent ? ['-p', parent] : [])], {
        input: Buffer.from(`Deploy site from ${revision}\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n`),
      });
    for (const [remote, branch, sha] of [['origin', 'main', revision], ['github', 'main', revision], ['github', 'gh-pages', deployment]]) {
      console.log(`Pushing ${remote}/${branch}: ${sha}`);
      git(['push', remote, `${sha}:refs/heads/${branch}`]);
      if (remoteSha(remote, branch) !== sha) throw new Error(`Remote verification failed: ${remote}/${branch}`);
      console.log(`OK ${remote}/${branch}: ${sha}`);
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
  console.log('All three refs verified. Pages activation/deployment must be checked separately.');
}
try { main(); }
catch (error) {
  console.error(`Publish stopped: ${error.message}\nPreviously reported OK targets remain published; retry the same revision.`);
  process.exitCode = 1;
}
