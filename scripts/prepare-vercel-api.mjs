import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDist = path.join(root, 'server/dist');
const apiDir = path.join(root, 'api');
const apiDist = path.join(apiDir, '_dist');
const engine = path.join(
  root,
  'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
);
const engineDest = path.join(apiDir, 'prisma-engine.so');

if (!existsSync(path.join(serverDist, 'lib/prisma.js'))) {
  throw new Error(`Missing server build at ${serverDist}. Run "npm run build -w server" first.`);
}

if (!existsSync(engine)) {
  throw new Error(`Missing Prisma Linux engine at ${engine}. Run prisma generate first.`);
}

rmSync(apiDist, { recursive: true, force: true });
rmSync(path.join(apiDir, 'node_modules'), { recursive: true, force: true });

cpSync(serverDist, apiDist, { recursive: true });
cpSync(path.join(root, 'server/assets'), path.join(apiDir, 'assets'), { recursive: true });
copyFileSync(engine, engineDest);

const resvgWasmSource = path.join(root, 'node_modules/@resvg/resvg-wasm/index_bg.wasm');
const resvgWasmDestDir = path.join(apiDir, 'assets/resvg');
if (!existsSync(resvgWasmSource)) {
  throw new Error(`Missing resvg wasm at ${resvgWasmSource}.`);
}
mkdirSync(resvgWasmDestDir, { recursive: true });
copyFileSync(resvgWasmSource, path.join(resvgWasmDestDir, 'index_bg.wasm'));

console.log(`Prepared API bundle: ${apiDist}`);
