import { cpSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..');
const serverDist = path.join(monorepoRoot, 'server/dist');
const apiServerDist = path.join(monorepoRoot, 'client/api/server-dist');

if (!existsSync(serverDist)) {
  throw new Error(`Missing server build at ${serverDist}. Run "npm run build -w server" first.`);
}

rmSync(apiServerDist, { recursive: true, force: true });
cpSync(serverDist, apiServerDist, { recursive: true });

console.log(`Copied server dist to ${apiServerDist}`);
