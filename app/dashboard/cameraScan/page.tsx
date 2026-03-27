'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

type ScanState = 'idle' | 'scanning' | 'paused';

// Prioritise Code 128 / Code 39 — the formats actually used by the library barcodes.
const NATIVE_FORMATS_FAST = ['code_128', 'code_39'] as const;
const NATIVE_FORMATS_ALL = ['code_128', 'code_39', 'qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e'] as const;

const ZXING_FORMATS_FAST = [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39];
const ZXING_FORMATS_ALL = [
  BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
];

/** Speed-optimised hints for live camera (only Code 128/39, no TRY_HARDER). */
const makeCameraHints = () => {
  const hints = new Map<DecodeHintType, any>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS_FAST);
  return hints;
};

/** Accuracy-optimised hints for uploaded images. */
const makeUploadHints = (tryHarder = true, pureBarcode = false) => {
  const hints = new Map<DecodeHintType, any>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS_ALL);
  if (tryHarder) hints.set(DecodeHintType.TRY_HARDER, true);
  if (pureBarcode) hints.set(DecodeHintType.PURE_BARCODE, true);
  return hints;
};

const hasNativeDetector = () =>
  typeof window !== 'undefined' && 'BarcodeDetector' in window;

/** Resize an image to max `maxDim` px via canvas (also normalises EXIF). Uses PNG to preserve barcode sharpness. */
const resizeImage = async (file: File, maxDim = 1280, contrast = true): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  if (contrast) ctx.filter = 'contrast(1.5)';
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/png'),
  );
};

