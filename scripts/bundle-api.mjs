import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..');
const serverDist = path.join(monorepoRoot, 'server/dist');
const apiDir = path.join(monorepoRoot, 'client/api');
const apiServerDist = path.join(apiDir, 'server-dist');
const apiNodeModules = path.join(apiDir, 'node_modules');
const prismaEngine = path.join(
  apiNodeModules,
  '.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
);

if (!existsSync(path.join(serverDist, 'app.js'))) {
  throw new Error(`Missing server build at ${serverDist}. Run "npm run build -w server" first.`);
}

rmSync(apiServerDist, { recursive: true, force: true });
rmSync(apiNodeModules, { recursive: true, force: true });

mkdirSync(apiDir, { recursive: true });
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

for (const pkg of ['@prisma/client', '.prisma']) {
  copyPackage(pkg);
}

if (!existsSync(prismaEngine)) {
  throw new Error(`Missing Prisma Linux engine at ${prismaEngine}`);
}

console.log(`Prepared API at ${apiDir}`);
console.log(`Server dist: ${apiServerDist}`);
console.log(`Prisma engine: ${prismaEngine}`);
