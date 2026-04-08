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
        await videoElement.play();
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
                // Use a smaller canvas for faster processing in live mode
                const scale = Math.min(1, 800 / Math.max(vw, vh));
                const cw = Math.round(vw * scale);
                const ch = Math.round(vh * scale);
                canvas.width = cw;
                canvas.height = ch;

                const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
                ctx.drawImage(videoElement, 0, 0, cw, ch);
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
