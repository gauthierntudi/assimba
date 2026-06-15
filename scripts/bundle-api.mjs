import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..');
const serverDist = path.join(monorepoRoot, 'server/dist/app.js');
const apiDir = path.join(monorepoRoot, 'client/api');
const apiBundle = path.join(apiDir, 'index.js');
const apiNodeModules = path.join(apiDir, 'node_modules');

if (!existsSync(serverDist)) {
  throw new Error(`Missing server build at ${serverDist}. Run "npm run build -w server" first.`);
}

rmSync(apiBundle, { force: true });
rmSync(path.join(apiDir, 'index.ts'), { force: true });
rmSync(path.join(apiDir, 'server-dist'), { recursive: true, force: true });
rmSync(apiNodeModules, { recursive: true, force: true });

await esbuild.build({
  entryPoints: [serverDist],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: apiBundle,
  external: ['@prisma/client'],
  logLevel: 'info',
});

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

console.log(`Bundled API to ${apiBundle}`);
console.log(`Prepared Prisma runtime in ${apiNodeModules}`);
