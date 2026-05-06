'use client';

import { useEffect, useRef, useState } from 'react';
import { scanImageData } from '@/lib/barcodeScanner';

type CameraScannerProps = {
  onDetected: (value: string) => void;
  onError?: (message: string) => void;
  onDebugLog?: (msg: string) => void;
  facingMode: 'environment' | 'user';
  deviceId?: string | null;
};

export default function CameraScanner({ onDetected, onError, facingMode, deviceId, onDebugLog }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onDetectedRef = useRef(onDetected);
  const onErrorRef = useRef(onError);
  const onDebugLogRef = useRef(onDebugLog);
  const [status, setStatus] = useState('Requesting camera access…');

  useEffect(() => { onDetectedRef.current = onDetected; });
  useEffect(() => { onErrorRef.current = onError; });
  useEffect(() => { onDebugLogRef.current = onDebugLog; });

  const log = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    onDebugLogRef.current?.(`[${ts}] ${msg}`);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return undefined;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const message = 'Camera access is not supported in this browser.';
      setStatus(message);
      onErrorRef.current?.(message);
      log('ERROR: no getUserMedia support');
      return undefined;
    }

    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('autoplay', 'true');
    videoElement.muted = true;

    let stopped = false;
    let streamRef: MediaStream | null = null;
    let scanTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
    };

    log(`deviceId=${deviceId ?? 'null'}, facingMode=${facingMode}`);

    const startScanner = async () => {
      try {
        setStatus('Initialising camera…');

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef = stream;
        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings();
        log(`Stream ready: ${settings?.width}x${settings?.height}, device: ${track?.label?.slice(0, 40)}`);

        videoElement.srcObject = stream;
        try {
          await videoElement.play();
        } catch (err: any) {
          if (err?.name === 'AbortError') return; // benign: srcObject replaced before play resolved
          throw err;
        }
        log(`Video playing: ${videoElement.videoWidth}x${videoElement.videoHeight}`);

        setStatus('Align the barcode within the frame.');

        // Create offscreen canvas for frame extraction
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;

        let tickCount = 0;
        const SCAN_INTERVAL_MS = 100; // ~10 fps scan rate

        const scanLoop = async () => {
          if (stopped) return;
          tickCount++;

          try {
            if (videoElement.readyState >= 2) {
              const vw = videoElement.videoWidth;
              const vh = videoElement.videoHeight;

              if (vw > 0 && vh > 0) {
                // Keep full resolution — 1D barcodes (EAN-13, CODE-128) need fine pixel detail
                const scale = Math.min(1, 1280 / Math.max(vw, vh));
                const cw = Math.round(vw * scale);
                const ch = Math.round(vh * scale);
                canvas.width = cw;
                canvas.height = ch;

                const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
                // Grayscale + boosted contrast helps ZXing decode 1D barcodes reliably
                ctx.filter = 'grayscale(1) contrast(1.5)';
                ctx.drawImage(videoElement, 0, 0, cw, ch);
                ctx.filter = 'none';
                const imageData = ctx.getImageData(0, 0, cw, ch);

                const tickLog = tickCount % 15 === 1
                  ? (msg: string) => log(msg)
                  : undefined;

                const result = await scanImageData(imageData, tickLog);

                if (result && !stopped) {
                  log(`DETECTED: "${result.text}" (engine: ${result.engine})`);
                  setStatus(`Detected ${result.text}`);
                  onDetectedRef.current(result.text);
                  stopped = true;
                  stream.getTracks().forEach((t) => t.stop());
                  return;
                }
              }
            }
          } catch (e: any) {
            if (tickCount % 15 === 1) {
              log(`tick #${tickCount} error: ${e?.message ?? e}`);
            }
          }

          if (!stopped) {
            scanTimeoutId = setTimeout(scanLoop, SCAN_INTERVAL_MS);
          }
        };

        if (tickCount % 15 === 0) {
          log('Starting scan loop (zxing-browser + native fallback)');
        }
        scanLoop();
      } catch (error: any) {
        const msg = error?.message ?? String(error);
        log(`FATAL: ${msg}`);
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
      if (scanTimeoutId) clearTimeout(scanTimeoutId);
      streamRef?.getTracks().forEach((t) => t.stop());
      if (videoElement.srcObject) {
        (videoElement.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
        videoElement.srcObject = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, facingMode]);

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-cover"
        autoPlay
        muted
        playsInline
      />
      {/* Status (only shown until stream starts) */}
      {status && !status.toLowerCase().includes('align') && (
        <p className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
          {status}
        </p>
      )}
    </div>
  );
}