export default function QrScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [message, setMessage] = useState<string>('');
  const [decoded, setDecoded] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const debugEndRef = useRef<HTMLDivElement | null>(null);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setDebugLog((prev) => [...prev.slice(-80), `[${ts}] ${msg}`]);
  }, []);

  useEffect(() => {
    debugEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debugLog]);

  // ---------- helpers ----------
  const ensureSecureContext = () => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = /^localhost$|^127\.0\.0\.1$/.test(host);
    return (typeof window !== 'undefined' && window.isSecureContext) || isLocal;
  };

  const isUrl = (txt: string) => {
    try {
      const u = new URL(txt);
      return /^https?:/.test(u.protocol);
    } catch {
      return false;
    }
  };

  const stopCamera = useCallback(() => {
    try {
      controlsRef.current?.stop();
    } catch {}
    const video = videoRef.current;
    const stream = (video?.srcObject as MediaStream | null) || null;
    stream?.getTracks().forEach((t) => t.stop());
    if (video) video.srcObject = null;
    controlsRef.current = null;
    setScanState('idle');
    setMessage('');
  }, []);

  const startCamera = useCallback(async () => {
    setDecoded(null);
    setDebugLog([]);
    addLog(`Native BarcodeDetector: ${hasNativeDetector()}`);
    addLog(`UA: ${navigator.userAgent.slice(0, 100)}`);

    if (!ensureSecureContext()) {
      setMessage('Camera requires HTTPS (or localhost). Open this page over https.');
      addLog('ERROR: not a secure context');
      setScanState('idle');
      return;
    }

    // permission pre-check
    try {
      const perm = await (navigator as any).permissions?.query?.({
        name: 'camera' as PermissionName,
      });
      addLog(`Permission state: ${perm?.state ?? 'unknown'}`);
      if (perm && perm.state === 'denied') {
        setMessage('Camera permission is blocked in your browser settings.');
        setScanState('idle');
        return;
      }
    } catch {
      addLog('Permission query not supported');
    }

    setMessage('Requesting camera access...');
    addLog('Requesting getUserMedia...');

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings();
      addLog(`Stream ready: ${settings?.width}x${settings?.height}, device: ${track?.label?.slice(0, 40)}`);
    } catch (err: any) {
      const n = err?.name || '';
      addLog(`getUserMedia FAILED: ${n} - ${err?.message}`);
      setMessage(
        n === 'NotAllowedError'
          ? 'Permission denied. Please allow camera access.'
          : n === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Could not access the camera.'
      );
      setScanState('idle');
      return;
    }

    try {
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      addLog(`Video playing: ${video.videoWidth}x${video.videoHeight}`);

      setScanState('scanning');
      setMessage('Point your camera at a code (QR or barcode).');

      if (hasNativeDetector()) {
        // ---- Native BarcodeDetector path ----
        addLog('Using native BarcodeDetector for live scan');
        const BarcodeDetector = (window as any).BarcodeDetector;
        const detector = new BarcodeDetector({ formats: [...NATIVE_FORMATS_FAST] });

        let stopped = false;
        let tickCount = 0;

        const scanLoop = async () => {
          if (stopped) return;
          tickCount++;
          try {
            if (video.readyState >= 2) {
              const barcodes = await detector.detect(video);
              if (tickCount % 13 === 1) {
                addLog(`[native] tick #${tickCount}, found: ${barcodes.length}`);
              }
              if (barcodes.length > 0 && !stopped) {
                const text = barcodes[0].rawValue;
                const fmt = barcodes[0].format;
                addLog(`[native] DETECTED: "${text}" (${fmt})`);
                setDecoded(text);
                setMessage('Code detected.');
                stopped = true;

                if (isUrl(text)) {
                  stopCamera();
                  window.location.href = text;
                } else {
                  stream?.getTracks().forEach((t) => t.stop());
                  setScanState('paused');
                }
                return;
              }
            }
          } catch (e: any) {
            if (tickCount % 13 === 1) {
              addLog(`[native] tick #${tickCount} error: ${e?.message ?? e}`);
            }
          }
          if (!stopped) {
            setTimeout(scanLoop, 150);
          }
        };

        // Store cleanup
        controlsRef.current = {
          stop: () => { stopped = true; },
        } as IScannerControls;

        scanLoop();
      } else {
        // ---- ZXing fallback path ----
        addLog('Using ZXing for live scan (CODE_128 + CODE_39 only, 100ms)');
        const reader = new BrowserMultiFormatReader(makeCameraHints(), {
          delayBetweenScanAttempts: 100,
        });

        let tickCount = 0;
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          video,
          (result, error) => {
            tickCount++;
            if (result) {
              const text = result.getText().trim();
              addLog(`[zxing] DETECTED: "${text}"`);
              setDecoded(text);
              setMessage('Code detected.');
              controls?.stop();

              if (isUrl(text)) {
                stopCamera();
                window.location.href = text;
              } else {
                controlsRef.current?.stop();
                setScanState('paused');
              }
            }
            // In production builds, error class names get minified (e.g. "e" instead of "NotFoundException")
            // Only log errors that are NOT the expected "not found" scan miss
            if (error && !/NotFoundException|NotFound/i.test(error.name) && error.name.length > 2 && tickCount % 15 === 1) {
              addLog(`[zxing] error: ${error.name} - ${error.message?.slice(0, 60)}`);
            }
            if (tickCount % 15 === 1) {
              addLog(`[zxing] tick #${tickCount}, scanning...`);
            }
          },
        );

        controlsRef.current = controls;
        addLog('[zxing] decodeFromConstraints attached');
      }
    } catch (e: any) {
      addLog(`Scanner start FAILED: ${e?.message ?? e}`);
      stream?.getTracks().forEach((t) => t.stop());
      const video = videoRef.current;
      if (video) video.srcObject = null;
      setScanState('idle');
      setMessage('Failed to start the scanner.');
    }
  }, [stopCamera, addLog]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  /** Try ZXing decode on a blob with given hints. */
  const zxingDecode = useCallback(async (blob: Blob, hints: Map<DecodeHintType, any>, label: string): Promise<string | null> => {
    addLog(`[zxing][${label}] decodeFromImageUrl...`);
    const reader = new BrowserMultiFormatReader(hints);
    const url = URL.createObjectURL(blob);
    try {
      const result = await reader.decodeFromImageUrl(url);
      const text = result.getText().trim();
      addLog(`[zxing][${label}] DETECTED: "${text}"`);
      return text;
    } catch (e: any) {
      addLog(`[zxing][${label}] fail: ${(e?.message ?? e).toString().slice(0, 80)}`);
      return null;
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [addLog]);

  /** Try native BarcodeDetector on a blob. */
  const nativeDecode = useCallback(async (blob: Blob, label: string): Promise<string | null> => {
    if (!hasNativeDetector()) return null;
    try {
      addLog(`[native][${label}] detect()...`);
      const BarcodeDetector = (window as any).BarcodeDetector;
      const detector = new BarcodeDetector({ formats: [...NATIVE_FORMATS_ALL] });
      const bitmap = await createImageBitmap(blob);
      const barcodes = await detector.detect(bitmap);
      bitmap.close();
      if (barcodes.length > 0) {
        const text = barcodes[0].rawValue;
        addLog(`[native][${label}] DETECTED: "${text}" (${barcodes[0].format})`);
        return text;
      }
      addLog(`[native][${label}] 0 barcodes`);
    } catch (e: any) {
      addLog(`[native][${label}] error: ${e?.message ?? e}`);
    }
    return null;
  }, [addLog]);

  const onUpload = useCallback(async (file: File) => {
    setDecoded(null);
    setMessage('Analysing image...');
    addLog(`Upload: ${file.name} (${(file.size / 1024).toFixed(0)}KB, ${file.type})`);

    const origBitmap = await createImageBitmap(file);
    const ow = origBitmap.width, oh = origBitmap.height;
    addLog(`Original: ${ow}x${oh}`);
    origBitmap.close();

    const found = (text: string) => {
      setDecoded(text);
      setMessage('Code detected from image.');
      if (isUrl(text)) window.location.href = text;
    };

    // Strategy 1: Native detector on original
    addLog('--- Strategy 1: native on original ---');
    const t1 = await nativeDecode(file, 'orig');
    if (t1) { found(t1); return; }

    if (!hasNativeDetector()) addLog('[native] BarcodeDetector not available on this device');

    // Strategy 2: ZXing TRY_HARDER on original
    addLog('--- Strategy 2: ZXing TRY_HARDER on original ---');
    const t2 = await zxingDecode(file, makeUploadHints(true, false), 'orig-hard');
    if (t2) { found(t2); return; }

    // Strategy 3: ZXing PURE_BARCODE on original (helps if barcode fills most of image)
    addLog('--- Strategy 3: ZXing PURE_BARCODE on original ---');
    const t3 = await zxingDecode(file, makeUploadHints(true, true), 'orig-pure');
    if (t3) { found(t3); return; }

    // Strategy 4: Resized PNG 1280px with contrast boost
    addLog('--- Strategy 4: resized PNG 1280px + contrast ---');
    try {
      const blob4 = await resizeImage(file, 1280, true);
      const bm4 = await createImageBitmap(blob4);
      addLog(`Resized: ${bm4.width}x${bm4.height} (${(blob4.size / 1024).toFixed(0)}KB)`);
      bm4.close();

      const t4n = await nativeDecode(blob4, 'resize-1280');
      if (t4n) { found(t4n); return; }

      const t4z = await zxingDecode(blob4, makeUploadHints(true, false), 'resize-1280');
      if (t4z) { found(t4z); return; }
    } catch (e: any) {
      addLog(`Resize 1280 failed: ${e?.message ?? e}`);
    }

    // Strategy 5: Smaller resize 800px (different scale may help ZXing row scanner)
    addLog('--- Strategy 5: resized PNG 800px + contrast ---');
    try {
      const blob5 = await resizeImage(file, 800, true);
      const bm5 = await createImageBitmap(blob5);
      addLog(`Resized: ${bm5.width}x${bm5.height} (${(blob5.size / 1024).toFixed(0)}KB)`);
      bm5.close();

      const t5 = await zxingDecode(blob5, makeUploadHints(true, false), 'resize-800');
      if (t5) { found(t5); return; }
    } catch (e: any) {
      addLog(`Resize 800 failed: ${e?.message ?? e}`);
    }

    // Strategy 6: Resize without contrast (in case contrast filter hurts)
    addLog('--- Strategy 6: resized PNG 1280px no contrast ---');
    try {
      const blob6 = await resizeImage(file, 1280, false);
      const t6 = await zxingDecode(blob6, makeUploadHints(true, false), 'resize-nocontrast');
      if (t6) { found(t6); return; }
    } catch (e: any) {
      addLog(`Resize no-contrast failed: ${e?.message ?? e}`);
    }

    setMessage('No code found in that image. Try a clearer, closer photo of the barcode.');
  }, [addLog, nativeDecode, zxingDecode]);

  // ---------- UI ----------
  return (
    <main className="space-y-8">
      <title>Camera Scanner | Dashboard</title>

      <header className="rounded-2xl border border-slate-200 bg-white p-8 text-swin-charcoal shadow-lg shadow-slate-200 transition-colors dark:border-white/10 dark:bg-slate-900 dark:text-white dark:shadow-black/40">
        <h1 className="text-2xl font-semibold">Camera Scanner</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-charcoal/70 dark:text-slate-300">
          Use your camera or upload an image to scan QR codes or barcodes. Links will open automatically.
        </p>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        {/* Preview */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm dark:border-white/10 dark:bg-slate-950">
          <div className="aspect-[4/3] w-full">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
              autoPlay
            />
          </div>

          {/* crosshair */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="h-40 w-40 rounded-2xl border-2 border-white/70 ring-2 ring-swin-red/60" />
          </div>

          {/* status */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2 text-xs text-white">
            {message || (scanState === 'scanning' ? 'Scanning...' : 'Camera idle')}
          </div>
        </div>

        {/* Controls */}
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-swin-charcoal shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900 dark:text-white">
          <h2 className="text-sm font-semibold">Controls</h2>

          <div className="flex flex-wrap gap-2">
            {scanState !== 'scanning' ? (
              <button
                onClick={startCamera}
                className="rounded-xl bg-swin-charcoal px-4 py-2 text-sm font-medium text-swin-ivory shadow transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:bg-white dark:text-slate-900"
              >
                Start camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-white/20 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              >
                Stop camera
              </button>
            )}

            <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-slate-300 dark:border-white/20 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
              Upload image
            </label>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <p className="mb-1 font-semibold">Decoded text</p>
            <p className="break-all">{decoded ?? '...'}</p>
            {decoded && !isUrl(decoded) && (
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                This code is not a URL. Copy the text or try another code.
              </p>
            )}
          </div>

          <ul className="text-xs text-slate-500 dark:text-slate-400">
            <li>- Works on HTTPS or on localhost.</li>
            <li>- Allow camera permission when prompted.</li>
            <li>- You can also upload a photo or screenshot of a QR code or barcode.</li>
          </ul>
        </aside>
      </section>

      {/* Debug Log Panel */}
      <section className="mx-auto max-w-5xl">
        <details open className="rounded-2xl border border-yellow-500/30 bg-yellow-50 p-4 dark:bg-yellow-500/5">
          <summary className="cursor-pointer text-sm font-semibold text-yellow-700 dark:text-yellow-400">
            Debug Log ({debugLog.length})
          </summary>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-green-400">
            {debugLog.length === 0 ? (
              <p className="text-white/30">Click &quot;Start camera&quot; or &quot;Upload image&quot; to see logs...</p>
            ) : (
              debugLog.map((line, i) => (
                <p key={i} className="break-all">{line}</p>
              ))
            )}
            <div ref={debugEndRef} />
          </div>
        </details>
      </section>
    </main>
  );
}
