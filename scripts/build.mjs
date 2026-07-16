import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');

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
    if (entry === 'index.html') {
      continue;
    }

    cpSync(join(fromDir, entry), join(toDir, entry), { recursive: true });
  }
};

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

if (existsSync(join(rootDir, 'fonts'))) {
  copyDirContents(join(rootDir, 'fonts'), join(distDir, 'fonts'));
  copyDirContents(join(rootDir, 'fonts'), join(distDir, 'personal_portfolio', 'fonts'));
  copyDirContents(join(rootDir, 'fonts'), join(distDir, 'works_portfolio', 'fonts'));
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

  copyDirContents(join(appDir, 'dist'), join(distDir, app));
}
