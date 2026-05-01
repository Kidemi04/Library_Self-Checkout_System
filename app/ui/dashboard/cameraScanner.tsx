'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BoltIcon, BoltSlashIcon } from '@heroicons/react/24/outline';
import { scanBlob, scanImageData } from '@/lib/barcodeScanner';

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
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const onDetectedRef = useRef(onDetected);
  const onErrorRef = useRef(onError);
  const onDebugLogRef = useRef(onDebugLog);
  const [status, setStatus] = useState('Requesting camera access…');
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => { onDetectedRef.current = onDetected; });
  useEffect(() => { onErrorRef.current = onError; });
  useEffect(() => { onDebugLogRef.current = onDebugLog; });

  const log = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    onDebugLogRef.current?.(`[${ts}] ${msg}`);
  };

  const toggleTorch = useCallback(async () => {
    const track = trackRef.current;
    if (!track) return;
    const next = !torchOn;
    try {
      await (track as any).applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch (e: any) {
      onDebugLogRef.current?.(`Torch toggle failed: ${e?.message ?? e}`);
    }
  }, [torchOn]);

  // Manual capture fallback. Grabs the full-resolution current frame and runs
  // it through scanBlob (more thorough than the per-tick canvas decode). This
  // is the "tap to scan" workflow real banking apps use when the continuous
  // scan fails — common on iOS Safari where focus/exposure tuning is limited.
  const captureAndScan = useCallback(async () => {
    if (isCapturing) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    setIsCapturing(true);
    setStatus('Captured — analysing…');
    const ts = () => `[${new Date().toLocaleTimeString()}]`;
    onDebugLogRef.current?.(`${ts()} Manual capture: ${w}×${h}`);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(video, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), 'image/jpeg', 0.95),
      );
      if (!blob) {
        onDebugLogRef.current?.(`${ts()} Capture failed: toBlob returned null`);
        setStatus('Capture failed — try again.');
        return;
      }

      const result = await scanBlob(blob, (m) => onDebugLogRef.current?.(`${ts()} ${m}`));
      if (result) {
        onDebugLogRef.current?.(`${ts()} MANUAL DETECTED: "${result.text}" (engine: ${result.engine})`);
        setStatus(`Detected ${result.text}`);
        onDetectedRef.current(result.text);
      } else {
        setStatus('No code found. Hold closer · keep barcode in the frame · tap again.');
        onDebugLogRef.current?.(`${ts()} Manual capture: no code detected`);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

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

    // Request 1080p — many laptop/phone cameras (e.g. Lenovo FHD) deliver more
    // detail when asked, and 1D barcodes benefit linearly from source pixels.
    // Browsers fall back to whatever is supported.
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
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

        // Save track ref so the torch button can call applyConstraints later.
        trackRef.current = track;

        // Try each continuous mode optimistically. iOS Safari often supports
        // continuous AF without advertising focusMode in getCapabilities, so a
        // strict capability check skips it unnecessarily. applyConstraints
        // silently ignores unsupported keys; we then read getSettings() back
        // to see what actually stuck.
        const tryMode = async (mode: string): Promise<string | null> => {
          try {
            await (track as any).applyConstraints({ advanced: [{ [mode]: 'continuous' }] });
            const setting = ((track as any).getSettings?.() ?? {})[mode];
            return setting === 'continuous' ? mode : null;
          } catch {
            return null;
          }
        };
        try {
          const applied = (
            await Promise.all([
              tryMode('focusMode'),
              tryMode('exposureMode'),
              tryMode('whiteBalanceMode'),
            ])
          ).filter(Boolean) as string[];
          log(`Auto modes applied: ${applied.length ? applied.join(', ') : '(none)'}`);

          // Torch support — typically only present on rear phone cameras.
          const caps: any = (track as any)?.getCapabilities?.() ?? {};
          if (caps.torch === true) {
            setTorchSupported(true);
            log('Torch supported');
          }
        } catch (e: any) {
          log(`Camera tuning failed: ${e?.message ?? e}`);
        }

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
                // Center ROI — only the middle band is scanned. Mirrors how
                // Taobao / Alipay's viewfinder works: a small region scans much
                // faster and ignores fingers / shelves at the edges.
                // 80% width × 50% height fits a typical book barcode held in
                // landscape AND a held-up QR code.
                const roiW = Math.round(vw * 0.8);
                const roiH = Math.round(vh * 0.5);
                const sx = Math.round((vw - roiW) / 2);
                const sy = Math.round((vh - roiH) / 2);

                // Keep enough resolution for thin 1D bars: cap at 1500px so
                // ZXing's per-frame decode stays under ~100ms, but never shrink
                // below the source. Old code shrank to 800px which made Code
                // 128 bars sub-pixel and undecodable.
                const targetMaxDim = 1500;
                const scale = Math.min(1, targetMaxDim / Math.max(roiW, roiH));
                const cw = Math.round(roiW * scale);
                const ch = Math.round(roiH * scale);
                canvas.width = cw;
                canvas.height = ch;

                const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
                ctx.drawImage(videoElement, sx, sy, roiW, roiH, 0, 0, cw, ch);
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

                // Heartbeat every ~3s so user sees the loop is alive but
                // simply not finding a code yet. Helps distinguish "scanner
                // crashed" from "barcode is blurry / out of frame".
                if (tickCount % 30 === 0) {
                  log(`Scanning… tick #${tickCount}, ROI ${cw}×${ch}, no code in view`);
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
      trackRef.current = null;
      setTorchSupported(false);
      setTorchOn(false);
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
      {/* Aiming reticle — sits inside the actual scan ROI so anything the user
          fits in the brackets is guaranteed to be in the scanned region. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div
          className="relative"
          style={{ width: '70%', height: '38%', maxWidth: '560px', maxHeight: '280px' }}
        >
          <div className="absolute left-0 top-0 h-6 w-6 rounded-tl-md border-l-2 border-t-2 border-white/85" />
          <div className="absolute right-0 top-0 h-6 w-6 rounded-tr-md border-r-2 border-t-2 border-white/85" />
          <div className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-md border-b-2 border-l-2 border-white/85" />
          <div className="absolute bottom-0 right-0 h-6 w-6 rounded-br-md border-b-2 border-r-2 border-white/85" />
        </div>
      </div>
      {/* Torch toggle — rear phone cameras only. Critical for printed barcodes
          that wash out under bright light or get lost in dim shelves. */}
      {torchSupported && (
        <button
          type="button"
          onClick={toggleTorch}
          aria-label={torchOn ? 'Turn off torch' : 'Turn on torch'}
          aria-pressed={torchOn}
          className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition ${
            torchOn
              ? 'border-yellow-300/60 bg-yellow-300/90 text-black hover:bg-yellow-300'
              : 'border-white/20 bg-black/60 text-white/85 hover:bg-black/80'
          }`}
        >
          {torchOn ? <BoltIcon className="h-5 w-5" /> : <BoltSlashIcon className="h-5 w-5" />}
        </button>
      )}
      {/* Manual capture button — fallback when continuous scan can't decode.
          Grabs a full-res frame and runs scanBlob. Bottom-center, big enough
          for a thumb. */}
      <button
        type="button"
        onClick={captureAndScan}
        disabled={isCapturing}
        aria-label="Capture and scan"
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/30 bg-white/95 px-6 py-3 font-sans text-sm font-semibold text-black shadow-lg backdrop-blur-sm transition hover:bg-white active:scale-95 disabled:cursor-wait disabled:opacity-60"
      >
        {isCapturing ? 'Scanning…' : 'Tap to capture'}
      </button>
      {/* Status (only shown until stream starts) */}
      {status && !status.toLowerCase().includes('align') && (
        <p className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 max-w-[90%] rounded-full border border-white/15 bg-black/70 px-3 py-1 text-center text-[11px] font-medium text-white/90 backdrop-blur-sm">
          {status}
        </p>
      )}
    </div>
  );
}
