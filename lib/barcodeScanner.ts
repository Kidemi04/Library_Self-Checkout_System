/**
 * Shared barcode scanning utility using @zxing/browser.
 *
 * Provides two main functions:
 *  - scanImageData(imageData)  – for live camera frames
 *  - scanBlob(blob)            – for uploaded images
 *
 * Falls back to native BarcodeDetector when available (Android Chrome).
 */

import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

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
// @zxing/browser reader
// ---------------------------------------------------------------------------
const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.ITF,
]);
hints.set(DecodeHintType.TRY_HARDER, true);
hints.set(DecodeHintType.ALSO_INVERTED, true);

let zxingReader: BrowserMultiFormatReader | null = null;

function getZxingReader(): BrowserMultiFormatReader {
  if (!zxingReader) {
    zxingReader = new BrowserMultiFormatReader(hints);
  }
  return zxingReader;
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

/** Pre-create the reader. Call on page mount for fastest first scan. */
export async function initScanner(): Promise<void> {
  getZxingReader();
}

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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ScanResult {
  text: string;
  engine: 'native' | 'zxing-browser';
}

/**
 * Scan an ImageData (typically from a canvas / video frame).
 * Tries native BarcodeDetector first, then @zxing/browser.
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

  // 2. @zxing/browser
  try {
    const reader = getZxingReader();
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    const result = reader.decodeFromCanvas(canvas);
    if (result) {
      const text = result.getText().trim();
      if (text) {
        log?.(`[zxing-browser] DETECTED: "${text}" (${result.getBarcodeFormat()})`);
        return { text, engine: 'zxing-browser' };
      }
    }
  } catch {
    // decodeFromCanvas throws NotFoundException when no barcode found — normal
  }

  return null;
}

/**
 * Scan a Blob / File (uploaded image).
 * Tries native BarcodeDetector first, then @zxing/browser.
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

  // 2. @zxing/browser — decode from image element
  try {
    log?.('[zxing-browser] Scanning uploaded image...');
    const reader = getZxingReader();
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });

    const result = await reader.decodeFromImageElement(img);
    URL.revokeObjectURL(url);

    if (result) {
      const text = result.getText().trim();
      if (text) {
        log?.(`[zxing-browser] DETECTED: "${text}" (${result.getBarcodeFormat()})`);
        return { text, engine: 'zxing-browser' };
      }
    }
    log?.('[zxing-browser] No barcode found');
  } catch (e: any) {
    if (e?.name !== 'NotFoundException') {
      log?.(`[zxing-browser] error: ${e?.message ?? e}`);
    } else {
      log?.('[zxing-browser] No barcode found');
    }
  }

  return null;
}
