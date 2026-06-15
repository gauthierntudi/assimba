import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const engineName = 'libquery_engine-rhel-openssl-3.0.x.so.node';

for (const candidate of [
  path.join(apiDir, 'prisma-engine.so'),
  path.join(process.cwd(), 'api/prisma-engine.so'),
  path.join(process.cwd(), 'node_modules/.prisma/client', engineName),
]) {
  if (existsSync(candidate)) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = candidate;
    break;
  }
}
