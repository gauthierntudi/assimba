import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { monorepoRoot } from './load-env.mjs';

const args = process.argv.slice(2);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant. Vérifiez le fichier .env à la racine du projet.');
  process.exit(1);
}

if (args[0] === 'db' && args[1] === 'push') {
  const prep = spawnSync('node', [path.join(monorepoRoot, 'scripts/prepare-schema-push.mjs')], {
    cwd: monorepoRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (prep.status !== 0) {
    process.exit(prep.status ?? 1);
  }
}

const prismaArgs = ['prisma', ...args, '--schema=../prisma/schema.prisma'];

if (args[0] === 'db' && args[1] === 'push') {
  prismaArgs.push('--accept-data-loss');
}

const result = spawnSync('npx', prismaArgs, {
  cwd: path.join(monorepoRoot, 'server'),
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
