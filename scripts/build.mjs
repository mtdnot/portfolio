import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const routeMap = {
  cycletree_portfolio: 'cycletree',
  personal_portfolio: 'personal_portfolio',
  works_portfolio: 'works',
  'u-aizu_portfolio': 'u-aizu',
  tech_portfolio: 'tech',
};

const run = (command, cwd) => {
  execSync(command, {
    cwd,
    stdio: 'inherit',
  });
};

const copyDirContents = (fromDir, toDir) => {
  mkdirSync(toDir, { recursive: true });

  for (const entry of readdirSync(fromDir)) {
    cpSync(join(fromDir, entry), join(toDir, entry), { recursive: true });
  }
};

const copyFoundToRoot = (fromDir, toDir) => {
  mkdirSync(toDir, { recursive: true });

  for (const entry of readdirSync(fromDir)) {
    if (entry === 'index.html' || entry === 'cycletree') {
      continue;
    }

    cpSync(join(fromDir, entry), join(toDir, entry), { recursive: true });
  }
};

const copyCycletreeArchiveToRoot = (fromDir, toDir) => {
  const archiveDir = join(fromDir, 'archive');

  if (!existsSync(archiveDir)) {
    return;
  }

  cpSync(archiveDir, join(toDir, 'archive'), { recursive: true });
};

const writePagesRoutingFiles = (toDir) => {
  writeFileSync(
    join(toDir, '404.html'),
    '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>404</title></head><body><h1>404</h1></body></html>',
  );

  writeFileSync(
    join(toDir, '_redirects'),
    '/found /404.html 404\n/found/* /404.html 404\n',
  );
};

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

if (existsSync(join(rootDir, 'fonts'))) {
  copyDirContents(join(rootDir, 'fonts'), join(distDir, 'fonts'));
  copyDirContents(join(rootDir, 'fonts'), join(distDir, 'personal_portfolio', 'fonts'));
  copyDirContents(join(rootDir, 'fonts'), join(distDir, 'works', 'fonts'));
}

for (const app of ['cycletree_portfolio', 'personal_portfolio', 'works_portfolio', 'u-aizu_portfolio', 'tech_portfolio', 'found']) {
  const appDir = join(rootDir, app);

  if (!existsSync(join(appDir, 'node_modules'))) {
    run('npm install', appDir);
  }

  run('npm run build', appDir);

  if (app === 'personal_portfolio') {
    copyDirContents(join(appDir, 'dist'), distDir);
  }

  if (app === 'found') {
    copyFoundToRoot(join(appDir, 'dist'), distDir);
    continue;
  }

  copyDirContents(join(appDir, 'dist'), join(distDir, routeMap[app]));

  if (app === 'cycletree_portfolio') {
    copyCycletreeArchiveToRoot(join(appDir, 'dist'), distDir);
  }
}

writePagesRoutingFiles(distDir);
