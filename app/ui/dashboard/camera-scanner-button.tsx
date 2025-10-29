'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CameraIcon, XMarkIcon, ArrowsRightLeftIcon, CheckBadgeIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { BrowserMultiFormatReader } from '@zxing/browser';

const CameraScanner = dynamic(() => import('@/app/ui/dashboard/camera-scanner'), { ssr: false });

const buildNextUrl = (pathname: string, searchParams: ReturnType<typeof useSearchParams>, scannedValue: string) => {
  const params = new URLSearchParams(searchParams?.toString() ?? '');
  params.set('q', scannedValue);
  return `${pathname}?${params.toString()}`;
};

export default function CameraScannerButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleDetected = useCallback(
    (value: string) => {
      setLastScan(value);
      setOpen(false);
      const nextUrl = buildNextUrl(pathname ?? '/dashboard/check-in', searchParams, value);
      router.replace(nextUrl, { scroll: false });
      router.refresh();
    },
    [pathname, router, searchParams],
  );

  const handleOpen = () => {
    setErrorMessage(null);
    setFacingMode('environment');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleFacingMode = () => {
    setFacingMode((current) => (current === 'environment' ? 'user' : 'environment'));
  };

  const decodeImageFile = async (file: File, source: 'camera' | 'gallery') => {
    const reader = new BrowserMultiFormatReader();
    const objectUrl = URL.createObjectURL(file);
    setStatusMessage(source === 'camera' ? 'Processing camera image...' : 'Processing gallery image...');
    setErrorMessage(null);

    try {
      const result = await reader.decodeFromImageUrl(objectUrl);
      const text = result.getText();
      if (text) {
        setLastScan(text);
        setStatusMessage(null);
        handleDetected(text);
      } else {
        setStatusMessage(null);
        setErrorMessage('No barcode detected. Try a clearer photo.');
      }
    } catch (error) {
      console.error('Unable to decode uploaded image', error);
      setStatusMessage(null);
      setErrorMessage('Unable to read that image. Try again with better lighting.');
    } finally {
      URL.revokeObjectURL(objectUrl);
      const resetReader = (reader as unknown as { reset?: () => void }).reset;
      if (typeof resetReader === 'function') {
        resetReader.call(reader);
      }
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file) return;
    await decodeImageFile(file, source);
    event.target.value = '';
  };

  const buttonClass =
    'inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl border border-swin-charcoal/20 bg-swin-ivory px-4 py-3 text-sm font-semibold text-swin-charcoal shadow-sm transition hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red focus-visible:ring-offset-2 focus-visible:ring-offset-swin-ivory sm:w-auto';
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleOpen}
          className={`${buttonClass} hidden md:inline-flex`}
        >
          <CameraIcon className="h-5 w-5" />
          <span>Scan with Camera</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusMessage(null);
            setErrorMessage(null);
            cameraInputRef.current?.click();
          }}
          className={`${buttonClass} md:hidden`}
        >
          <CameraIcon className="h-5 w-5" />
          Use camera
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusMessage(null);
            setErrorMessage(null);
            galleryInputRef.current?.click();
          }}
          className={buttonClass}
        >
          <PhotoIcon className="h-5 w-5" />
          Choose from gallery
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            void handleFileInput(event, 'camera');
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void handleFileInput(event, 'gallery');
          }}
        />
      </div>

      {lastScan ? (
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-100/50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-inner">
        <CheckBadgeIcon className="h-4 w-4" />
          <span>Last scan: {lastScan}</span>
        </div>
      ) : null}


      {statusMessage ? (
        <p className="mt-2 text-[11px] font-medium text-swin-charcoal/70">{statusMessage}</p>
      ) : null}

      {errorMessage ? (
        <p className="mt-1 text-[11px] font-medium text-swin-red">{errorMessage}</p>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Scan book barcode</h2>
                <p className="mt-1 text-sm text-white/70">
                  Align the code within the frame. We'll filter the results automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close scanner"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <CameraScanner
                facingMode={facingMode}
                onDetected={handleDetected}
                onError={(message) => setErrorMessage(message)}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-slate-900 px-3 py-2 text-xs font-semibold text-white/80 shadow-sm transition hover:bg-white/10 hover:text-white"
                >
                  <ArrowsRightLeftIcon className="h-4 w-4" />
                  Switch camera
                </button>
                <p className="text-[11px] text-white/50">
                  Supported formats: QR, EAN-13/8, UPC-A, Code-128, Code-39.
                </p>
                <p className="text-[11px] text-white/50">
                  Tip: On mobile you can also use "Use camera" to open your native camera app.
                </p>
              </div>

              {errorMessage ? (
                <p className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200">
                  {errorMessage}
                </p>
              ) : (
                <p className="text-[11px] text-white/50">
                  Tip: Grant camera permission if prompted. Use manual search when scanning is not available.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}



