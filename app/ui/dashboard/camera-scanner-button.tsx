'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import {
  CameraIcon,
  XMarkIcon,
  ArrowsRightLeftIcon,
  CheckBadgeIcon,
  PhotoIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { BrowserMultiFormatReader } from '@zxing/browser';

const CameraScanner = dynamic(() => import('@/app/ui/dashboard/camera-scanner'), { ssr: false });

const buildNextUrl = (
  pathname: string | null,
  searchParams: ReturnType<typeof useSearchParams>,
  scannedValue: string,
) => {
  const params = new URLSearchParams(searchParams?.toString() ?? '');
  params.set('q', scannedValue);
  return `${pathname ?? '/dashboard/check-in'}?${params.toString()}`;
};

type CameraScannerButtonProps = {
  onDetected?: (value: string) => void;
  uploadLabel?: string;
  modalTitle?: string;
  modalDescription?: string;
  lastScanPrefix?: string;
  className?: string;
};

type DeviceOption = {
  deviceId: string;
  label: string;
};

const buttonBaseClass =
  'inline-flex h-[48px] items-center justify-center gap-2 rounded-lg border border-swin-charcoal/20 bg-white px-4 text-sm font-semibold text-swin-charcoal shadow-sm transition hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red focus-visible:ring-offset-2 focus-visible:ring-offset-white';

export default function CameraScannerButton({
  onDetected,
  uploadLabel = 'Scan from Photo',
  modalTitle = 'Scan book barcode',
  modalDescription = 'Align the barcode within the frame. We will auto-fill the details once a match is detected.',
  lastScanPrefix = 'Last scan:',
  className,
}: CameraScannerButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<DeviceOption[]>([]);
  const [deviceListError, setDeviceListError] = useState<string | null>(null);
  const [enumeratingDevices, setEnumeratingDevices] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const refreshDeviceOptions = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      setDeviceListError('Camera API is not supported in this browser.');
      setAvailableDevices([]);
      return;
    }

    try {
      setEnumeratingDevices(true);
      setDeviceListError(null);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        }));

      setAvailableDevices(videoInputs);

      if (!videoInputs.length) {
        setDeviceListError('No camera devices detected. Connect a camera or check permissions.');
      }
    } catch (error) {
      console.error('Unable to enumerate camera devices', error);
      setAvailableDevices([]);
      setDeviceListError(
        'Unable to list cameras. Ensure camera permission is granted and try refreshing.',
      );
    } finally {
      setEnumeratingDevices(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void refreshDeviceOptions();
  }, [open, refreshDeviceOptions]);

  const defaultDetectedHandler = useCallback(
    (value: string) => {
      const nextUrl = buildNextUrl(pathname, searchParams, value);
      router.replace(nextUrl, { scroll: false });
      router.refresh();
    },
    [pathname, router, searchParams],
  );

  const handleDetected = useCallback(
    (value: string) => {
      setLastScan(value);
      setOpen(false);
      setStatusMessage(null);

      if (onDetected) {
        onDetected(value);
      } else {
        defaultDetectedHandler(value);
      }
    },
    [defaultDetectedHandler, onDetected],
  );

  const handleOpen = () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleFacingMode = () => {
    if (selectedDeviceId) return;
    setFacingMode((current) => (current === 'environment' ? 'user' : 'environment'));
  };

  const decodeImageFile = async (file: File) => {
    const reader = new BrowserMultiFormatReader();
    const objectUrl = URL.createObjectURL(file);
    setStatusMessage('Processing uploaded image…');
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
        setErrorMessage('No barcode detected. Try a clearer photo or different angle.');
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

  const handleUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await decodeImageFile(file);
    event.target.value = '';
  };

  const deviceOptions = useMemo(() => {
    if (!availableDevices.length) return null;
    return [
      { deviceId: '', label: 'Auto (browser decides best camera)' },
      ...availableDevices,
    ];
  }, [availableDevices]);

  return (
    <>
      <div className={clsx('flex flex-col gap-2', className)}>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
          <button
            type="button"
            onClick={() => {
              phoneInputRef.current?.click();
            }}
            className={clsx(
              buttonBaseClass,
              'w-full justify-center md:hidden xxx-phone-version',
            )}
          >
            <CameraIcon className="h-5 w-5" />
            <span>Scan with Camera</span>
          </button>

          <button
            type="button"
            onClick={handleOpen}
            className={clsx(
              buttonBaseClass,
              'hidden justify-center md:inline-flex xxx-dekstop-version',
            )}
          >
            <CameraIcon className="h-5 w-5" />
            <span>Scan with Camera</span>
          </button>

          <button
            type="button"
            onClick={() => {
              uploadInputRef.current?.click();
            }}
            className={clsx(buttonBaseClass, 'w-full justify-center md:w-auto')}
          >
            <PhotoIcon className="h-5 w-5" />
            <span>{uploadLabel}</span>
          </button>
        </div>

        {lastScan ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-100/60 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-inner">
            <CheckBadgeIcon className="h-4 w-4" />
            <span>
              {lastScanPrefix} {lastScan}
            </span>
          </div>
        ) : null}

        {statusMessage ? (
          <p className="text-[11px] font-medium text-swin-charcoal/70">{statusMessage}</p>
        ) : null}

        {errorMessage ? (
          <p className="text-[11px] font-medium text-swin-red">{errorMessage}</p>
        ) : null}
      </div>

      <input
        ref={phoneInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          void handleUploadChange(event);
        }}
      />

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleUploadChange(event);
        }}
      />

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{modalTitle}</h2>
                <p className="mt-1 text-sm text-white/70">{modalDescription}</p>
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

            <div className="mt-5 space-y-4">
              <CameraScanner
                facingMode={facingMode}
                deviceId={selectedDeviceId || null}
                onDetected={handleDetected}
                onError={(message) => setErrorMessage(message)}
              />

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/80">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                    Camera source
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void refreshDeviceOptions();
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <ArrowPathIcon className={clsx('h-3.5 w-3.5', enumeratingDevices && 'animate-spin')} />
                    Refresh
                  </button>
                </div>

                {deviceOptions ? (
                  <select
                    value={selectedDeviceId}
                    onChange={(event) => {
                      setSelectedDeviceId(event.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-swin-red focus:outline-none"
                  >
                    {deviceOptions.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[11px] text-white/50">
                    {deviceListError ??
                      (enumeratingDevices
                        ? 'Detecting connected cameras…'
                        : 'No cameras found yet. Connect a camera or grant permission and refresh.')}
                  </p>
                )}

                <p className="text-[11px] text-white/50">
                  Supported formats: QR, EAN-13/8, UPC-A, Code-128, Code-39. If the image is blurry, switch
                  cameras or move closer to the barcode.
                </p>
              </div>

              {errorMessage ? (
                <p className="rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200">
                  {errorMessage}
                </p>
              ) : (
                <p className="text-[11px] text-white/50">
                  Tip: If the camera cannot focus, switch cameras or try uploading a photo instead.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
