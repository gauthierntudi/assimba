import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const engineName = 'libquery_engine-rhel-openssl-3.0.x.so.node';

const candidates = [
  path.join(here, 'prisma-engine.so'),
  path.join(here, 'node_modules/.prisma/client', engineName),
  path.join(here, 'api/node_modules/.prisma/client', engineName),
  path.join(process.cwd(), 'api/prisma-engine.so'),
  path.join(process.cwd(), 'api/node_modules/.prisma/client', engineName),
  path.join(process.cwd(), 'node_modules/.prisma/client', engineName),
];

for (const candidate of candidates) {
  if (existsSync(candidate)) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = candidate;
    break;
  }
}
