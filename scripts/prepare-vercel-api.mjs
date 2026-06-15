import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const engine = path.join(
  root,
  'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
);
const dest = path.join(root, 'api/prisma-engine.so');

if (!existsSync(engine)) {
  throw new Error(`Missing Prisma Linux engine at ${engine}. Run prisma generate first.`);
}

copyFileSync(engine, dest);
console.log(`Copied Prisma engine to ${dest}`);
