import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

const here = path.dirname(fileURLToPath(import.meta.url));
const engineName = 'libquery_engine-rhel-openssl-3.0.x.so.node';

for (const candidate of [
  path.join(process.cwd(), 'node_modules/.prisma/client', engineName),
  path.join(here, '../node_modules/.prisma/client', engineName),
]) {
  if (existsSync(candidate)) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = candidate;
    break;
  }
}

type ExpressApp = (req: IncomingMessage, res: ServerResponse) => void;

let app: ExpressApp | undefined;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!app) {
    const mod = await import('../server/dist/app.js');
    app = mod.default;
  }

  return app(req, res);
}
