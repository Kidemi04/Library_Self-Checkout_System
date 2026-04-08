/**
 * Shared barcode scanning utility using zxing-wasm (WebAssembly).
 *
 * Provides two main functions:
 *  - scanImageData(imageData)  – for live camera frames
 *  - scanBlob(blob)            – for uploaded images
 *
 * Falls back to native BarcodeDetector when available (Android Chrome).
 */

import {
  readBarcodes,
  prepareZXingModule,
  getZXingModule,
  type ReaderOptions,
  type ReadResult,
} from 'zxing-wasm/reader';

// ---------------------------------------------------------------------------
// Native BarcodeDetector types (not yet in lib.dom)
// ---------------------------------------------------------------------------
interface NativeBarcodeResult {
  rawValue: string;
  format: string;
}
type BarcodeDetectorCtor = new (opts: { formats: string[] }) => {
  detect: (source: ImageBitmapSource) => Promise<NativeBarcodeResult[]>;
};

const NATIVE_FORMATS = [
  'code_128', 'code_39', 'ean_13', 'ean_8',
  'upc_a', 'upc_e', 'qr_code',
] as const;

// ---------------------------------------------------------------------------
// WASM initialisation
// ---------------------------------------------------------------------------
let wasmReady = false;

function ensureWasm() {
  if (wasmReady) return;
  prepareZXingModule({ fireImmediately: false });
  wasmReady = true;
}

/**
 * Pre-warm the WASM module. Call this as early as possible (e.g. on page mount)
 * so the module is ready by the time the user starts scanning.
 * Returns a promise that resolves when the WASM module is fully loaded.
 */
export async function initScanner(): Promise<void> {
  prepareZXingModule({ fireImmediately: true });
  await getZXingModule();
  wasmReady = true;
}

// ---------------------------------------------------------------------------
// Reader option presets
// ---------------------------------------------------------------------------
/** Fast options for live camera scanning (speed over accuracy). */
const cameraReaderOptions: ReaderOptions = {
  formats: ['Code128', 'Code39'],
  tryHarder: false,
  tryRotate: false,
  tryInvert: false,
  tryDownscale: true,
  maxNumberOfSymbols: 1,
};

/** Thorough options for uploaded images (accuracy over speed). */
const uploadReaderOptions: ReaderOptions = {
  formats: [
    'Code128', 'Code39', 'QRCode',
    'EAN-13', 'EAN-8', 'UPC-A', 'UPC-E',
  ],
  tryHarder: true,
  tryRotate: true,
  tryInvert: true,
  tryDownscale: true,
  maxNumberOfSymbols: 1,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasNativeDetector(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

function getNativeDetector(): BarcodeDetectorCtor | null {
  if (!hasNativeDetector()) return null;
  return (window as any).BarcodeDetector as BarcodeDetectorCtor;
}

function firstText(results: ReadResult[]): string | null {
  for (const r of results) {
    const t = r.text?.trim();
    if (t) return t;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ScanResult {
  text: string;
  engine: 'native' | 'zxing-wasm';
}

/**
 * Scan an ImageData (typically from a canvas / video frame).
 * Tries native BarcodeDetector first, then zxing-wasm.
 */
export async function scanImageData(
  imageData: ImageData,
  log?: (msg: string) => void,
): Promise<ScanResult | null> {
  // 1. Native detector (fast path on Android Chrome)
  const Detector = getNativeDetector();
  if (Detector) {
    try {
      const detector = new Detector({ formats: [...NATIVE_FORMATS] });
      // Native detect() needs an ImageBitmap, not ImageData directly on all
      // platforms, but ImageData is accepted on Chrome. Wrap in bitmap to be safe.
      const bitmap = await createImageBitmap(imageData);
      const results = await detector.detect(bitmap);
      bitmap.close();
      if (results.length > 0) {
        const text = results[0].rawValue;
        log?.(`[native] DETECTED: "${text}" (${results[0].format})`);
        return { text, engine: 'native' };
      }
    } catch (e: any) {
      log?.(`[native] error: ${e?.message ?? e}`);
    }
  }

  // 2. zxing-wasm
  ensureWasm();
  try {
    const results = await readBarcodes(imageData, cameraReaderOptions);
    const text = firstText(results);
    if (text) {
      log?.(`[zxing-wasm] DETECTED: "${text}"`);
      return { text, engine: 'zxing-wasm' };
    }
  } catch (e: any) {
    log?.(`[zxing-wasm] error: ${e?.message ?? e}`);
  }

  return null;
}

/**
 * Scan a Blob / File (uploaded image).
 * Tries native BarcodeDetector first, then zxing-wasm with thorough options.
 */
export async function scanBlob(
  blob: Blob,
  log?: (msg: string) => void,
): Promise<ScanResult | null> {
  // 1. Native detector
  const Detector = getNativeDetector();
  if (Detector) {
    try {
      log?.('[native] Trying detect() on blob...');
      const detector = new Detector({ formats: [...NATIVE_FORMATS] });
      const bitmap = await createImageBitmap(blob);
      const results = await detector.detect(bitmap);
      bitmap.close();
      if (results.length > 0) {
        const text = results[0].rawValue;
        log?.(`[native] DETECTED: "${text}" (${results[0].format})`);
        return { text, engine: 'native' };
      }
      log?.('[native] 0 barcodes found');
    } catch (e: any) {
      log?.(`[native] error: ${e?.message ?? e}`);
    }
  }

  // 2. zxing-wasm — pass the Blob directly (it supports Blob input)
  ensureWasm();
  try {
    log?.('[zxing-wasm] Scanning blob (tryHarder + tryRotate)...');
    const results = await readBarcodes(blob, uploadReaderOptions);
    const text = firstText(results);
    if (text) {
      log?.(`[zxing-wasm] DETECTED: "${text}"`);
      return { text, engine: 'zxing-wasm' };
    }
    log?.('[zxing-wasm] No barcode found');
  } catch (e: any) {
    log?.(`[zxing-wasm] error: ${e?.message ?? e}`);
  }

  return null;
}
