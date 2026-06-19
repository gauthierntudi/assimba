import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

let resvgInitPromise: Promise<void> | null = null;

function resolveResvgWasmPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), 'api/assets/resvg/index_bg.wasm'),
    path.resolve(process.cwd(), 'assets/resvg/index_bg.wasm'),
    path.resolve(here, '../../assets/resvg/index_bg.wasm'),
    (() => {
      try {
        return require.resolve('@resvg/resvg-wasm/index_bg.wasm');
      } catch {
        return '';
      }
    })(),
    path.resolve(process.cwd(), 'node_modules/@resvg/resvg-wasm/index_bg.wasm'),
    path.resolve(process.cwd(), 'api/node_modules/@resvg/resvg-wasm/index_bg.wasm'),
  ];

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Module WASM resvg introuvable.');
}

async function ensureResvgReady(): Promise<void> {
  if (resvgInitPromise) {
    return resvgInitPromise;
  }

  resvgInitPromise = (async () => {
    const { initWasm } = await import('@resvg/resvg-wasm');
    const wasm = await readFile(resolveResvgWasmPath());

    try {
      await initWasm(wasm);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Already initialized')) {
        return;
      }
      throw error;
    }
  })();

  return resvgInitPromise;
}

export async function renderSvgToPng(svg: string, width: number): Promise<Buffer> {
  await ensureResvgReady();
  const { Resvg } = await import('@resvg/resvg-wasm');
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });

  return Buffer.from(resvg.render().asPng());
}
