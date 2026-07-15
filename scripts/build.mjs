import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
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

const rewriteFoundPaths = (dir) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      rewriteFoundPaths(fullPath);
      continue;
    }

    if (!/\.(html|css|js)$/.test(entry)) {
      continue;
    }

    const source = readFileSync(fullPath, 'utf8');
    const rewritten = source
      .replace(/href="\/(?!found\/)/g, 'href="/found/')
      .replace(/src="\/(?!found\/)/g, 'src="/found/')
      .replace(/url\('\/(?!found\/)/g, "url('/found/")
      .replace(/url\("\/(?!found\/)/g, 'url("/found/')
      .replace(/content="\/(?!found\/)/g, 'content="/found/');

    if (rewritten !== source) {
      writeFileSync(fullPath, rewritten);
    }
  }
};

const rewriteFontPaths = (dir) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      rewriteFontPaths(fullPath);
      continue;
    }

    if (!/\.(html|css|js)$/.test(entry)) {
      continue;
    }

    const source = readFileSync(fullPath, 'utf8');
    const rewritten = source
      .replace(/\/personal_portfolio\/fonts\//g, '/fonts/')
      .replace(/\/works_portfolio\/fonts\//g, '/fonts/');

    if (rewritten !== source) {
      writeFileSync(fullPath, rewritten);
    }
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

  copyDirContents(join(appDir, 'dist'), join(distDir, app));

  if (app === 'found') {
    rewriteFoundPaths(join(distDir, 'found'));
  }
}
