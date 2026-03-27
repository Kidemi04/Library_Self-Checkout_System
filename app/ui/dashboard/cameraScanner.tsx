'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

type CameraScannerProps = {
  onDetected: (value: string) => void;
  onError?: (message: string) => void;
  facingMode: 'environment' | 'user';
  deviceId?: string | null;
};

export default function CameraScanner({ onDetected, onError, facingMode, deviceId }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onDetectedRef = useRef(onDetected);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState('Requesting camera access…');

  useEffect(() => { onDetectedRef.current = onDetected; });
  useEffect(() => { onErrorRef.current = onError; });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return undefined;

    if (typeof navigator === 'undefined') {
      const message = 'Camera access is not supported in this browser.';
      setStatus(message);
      onErrorRef.current?.(message);
      return undefined;
    }

    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('autoplay', 'true');
    videoElement.muted = true;

    type LegacyGetUserMedia = (
      constraints: MediaStreamConstraints,
      success: (stream: MediaStream) => void,
      error: (err: unknown) => void,
    ) => void;

    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
    ]);
    const reader = new BrowserMultiFormatReader(hints as Map<DecodeHintType, any>, { delayBetweenScanAttempts: 100 });

    let stopped = false;
    const nav = navigator as Navigator & { webkitGetUserMedia?: LegacyGetUserMedia };
    const hasModernApi = typeof nav.mediaDevices?.getUserMedia === 'function';
    const hasLegacyApi = typeof nav.webkitGetUserMedia === 'function';

    if (!hasModernApi && !hasLegacyApi) {
      const message = 'Camera access is not supported in this browser.';
      setStatus(message);
      onErrorRef.current?.(message);
      return undefined;
    }

    setStatus('Initialising camera…');

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceId
        ? {
            deviceId: { exact: deviceId },
            width: { ideal: 640 },
            height: { ideal: 480 },
          }
        : {
            facingMode: { ideal: facingMode },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
    };

    const handleResult = (result: any, error: any, controls?: IScannerControls | null) => {
      if (stopped) return;
      if (controls) {
        controlsRef.current = controls;
      }
      if (result) {
        const text = result.getText();
        setStatus(`Detected ${text}`);
        onDetectedRef.current(text);
        controls?.stop();
        stopped = true;
        return;
      }
      if (error && error.name !== 'NotFoundException') {
        console.error('Scanner error', error);
        const message = 'Unable to read barcode. Adjust the lighting or try again.';
        setStatus(message);
        onErrorRef.current?.(message);
      }
    };

    const startScanner = async () => {
      try {
        if (hasModernApi) {
          await reader
            .decodeFromConstraints(constraints, videoElement, handleResult)
            .then((controls) => {
              if (stopped) {
                controls?.stop();
                return;
              }
              controlsRef.current = controls;
              setStatus('Align the barcode within the frame.');
            });
        } else if (hasLegacyApi) {
          const stream = await new Promise<MediaStream>((resolve, reject) => {
            nav.webkitGetUserMedia?.(constraints, resolve, reject);
          });
          const controls = await reader.decodeFromStream(stream, videoElement, handleResult);
          if (stopped) {
            controls?.stop();
            return;
          }
          controlsRef.current = controls;
          setStatus('Align the barcode within the frame.');
        }
      } catch (error) {
        console.error('Failed to start camera scanner', error);
        const message =
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'Camera permission denied. Allow access and try again.'
            : 'Unable to access the camera. Check permissions or try another device.';
        setStatus(message);
        onErrorRef.current?.(message);
      }
    };

    startScanner();

    return () => {
      stopped = true;
      controlsRef.current?.stop();
    };
  }, [deviceId, facingMode]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/80 shadow-lg shadow-black/40">
        <video
          ref={videoRef}
          className="aspect-[4/3] w-full bg-black object-cover"
          autoPlay
          muted
          playsInline
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-40 w-40 rounded-3xl border-2 border-emerald-300/70 shadow-[0_0_30px_rgba(16,185,129,0.35)]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-xs text-white/80">
          Allow camera access to scan QR codes or barcodes automatically.
        </div>
      </div>
      <p className="text-xs text-slate-200/80">{status}</p>
    </div>
  );
}
