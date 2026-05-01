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
  // 1D
  'code_128', 'code_39', 'code_93', 'codabar', 'itf',
  'ean_13', 'ean_8', 'upc_a', 'upc_e',
  // 2D
  'qr_code', 'data_matrix', 'pdf417', 'aztec',
] as const;

// ---------------------------------------------------------------------------
// @zxing/browser reader
// ---------------------------------------------------------------------------
const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  // 1D — alphanumeric-capable formats most online generators emit by default
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.CODABAR,
  BarcodeFormat.ITF,
  // 1D — digit-only retail
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  // 2D
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.PDF_417,
  BarcodeFormat.AZTEC,
]);
hints.set(DecodeHintType.TRY_HARDER, true);

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

  // 2. @zxing/browser — pad with a white quiet zone before decoding. The JS
  // port is strict about Code 128 / 1D quiet zones; without ~10% padding many
  // self-generated barcodes (especially when the user holds the barcode close
  // enough to fill the ROI) fail decode despite being valid.
  try {
    const reader = getZxingReader();
    const padX = Math.round(imageData.width * 0.1);
    const padY = Math.round(imageData.height * 0.1);
    const totalW = imageData.width + padX * 2;
    const totalH = imageData.height + padY * 2;

    const canvas = document.createElement('canvas');
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalW, totalH);

    // Stage the imageData onto an inner canvas, then composite with padding.
    const inner = document.createElement('canvas');
    inner.width = imageData.width;
    inner.height = imageData.height;
    inner.getContext('2d')!.putImageData(imageData, 0, 0);
    ctx.drawImage(inner, padX, padY);

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

  // 2. @zxing/browser — try multiple resolutions.
  // ZXing's HybridBinarizer struggles on huge inputs (e.g. iPhone 12MP photos):
  // global threshold gets confused, thin 1D bars lose definition. Sweet spot is
  // ~1500–2000px on the long edge. We try the original size first (in case the
  // image is already small), then progressively downscale on failure.
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });

    const reader = getZxingReader();
    const naturalMax = Math.max(img.naturalWidth, img.naturalHeight);
    log?.(`[zxing-browser] Source image ${img.naturalWidth}×${img.naturalHeight}`);

    // Candidate long-edge sizes, capped at the source. Order matters — start
    // with the size most likely to decode, then widen the search.
    const candidates = [1800, 1200, 2400, 900, naturalMax].filter(
      (s, i, arr) => s <= naturalMax && arr.indexOf(s) === i,
    );

    for (const targetMax of candidates) {
      const scale = targetMax / naturalMax;
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      // Pad the image with a white border to simulate the quiet zone Code 128
      // (and other 1D formats) require. @zxing/browser's JS port is stricter
      // about quiet zones than the Java reference: many self-generated barcodes
      // crop tight to the bars and fail decode without explicit padding.
      const padX = Math.round(w * 0.12);
      const padY = Math.round(h * 0.12);
      const totalW = w + padX * 2;
      const totalH = h + padY * 2;

      const canvas = document.createElement('canvas');
      canvas.width = totalW;
      canvas.height = totalH;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, totalW, totalH);
      ctx.drawImage(img, padX, padY, w, h);

      try {
        const result = reader.decodeFromCanvas(canvas);
        if (result) {
          const text = result.getText().trim();
          if (text) {
            log?.(`[zxing-browser] DETECTED at ${totalW}×${totalH} (padded): "${text}" (${result.getBarcodeFormat()})`);
            return { text, engine: 'zxing-browser' };
          }
        }
      } catch (e: any) {
        // NotFoundException is normal when no barcode at this scale; continue
        if (e?.name && e.name !== 'NotFoundException') {
          log?.(`[zxing-browser] error at ${totalW}×${totalH}: ${e.message ?? e}`);
        }
      }
      log?.(`[zxing-browser] no match at ${totalW}×${totalH} (padded)`);
    }

    log?.('[zxing-browser] No barcode found at any scale');
  } catch (e: any) {
    log?.(`[zxing-browser] error: ${e?.message ?? e}`);
  } finally {
    URL.revokeObjectURL(url);
  }

  return null;
}
