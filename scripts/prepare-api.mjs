import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..');
const serverDist = path.join(monorepoRoot, 'server/dist');
const apiServerDist = path.join(monorepoRoot, 'client/api/server-dist');
const apiNodeModules = path.join(monorepoRoot, 'client/api/node_modules');

if (!existsSync(serverDist)) {
  throw new Error(`Missing server build at ${serverDist}. Run "npm run build -w server" first.`);
}

rmSync(apiServerDist, { recursive: true, force: true });
rmSync(apiNodeModules, { recursive: true, force: true });
cpSync(serverDist, apiServerDist, { recursive: true });

function copyPackage(name) {
  const src = path.join(monorepoRoot, 'node_modules', name);
  const dest = path.join(apiNodeModules, name);
  if (!existsSync(src)) {
    throw new Error(`Missing runtime dependency ${name} at ${src}`);
  }
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
}

for (const pkg of ['@prisma/client', '.prisma', 'express', 'cors', 'dotenv']) {
  copyPackage(pkg);
}

console.log(`Copied server dist to ${apiServerDist}`);
console.log(`Prepared API runtime deps in ${apiNodeModules}`);
