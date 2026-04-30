'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const CameraScanner = dynamic(() => import('@/app/ui/dashboard/cameraScanner'), { ssr: false });

type Props = {
  onResult: (scannedIsbn: string) => void;
  onClose: () => void;
};

/**
 * Camera-scan overlay used inside the Add Book form's ISBN section.
 *
 * Wraps the existing `cameraScanner.tsx` component (the same scanner used by
 * `cameraScannerButton.tsx`) and forwards the first detected value via
 * `onResult`. Falls back gracefully when permission is denied or no camera is
 * available — the user can still close or type the ISBN by hand.
 */
export default function CameraScanModal({ onResult, onClose }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [delivered, setDelivered] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleDetected = useCallback(
    (value: string) => {
      if (delivered) return;
      const trimmed = value.trim();
      if (!trimmed) return;
      setDelivered(true);
      onResult(trimmed);
    },
    [delivered, onResult],
  );

  const handleScanError = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = manualValue.trim();
    if (!trimmed) return;
    handleDetected(trimmed);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-isbn-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black sm:bg-black/85 sm:p-4"
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-dark-canvas text-on-dark sm:h-[640px] sm:max-h-[92vh] sm:max-w-xl sm:rounded-card sm:shadow-[0_4px_16px_rgba(20,20,19,0.08)]">
        {/* Top bar */}
        <header className="relative z-10 flex items-center justify-between gap-3 border-b border-dark-hairline bg-black/30 px-4 py-3 backdrop-blur-sm">
          <h2 id="scan-isbn-title" className="font-display text-title-md font-semibold">
            Scan ISBN
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="rounded-pill border border-dark-hairline bg-dark-surface-card/40 p-2 text-on-dark/80 transition hover:bg-dark-surface-strong hover:text-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </header>

        {/* Viewfinder */}
        <div className="relative flex-1 bg-black">
          <div className="absolute inset-0">
            <CameraScanner
              facingMode="environment"
              deviceId={null}
              onDetected={handleDetected}
              onError={handleScanError}
            />
          </div>

          {/* Aim frame — 4 corner brackets, centered (accent-teal per spec recipe) */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="relative h-[min(62vmin,320px)] w-[min(62vmin,320px)]">
              <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-3xl border-l-[3px] border-t-[3px] border-accent-teal/80" />
              <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-3xl border-r-[3px] border-t-[3px] border-accent-teal/80" />
              <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-3xl border-b-[3px] border-l-[3px] border-accent-teal/80" />
              <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-3xl border-b-[3px] border-r-[3px] border-accent-teal/80" />
            </div>
          </div>

          {/* Helper copy + error */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-6 pb-6 pt-10 text-center">
            <p className="font-mono text-caption-uppercase font-semibold tracking-[2px] text-on-dark/60">
              Point your camera at the book&rsquo;s ISBN barcode
            </p>
            {errorMessage && (
              <p className="pointer-events-auto mx-auto mt-3 inline-block rounded-btn border border-warning/40 bg-warning/10 px-3 py-1.5 font-sans text-body-sm font-medium text-warning">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Bottom action bar */}
        <footer className="relative z-10 flex flex-col gap-2 border-t border-dark-hairline bg-black/40 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setManualOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-pill border border-dark-hairline bg-dark-surface-card/40 px-3 py-1.5 font-sans text-button text-on-dark/80 transition hover:bg-dark-surface-strong hover:text-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PencilSquareIcon className="h-3.5 w-3.5" />
              Type ISBN
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-pill border border-dark-hairline bg-dark-surface-card/40 px-3 py-1.5 font-sans text-button text-on-dark/80 transition hover:bg-dark-surface-strong hover:text-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Cancel
            </button>
          </div>

          {manualOpen && (
            <form
              onSubmit={handleManualSubmit}
              className="flex items-center gap-2 rounded-btn border border-dark-hairline bg-dark-surface-card/40 px-3 py-2"
            >
              <PencilSquareIcon className="h-4 w-4 flex-shrink-0 text-on-dark-soft" />
              <input
                type="text"
                inputMode="numeric"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="Type the ISBN"
                autoComplete="off"
                className="flex-1 border-0 bg-transparent font-sans text-body-sm text-on-dark placeholder:text-on-dark-soft outline-none"
              />
              <button
                type="submit"
                disabled={!manualValue.trim()}
                aria-disabled={!manualValue.trim()}
                className="rounded-btn bg-primary hover:bg-primary-active px-3 py-1.5 font-sans text-button text-on-primary transition disabled:bg-primary-disabled disabled:text-muted disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Use
              </button>
            </form>
          )}
        </footer>
      </div>
    </div>
  );
}
