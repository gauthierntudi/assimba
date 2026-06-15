import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDir = path.dirname(fileURLToPath(import.meta.url));

process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(
  apiDir,
  'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
);
