"""Publish one committed revision to Gitee, GitHub and branch-based Pages."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
REMOTES = {
    'origin': 'https://gitee.com/larria/zhiyin-3d-model.git',
    'github': 'https://github.com/larria/Voyah-Courage-3D-Unity.git',
}
ENTRY = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="0;url=./examples/api.html">
<title>岚图知音 3D API 控制台</title></head>
<body><a href="./examples/api.html">进入 3D API 控制台</a></body></html>
'''


def git(*args, cwd=ROOT, env=None, data=None):
    return subprocess.run(['git', *args], cwd=cwd, env=env, input=data,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                          check=True).stdout


def remote_sha(remote, branch):
    rows = git('ls-remote', '--heads', remote, f'refs/heads/{branch}').decode().splitlines()
    return rows[0].split()[0] if rows else None


def export_site(revision, destination):
    manifest = json.loads(git('show', f'{revision}:offline-manifest.json'))
    seen = set()
    for item in manifest['files']:
        name = item['path']
        path = PurePosixPath(name)
        if path.is_absolute() or '..' in path.parts or name in seen:
            raise ValueError(f'Invalid manifest path: {name}')
        seen.add(name)
        content = git('show', f'{revision}:{name}')
        if len(content) != item['bytes'] or hashlib.sha256(content).hexdigest() != item['sha256']:
            raise ValueError(f'Manifest mismatch: {name}')
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
    if not {'examples/api.html', 'components/car-player.js', 'components/charging-controls.js', 'unity-player/Build/ZY.wasm'} <= seen:
        raise ValueError('Manifest is missing required entry files')
    (destination / 'index.html').write_text(ENTRY, encoding='utf-8')
    (destination / '.nojekyll').touch()
    (destination / 'source-revision.json').write_text(
        json.dumps({'source': revision}, indent=2) + '\n', encoding='utf-8')
    print(f'Validated {len(seen)} files; site: {destination}', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--revision', default='HEAD')
    parser.add_argument('--preview', metavar='DIRECTORY', help='Export committed site without pushing')
    parser.add_argument('--publish', action='store_true', help='Push all three targets')
    args = parser.parse_args()
    if bool(args.preview) == args.publish:
        parser.error('Choose exactly one of --preview or --publish')
    revision = git('rev-parse', '--verify', f'{args.revision}^{{commit}}').decode().strip()
    if args.preview:
        destination = Path(args.preview).resolve()
        if ROOT not in destination.parents:
            raise ValueError('Preview must be inside the project')
        if destination.exists():
            raise ValueError('Preview directory already exists; choose a new path')
        destination.mkdir(parents=True)
        export_site(revision, destination)
        return
    if git('status', '--porcelain').strip():
        raise ValueError('Commit changes before publishing; working tree must be clean')
    for remote, url in REMOTES.items():
        if git('remote', 'get-url', remote).decode().strip() != url:
            raise ValueError(f'Unexpected remote URL: {remote}')
        if git('remote', 'get-url', '--push', remote).decode().strip() != url:
            raise ValueError(f'Unexpected push URL: {remote}')
    # Check source ancestry before any outward-facing write.
    for remote in REMOTES:
        tip = remote_sha(remote, 'main')
        if tip:
            git('fetch', '--no-tags', remote, 'refs/heads/main')
            fetched = git('rev-parse', 'FETCH_HEAD').decode().strip()
            git('merge-base', '--is-ancestor', fetched, revision)
    parent = remote_sha('github', 'gh-pages')
    if parent:
        git('fetch', '--no-tags', 'github', 'refs/heads/gh-pages')
        parent = git('rev-parse', 'FETCH_HEAD').decode().strip()
    base = ROOT / '.publish'
    base.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=base) as temporary:
        temporary = Path(temporary)
        site = temporary / 'site'
        site.mkdir()
        export_site(revision, site)
        env = os.environ.copy()
        env['GIT_DIR'] = git('rev-parse', '--absolute-git-dir').decode().strip()
        env['GIT_WORK_TREE'] = str(site)
        env['GIT_INDEX_FILE'] = str(temporary / 'index')
        git('add', '--all', cwd=site, env=env)
        tree = git('write-tree', cwd=site, env=env).decode().strip()
        if parent and git('rev-parse', f'{parent}^{{tree}}').decode().strip() == tree:
            deployment = parent
        else:
            parents = ['-p', parent] if parent else []
            deployment = git('commit-tree', tree, *parents, data=(
                f'Deploy API console from {revision}\n\n'
                'Co-Authored-By: Claude <noreply@anthropic.com>\n').encode()).decode().strip()
        for remote, branch, sha in [('origin', 'main', revision),
                                    ('github', 'main', revision),
                                    ('github', 'gh-pages', deployment)]:
            print(f'Pushing {remote}/{branch}: {sha}', flush=True)
            git('push', remote, f'{sha}:refs/heads/{branch}')
            if remote_sha(remote, branch) != sha:
                raise ValueError(f'Remote verification failed: {remote}/{branch}')
            print(f'OK {remote}/{branch}: {sha}', flush=True)
    print('All three refs verified. Pages activation/deployment must be checked separately.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, subprocess.CalledProcessError) as error:
        detail = error.stderr.decode(errors='replace') if isinstance(error, subprocess.CalledProcessError) else str(error)
        print(f'Publish stopped: {detail}\nPreviously reported OK targets remain published; retry the same revision.', flush=True)
        raise SystemExit(1)
