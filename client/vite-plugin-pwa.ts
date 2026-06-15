import type { Plugin } from 'vite';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const CACHE_NAME = 'as-simba-v1';

function collectDistFiles(dir: string, base: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectDistFiles(fullPath, base));
      continue;
    }

    const assetPath = `/${relative(base, fullPath).replace(/\\/g, '/')}`;
    if (assetPath === '/sw.js' || assetPath.endsWith('.map')) {
      continue;
    }

    files.push(assetPath);
  }

  return files;
}

export function asSimbaPwaPlugin(): Plugin {
  return {
    name: 'as-simba-pwa',
    apply: 'build',
    closeBundle() {
      const outDir = join(process.cwd(), 'dist');
      const precache = collectDistFiles(outDir, outDir);

      const serviceWorker = `const CACHE = ${JSON.stringify(CACHE_NAME)};
const PRECACHE = ${JSON.stringify(precache)};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'));
    }),
  );
});
`;

      writeFileSync(join(outDir, 'sw.js'), serviceWorker);
    },
  };
}
