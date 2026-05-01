'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { scanBlob } from '@/lib/barcodeScanner';
import { Button } from '@/app/ui/button';

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

      <header className="rounded-card border border-hairline bg-surface-card p-8 text-ink dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark">
        <h1 className="font-display text-display-lg text-ink tracking-tight dark:text-on-dark">Camera Scanner</h1>
        <p className="mt-2 max-w-2xl font-sans text-body-md text-body dark:text-on-dark/80">
          Use your camera or upload an image to scan QR codes or barcodes. Links will open automatically.
        </p>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        {/* Preview */}
        <div className="relative overflow-hidden rounded-card border border-hairline bg-black dark:border-dark-hairline dark:bg-dark-canvas">
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
            <div className="h-40 w-40 rounded-card border-2 border-on-dark/70 ring-2 ring-accent-teal/60" />
          </div>

          {/* status */}
          <div className="absolute bottom-0 left-0 right-0 bg-ink/60 px-4 py-2 font-sans text-caption text-on-dark">
            {scanState === 'scanning' && (
              <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-accent-teal align-middle" />
            )}
            {message || (scanState === 'scanning' ? 'Scanning...' : 'Camera idle')}
          </div>
        </div>

        {/* Controls */}
        <aside className="space-y-4 rounded-card border border-hairline bg-surface-card p-6 text-ink dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark">
          <h2 className="font-sans text-title-sm text-ink dark:text-on-dark">Controls</h2>

          <div className="flex flex-wrap gap-2">
            {scanState !== 'scanning' ? (
              <Button onClick={startCamera}>Start camera</Button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex h-10 items-center rounded-btn border border-hairline bg-surface-card px-5 font-sans text-button text-ink transition-colors hover:bg-surface-cream-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:bg-dark-surface-strong dark:focus-visible:ring-offset-dark-canvas"
              >
                Stop camera
              </button>
            )}

            <label className="inline-flex h-10 cursor-pointer items-center rounded-btn border border-hairline bg-surface-card px-5 font-sans text-button text-ink transition-colors hover:bg-surface-cream-strong focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-offset-2 focus-within:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:bg-dark-surface-strong dark:focus-within:ring-offset-dark-canvas">
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

          <div className="rounded-btn border border-hairline bg-canvas p-3 font-sans text-body-sm text-body dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark/80">
            <p className="mb-1 font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">Decoded text</p>
            <p className="break-all font-mono text-code text-ink dark:text-on-dark">{decoded ?? '...'}</p>
            {decoded && !isUrl(decoded) && (
              <p className="mt-2 text-muted dark:text-on-dark-soft">
                This code is not a URL. Copy the text or try another code.
              </p>
            )}
          </div>

          <ul className="font-sans text-caption text-muted dark:text-on-dark-soft">
            <li>- Works on HTTPS or on localhost.</li>
            <li>- Allow camera permission when prompted.</li>
            <li>- You can also upload a photo or screenshot of a QR code or barcode.</li>
          </ul>
        </aside>
      </section>

      {/* Debug Log Panel */}
      <section className="mx-auto max-w-5xl">
        <details open className="rounded-card border border-warning/40 bg-warning/5 p-4">
          <summary className="cursor-pointer font-sans text-button text-warning">
            Debug Log ({debugLog.length})
          </summary>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-btn bg-ink p-3 font-mono text-code leading-relaxed text-success dark:bg-dark-canvas">
            {debugLog.length === 0 ? (
              <p className="text-on-dark/30">Click &quot;Start camera&quot; or &quot;Upload image&quot; to see logs...</p>
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
