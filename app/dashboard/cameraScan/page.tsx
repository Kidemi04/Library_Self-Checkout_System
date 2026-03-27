'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

type ScanState = 'idle' | 'scanning' | 'paused';

const NATIVE_FORMATS = [
  'ean_13', 'ean_8', 'upc_a', 'upc_e',
  'code_128', 'code_39', 'qr_code',
] as const;

const ZXING_FORMATS = [
  BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
  BarcodeFormat.QR_CODE,
];

const makeZxingHints = () => {
  const hints = new Map<DecodeHintType, any>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return hints;
};

const hasNativeDetector = () =>
  typeof window !== 'undefined' && 'BarcodeDetector' in window;

/** Resize an image to max `maxDim` px via canvas (also normalises EXIF). Uses PNG to preserve barcode sharpness. */
const resizeImage = async (file: File, maxDim = 1280): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
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
        const detector = new BarcodeDetector({ formats: [...NATIVE_FORMATS] });

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
        addLog('Using ZXing for live scan');
        const reader = new BrowserMultiFormatReader(makeZxingHints(), {
          delayBetweenScanAttempts: 200,
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

  /** Try to decode a blob with native + ZXing. Returns decoded text or null. */
  const tryDecodeBlob = useCallback(async (blob: Blob, label: string): Promise<string | null> => {
    // Try native BarcodeDetector
    if (hasNativeDetector()) {
      try {
        addLog(`[native][${label}] Trying BarcodeDetector.detect()...`);
        const BarcodeDetector = (window as any).BarcodeDetector;
        const detector = new BarcodeDetector({ formats: [...NATIVE_FORMATS] });
        const bitmap = await createImageBitmap(blob);
        const barcodes = await detector.detect(bitmap);
        bitmap.close();
        addLog(`[native][${label}] Result: ${barcodes.length} barcode(s)`);
        if (barcodes.length > 0) {
          const text = barcodes[0].rawValue;
          addLog(`[native][${label}] DETECTED: "${text}" (${barcodes[0].format})`);
          return text;
        }
      } catch (e: any) {
        addLog(`[native][${label}] Error: ${e?.message ?? e}`);
      }
    } else if (label === 'original') {
      addLog('[native] BarcodeDetector not available');
    }

    // ZXing fallback
    addLog(`[zxing][${label}] Trying decodeFromImageUrl...`);
    const reader = new BrowserMultiFormatReader(makeZxingHints());
    const url = URL.createObjectURL(blob);
    try {
      const result = await reader.decodeFromImageUrl(url);
      const text = result.getText().trim();
      addLog(`[zxing][${label}] DETECTED: "${text}"`);
      return text;
    } catch (e: any) {
      addLog(`[zxing][${label}] Error: ${e?.message ?? e}`);
      return null;
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [addLog]);

  const onUpload = useCallback(async (file: File) => {
    setDecoded(null);
    setMessage('Reading image...');
    addLog(`Upload: ${file.name} (${(file.size / 1024).toFixed(0)}KB, ${file.type})`);

    const origBitmap = await createImageBitmap(file);
    addLog(`Original: ${origBitmap.width}x${origBitmap.height}`);
    origBitmap.close();

    // 1) Try original file first (best quality, no compression artifacts)
    addLog('--- Attempt 1: original file ---');
    const text1 = await tryDecodeBlob(file, 'original');
    if (text1) {
      setDecoded(text1);
      setMessage('Code detected from image.');
      if (isUrl(text1)) window.location.href = text1;
      return;
    }

    // 2) Try resized PNG (fixes EXIF orientation, smaller canvas)
    addLog('--- Attempt 2: resized PNG ---');
    try {
      const resizedBlob = await resizeImage(file, 1280);
      const resizedBitmap = await createImageBitmap(resizedBlob);
      addLog(`Resized: ${resizedBitmap.width}x${resizedBitmap.height} (${(resizedBlob.size / 1024).toFixed(0)}KB)`);
      resizedBitmap.close();

      const text2 = await tryDecodeBlob(resizedBlob, 'resized');
      if (text2) {
        setDecoded(text2);
        setMessage('Code detected from image.');
        if (isUrl(text2)) window.location.href = text2;
        return;
      }
    } catch (e: any) {
      addLog(`Resize failed: ${e?.message ?? e}`);
    }

    setMessage('No code found in that image. Try taking a clearer photo.');
  }, [addLog, tryDecodeBlob]);

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
