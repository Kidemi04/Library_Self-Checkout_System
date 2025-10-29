'use client';

import { type ChangeEvent, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  CameraIcon,
  PhotoIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

const CameraScanner = dynamic(() => import('@/app/ui/dashboard/camera-scanner'), { ssr: false });

type CheckOutScanPanelProps = {
  onDetected: (code: string) => void;
};

export default function CheckOutScanPanel({ onDetected }: CheckOutScanPanelProps) {
  const [open, setOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const closeModal = () => {
    setOpen(false);
  };

  const handleDetected = (code: string) => {
    if (!code) return;
    setLastScan(code);
    setStatusMessage(null);
    setErrorMessage(null);
    setOpen(false);
    onDetected(code);
  };

  const handleCameraError = (message: string) => {
    setErrorMessage(message);
  };

  const handleUploadClick = () => {
    setStatusMessage(null);
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  const handleFacingModeToggle = () => {
    setFacingMode((current) => (current === 'environment' ? 'user' : 'environment'));
  };

  const handleUploadChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new BrowserMultiFormatReader();
    const objectUrl = URL.createObjectURL(file);
    setStatusMessage('Processing photo…');

    try {
      const result = await reader.decodeFromImageUrl(objectUrl);
      const text = result.getText();
      if (text) {
        setLastScan(text);
        setStatusMessage(null);
        setErrorMessage(null);
        onDetected(text);
      } else {
        setErrorMessage('No barcode detected in the image.');
        setStatusMessage(null);
      }
    } catch (error) {
      console.error('Unable to decode uploaded image', error);
      setErrorMessage('Unable to read the uploaded image. Try another one.');
      setStatusMessage(null);
    } finally {
      URL.revokeObjectURL(objectUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resetReader = (reader as any).reset;
      if (typeof resetReader === 'function') {
        resetReader.call(reader);
      }
      event.target.value = '';
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-xl border border-swin-charcoal/10 bg-swin-ivory/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setStatusMessage(null);
            setFacingMode('environment');
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-swin-charcoal/20 bg-white px-3 py-2 text-xs font-semibold text-swin-charcoal shadow-sm transition hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <CameraIcon className="h-4 w-4" />
          Scan with camera
        </button>

        <button
          type="button"
          onClick={handleUploadClick}
          className="inline-flex items-center gap-2 rounded-lg border border-swin-charcoal/20 bg-white px-3 py-2 text-xs font-semibold text-swin-charcoal shadow-sm transition hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"        >
          <PhotoIcon className="h-4 w-4" />
          Upload photo
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleUploadChange}
        />

        {lastScan ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-100/60 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-inner">
            <CheckBadgeIcon className="h-4 w-4" />
            Last scan: {lastScan}
          </span>
        ) : null}
      </div>

      {statusMessage ? (
        <p className="text-[11px] font-medium text-swin-charcoal/70">{statusMessage}</p>
      ) : null}

      {errorMessage ? (
        <p className="text-[11px] font-medium text-swin-red">{errorMessage}</p>
      ) : (
        <p className="text-[11px] text-swin-charcoal/60">
          Tip: Align the spine barcode with the box. You can also upload a photo saved from another device.
        </p>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Scan book barcode</h2>
                <p className="mt-1 text-sm text-white/70">
                  Align the code within the frame and hold steady until the scanner confirms a match.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close scanner"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <CameraScanner
                facingMode={facingMode}
                onDetected={handleDetected}
                onError={handleCameraError}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleFacingModeToggle}
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <ArrowsRightLeftIcon className="h-4 w-4" />
                  Switch camera
                </button>
                <p className="text-[11px] text-white/50">
                  Supported formats: QR, EAN-13/8, UPC-A, Code-128, Code-39.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
