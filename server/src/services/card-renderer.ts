import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

let resvgInitPromise: Promise<void> | null = null;
let cardFontPromise: Promise<Uint8Array> | null = null;

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

function resolveCardFontPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), 'api/assets/fonts/Roboto-Bold.woff2'),
    path.resolve(process.cwd(), 'assets/fonts/Roboto-Bold.woff2'),
    path.resolve(here, '../../assets/fonts/Roboto-Bold.woff2'),
    path.resolve(process.cwd(), 'server/assets/fonts/Roboto-Bold.woff2'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Police Roboto introuvable pour le rendu de carte.');
}

async function loadCardFont(): Promise<Uint8Array> {
  if (cardFontPromise) {
    return cardFontPromise;
  }

  cardFontPromise = readFile(resolveCardFontPath()).then((buffer) => new Uint8Array(buffer));
  return cardFontPromise;
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
  const fontBuffer = await loadCardFont();
  const { Resvg } = await import('@resvg/resvg-wasm');
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
    font: {
      fontBuffers: [fontBuffer],
      defaultFontFamily: 'Roboto',
      sansSerifFamily: 'Roboto',
    },
  });

  return Buffer.from(resvg.render().asPng());
}
