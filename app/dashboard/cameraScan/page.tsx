'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { scanBlob } from '@/lib/barcodeScanner';

type ScanState = 'idle' | 'scanning' | 'paused';

export default function QrScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [message, setMessage] = useState<string>('');
  const [decoded, setDecoded] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const debugEndRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setDebugLog((prev) => [...prev.slice(-80), `[${ts}] ${msg}`]);
  }, []);

  useEffect(() => {
    debugEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debugLog]);

  // ---------- helpers ----------
  const isUrl = (txt: string) => {
    try {
      const u = new URL(txt);
      return /^https?:/.test(u.protocol);
    } catch {
      return false;
    }
  };

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (video) video.srcObject = null;
    setScanState('idle');
    setMessage('');
  }, []);

  const startCamera = useCallback(async () => {
    setDecoded(null);
    setDebugLog([]);

    const hasNative = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    addLog(`Native BarcodeDetector: ${hasNative}`);
    addLog(`UA: ${navigator.userAgent.slice(0, 100)}`);

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

    setMessage('Starting scanner...');
    addLog('Initializing @zxing/browser BrowserMultiFormatReader...');

    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 20, // scan every 20ms (~50 fps)
      });

      setScanState('scanning');
      setMessage('Point your camera at a code (QR or barcode).');
      addLog('Starting continuous decode (20ms interval, 1280x720)...');

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const controls = await reader.decodeFromConstraints(
        constraints,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const text = result.getText().trim();
            if (text) {
              addLog(`DETECTED: "${text}" (format: ${result.getBarcodeFormat()})`);
              setDecoded(text);
              setMessage('Code detected.');

              if (isUrl(text)) {
                stopCamera();
                window.location.href = text;
              } else {
                // Pause scanning but keep preview
                controlsRef.current?.stop();
                controlsRef.current = null;
                setScanState('paused');
              }
            }
          }
          // NotFoundException is expected on frames without barcodes — ignore
        },
      );

      controlsRef.current = controls;
      addLog('Scanner running — waiting for barcode...');
    } catch (e: any) {
      addLog(`Scanner start FAILED: ${e?.message ?? e}`);
      setScanState('idle');
      setMessage(
        e?.name === 'NotAllowedError'
          ? 'Permission denied. Please allow camera access.'
          : e?.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Failed to start the scanner.'
      );
    }
  }, [stopCamera, addLog]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const onUpload = useCallback(async (file: File) => {
    setDecoded(null);
    setMessage('Analysing image...');
    addLog(`Upload: ${file.name} (${(file.size / 1024).toFixed(0)}KB, ${file.type})`);

    try {
      const origBitmap = await createImageBitmap(file);
      addLog(`Image: ${origBitmap.width}x${origBitmap.height}`);
      origBitmap.close();
    } catch { /* ignore */ }

    const result = await scanBlob(file, addLog);
    if (result) {
      addLog(`DETECTED: "${result.text}" (engine: ${result.engine})`);
      setDecoded(result.text);
      setMessage('Code detected from image.');
      if (isUrl(result.text)) window.location.href = result.text;
    } else {
      setMessage('No code found in that image. Try a clearer, closer photo of the barcode.');
    }
  }, [addLog]);

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
