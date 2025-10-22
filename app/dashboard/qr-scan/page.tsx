'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
// ZXing browser decoder
import { BrowserMultiFormatReader, Result } from '@zxing/browser';

type ScanState = 'idle' | 'scanning' | 'paused';

export default function QrScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const stopStreamRef = useRef<() => void>(() => {});
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [message, setMessage] = useState<string>('');
  const [decoded, setDecoded] = useState<string | null>(null);

  // ---- helpers -------------------------------------------------------------

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
      readerRef.current?.reset();
    } catch {}
    stopStreamRef.current?.();
    setScanState('idle');
  }, []);

  const startCamera = useCallback(async () => {
    setDecoded(null);
    setMessage('Initializing camera…');

    // Create reader once
    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader();
    }

    // Try to pick a back camera on mobile if available
    const devices = await BrowserMultiFormatReader.listVideoInputDevices();
    const backCam =
      devices.find((d) => /back|rear|environment/i.test(d.label)) ??
      devices.at(-1) ??
      devices[0];

    const video = videoRef.current!;
    setScanState('scanning');

    // decodeFromVideoDevice returns a cleanup; keep a manual stop too
    const controls = await readerRef.current.decodeFromVideoDevice(
      backCam?.deviceId,
      video,
      (result: Result | undefined, err: unknown) => {
        if (result) {
          const text = result.getText().trim();
          setDecoded(text);
          setMessage('QR detected.');
          // auto-open URLs
          if (isUrl(text)) {
            stopCamera();
            window.location.href = text;
          } else {
            // Pause camera but keep the frame (user can resume)
            setScanState('paused');
            readerRef.current?.stopContinuousDecode();
          }
        }
      }
    );

    // keep a manual stopper
    stopStreamRef.current = () => {
      try {
        controls?.stop();
      } catch {}
      const s = video.srcObject as MediaStream | null;
      s?.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    };

    setMessage('Point your camera at a QR code.');
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ---- image upload decode -------------------------------------------------

  const onUpload = useCallback(
    async (file: File) => {
      setDecoded(null);
      setMessage('Reading image…');

      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader();
      }

      // Convert File -> object URL (faster than dataURL for ZXing)
      const url = URL.createObjectURL(file);
      try {
        const result = await readerRef.current.decodeFromImageUrl(url);
        const text = result.getText().trim();
        setDecoded(text);
        setMessage('QR detected from image.');
        if (isUrl(text)) {
          window.location.href = text;
        }
      } catch (e: any) {
        setMessage('No QR code found in that image.');
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    []
  );

  // ---- UI -----------------------------------------------------------------

  return (
    <main className="space-y-8">
      <title>QR Scanner | Dashboard</title>

      {/* Header */}
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Scan QR Code</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Use your camera or upload an image to scan a QR code. If the code contains a link,
          you’ll be redirected automatically.
        </p>
      </header>

      {/* Scanner + Actions */}
      <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        {/* Video / Preview */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
          {/* Viewport */}
          <div className="aspect-[4/3] w-full">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
              autoPlay
            />
          </div>

          {/* Overlay crosshair */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="h-40 w-40 rounded-2xl border-2 border-white/70 ring-2 ring-swin-red/60" />
          </div>

          {/* Status bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2 text-xs text-white">
            {message || (scanState === 'scanning' ? 'Scanning…' : 'Camera idle')}
          </div>
        </div>

        {/* Controls + Result */}
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-swin-charcoal">Controls</h2>

          <div className="flex flex-wrap gap-2">
            {scanState !== 'scanning' ? (
              <button
                onClick={startCamera}
                className="rounded-xl bg-swin-charcoal px-4 py-2 text-sm font-medium text-swin-ivory shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-swin-red/50"
              >
                Start camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Stop camera
              </button>
            )}

            <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus-within:ring-2 focus-within:ring-slate-300">
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

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            <p className="mb-1 font-semibold">Decoded text</p>
            <p className="break-all">{decoded ?? '—'}</p>
            {decoded && !isUrl(decoded) && (
              <p className="mt-2 text-slate-500">
                This QR doesn’t look like a link. Copy the text or try another code.
              </p>
            )}
          </div>

          <ul className="text-xs text-slate-500">
            <li>• On mobile, the back camera is selected when available.</li>
            <li>• Grant camera permission when prompted.</li>
            <li>• You can also upload a screenshot/photo of a QR code.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
