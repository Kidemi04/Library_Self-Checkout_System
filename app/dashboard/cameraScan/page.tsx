'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

type ScanState = 'idle' | 'scanning' | 'paused';

type LookupBook = {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  classification: string | null;
  publisher: string | null;
  publication_year: string | null;
  available_copies?: number | null;
  total_copies?: number | null;
};

type LookupCopy = {
  id: string;
  barcode: string | null;
  status: string | null;
};

type LookupResponse = {
  code?: string;
  error?: string;
  book?: LookupBook;
  copy?: LookupCopy | null;
};

type LookupState =
  | { status: 'idle' }
  | { status: 'loading'; code: string }
  | {
      status: 'resolved';
      code: string;
      tone: 'success' | 'error';
      message: string;
      payload: LookupResponse | null;
    };

export default function QrScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [message, setMessage] = useState<string>('');
  const [decoded, setDecoded] = useState<string | null>(null);
  const [lookupState, setLookupState] = useState<LookupState>({ status: 'idle' });

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
      controlsRef.current?.stop(); // stop ZXing loop
    } catch {}
    const video = videoRef.current;
    const stream = (video?.srcObject as MediaStream | null) || null;
    stream?.getTracks().forEach((t) => t.stop());
    if (video) video.srcObject = null;
    controlsRef.current = null;
    setScanState('idle');
    setMessage('');
  }, []);

  const lookupBook = useCallback(async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    setLookupState({ status: 'loading', code });
    setMessage(`Looking up ${code}...`);

    try {
      const response = await fetch(`/api/books/lookup?code=${encodeURIComponent(code)}`, {
        cache: 'no-store',
      });
      const payload = (await response.json().catch(() => null)) as LookupResponse | null;

      if (!payload?.book) {
        const errorMessage =
          (response.ok ? null : payload?.error) ?? 'No book matches that code.';
        setLookupState({
          status: 'resolved',
          code,
          tone: 'error',
          message: errorMessage,
          payload,
        });
        setMessage(errorMessage);
        return;
      }

      if (!response.ok) {
        const errorMessage = payload.error ?? 'This title is currently unavailable.';
        setLookupState({
          status: 'resolved',
          code,
          tone: 'error',
          message: errorMessage,
          payload,
        });
        setMessage(errorMessage);
        return;
      }

      const successMessage = payload.copy?.barcode
        ? `Matched copy ${payload.copy.barcode}.`
        : `Matched "${payload.book.title}".`;

      setLookupState({
        status: 'resolved',
        code,
        tone: 'success',
        message: successMessage,
        payload,
      });
      setMessage(successMessage);
    } catch {
      const errorMessage = 'Unable to look up that code right now.';
      setLookupState({
        status: 'resolved',
        code,
        tone: 'error',
        message: errorMessage,
        payload: null,
      });
      setMessage(errorMessage);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setDecoded(null);
    setLookupState({ status: 'idle' });

    if (!ensureSecureContext()) {
      setMessage('Camera requires HTTPS (or localhost). Open this page over https.');
      setScanState('idle');
      return;
    }

    // permission pre-check (best-effort)
    try {
      const perm = await (navigator as any).permissions?.query?.({
        name: 'camera' as PermissionName,
      });
      if (perm && perm.state === 'denied') {
        setMessage('Camera permission is blocked in your browser settings.');
        setScanState('idle');
        return;
      }
    } catch {
      /* ignore */
    }

    setMessage('Requesting camera access...');

    // Ask for a stream first (user gesture is required)
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
    } catch (err: any) {
      const n = err?.name || '';
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

      // Prefer the back camera by label when possible
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const backCam =
        devices.find((d) => /back|rear|environment/i.test(d.label)) ??
        devices.at(-1) ??
        devices[0];

      if (!readerRef.current) readerRef.current = new BrowserMultiFormatReader();

      setScanState('scanning');
      setMessage('Point your camera at a code (QR or barcode).');

      const controls = await readerRef.current.decodeFromVideoDevice(
        backCam?.deviceId ?? undefined,
        video,
        (result) => {
          if (!result) return;
          const text = (result as { getText(): string }).getText().trim();
          setDecoded(text);
          setMessage('Code detected.');

          if (isUrl(text)) {
            // Auto-open links
            stopCamera();
            window.location.href = text;
          } else {
            // Pause scanning for non-URL payloads
            controlsRef.current?.stop();
            setScanState('paused');
            void lookupBook(text);
          }
        }
      );

      controlsRef.current = controls;
    } catch {
      // Clean up if ZXing fails to attach
      stream?.getTracks().forEach((t) => t.stop());
      const video = videoRef.current;
      if (video) video.srcObject = null;
      setScanState('idle');
      setMessage('Failed to start the scanner.');
    }
  }, [lookupBook, stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const onUpload = useCallback(async (file: File) => {
    setDecoded(null);
    setLookupState({ status: 'idle' });
    setMessage('Reading image...');
    if (!readerRef.current) readerRef.current = new BrowserMultiFormatReader();

    const url = URL.createObjectURL(file);
    try {
      const result = await readerRef.current.decodeFromImageUrl(url);
      const text = (result as { getText(): string }).getText().trim();
      setDecoded(text);
      setMessage('Code detected from image.');
      if (isUrl(text)) {
        window.location.href = text;
      } else {
        setScanState('paused');
        await lookupBook(text);
      }
    } catch {
      setMessage('No code found in that image.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [lookupBook]);

  const matchedBook = lookupState.status === 'resolved' ? lookupState.payload?.book ?? null : null;
  const matchedCopy = lookupState.status === 'resolved' ? lookupState.payload?.copy ?? null : null;
  const catalogHref = decoded ? `/dashboard/book/items?q=${encodeURIComponent(decoded)}` : '/dashboard/book/items';

  // ---------- UI ----------
  return (
    <main className="space-y-8">
      <title>Camera Scanner | Dashboard</title>

      <header className="rounded-2xl border border-slate-200 bg-white p-8 text-swin-charcoal shadow-lg shadow-slate-200 transition-colors dark:border-white/10 dark:bg-slate-900 dark:text-white dark:shadow-black/40">
        <h1 className="text-2xl font-semibold">Camera Scanner</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-charcoal/70 dark:text-slate-300">
          Scan a QR code, library barcode, or ISBN. Book barcodes will be matched to the catalogue
          automatically, while links still open directly.
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
                Non-URL codes are checked against the library catalogue automatically.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
            <p className="font-semibold">Book lookup</p>

            {lookupState.status === 'loading' ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Looking up {lookupState.code}...
              </p>
            ) : null}

            {lookupState.status === 'resolved' ? (
              <p
                className={clsx(
                  'mt-2 text-xs font-medium',
                  lookupState.tone === 'success'
                    ? 'text-emerald-600 dark:text-emerald-300'
                    : 'text-swin-red dark:text-rose-300',
                )}
              >
                {lookupState.message}
              </p>
            ) : null}

            {matchedBook ? (
              <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{matchedBook.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {matchedBook.author ?? 'Author not provided'}
                  </p>
                </div>

                <dl className="grid gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">ISBN</dt>
                    <dd>{matchedBook.isbn ?? 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Copy barcode</dt>
                    <dd>{matchedCopy?.barcode ?? 'No available copy selected'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Availability</dt>
                    <dd>
                      {(matchedBook.available_copies ?? 0)} of {matchedBook.total_copies ?? 0} copies available
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Classification</dt>
                    <dd>{matchedBook.classification ?? 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Publisher</dt>
                    <dd>{matchedBook.publisher ?? 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 dark:text-slate-400">Year</dt>
                    <dd>{matchedBook.publication_year ?? 'Not provided'}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/book/checkout?bookId=${matchedBook.id}`}
                    className="rounded-lg bg-swin-red px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-swin-red/90"
                  >
                    Open borrow flow
                  </Link>
                  <Link
                    href={matchedCopy?.barcode ? `/dashboard/book/checkin?q=${encodeURIComponent(matchedCopy.barcode)}` : catalogHref}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-white/20 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                  >
                    {matchedCopy?.barcode ? 'Open return flow' : 'Search catalogue'}
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Scan a library barcode or ISBN to load the book details here.
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
    </main>
  );
}
