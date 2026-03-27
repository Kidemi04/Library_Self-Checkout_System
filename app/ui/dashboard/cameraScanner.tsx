'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

const NATIVE_FORMATS = [
  'ean_13', 'ean_8', 'upc_a', 'upc_e',
  'code_128', 'code_39', 'qr_code',
] as const;

const ZXING_FORMATS = [
  BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
  BarcodeFormat.QR_CODE,
];

type CameraScannerProps = {
  onDetected: (value: string) => void;
  onError?: (message: string) => void;
  onDebugLog?: (msg: string) => void;
  facingMode: 'environment' | 'user';
  deviceId?: string | null;
};

export default function CameraScanner({ onDetected, onError, facingMode, deviceId, onDebugLog }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
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

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
        : { facingMode: { ideal: facingMode }, width: { ideal: 640 }, height: { ideal: 480 } },
    };

    const hasNativeDetector =
      typeof window !== 'undefined' && 'BarcodeDetector' in window;

    log(`Native BarcodeDetector: ${hasNativeDetector}`);
    log(`deviceId=${deviceId ?? 'null'}, facingMode=${facingMode}`);

    const startWithNativeDetector = async () => {
      log('Starting native BarcodeDetector path...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef = stream;
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings();
      log(`Stream ready: ${settings?.width}x${settings?.height}`);

      videoElement.srcObject = stream;
      await videoElement.play();

      const BarcodeDetector = (window as any).BarcodeDetector;
      const detector = new BarcodeDetector({ formats: [...NATIVE_FORMATS] });

      setStatus('Align the barcode within the frame.');

      let tickCount = 0;
      const scanLoop = async () => {
        if (stopped) return;
        tickCount++;
        try {
          if (videoElement.readyState >= 2) {
            const barcodes = await detector.detect(videoElement);
            if (tickCount % 13 === 1) {
              log(`[native] tick #${tickCount}, barcodes found: ${barcodes.length}`);
            }
            if (barcodes.length > 0 && !stopped) {
              const text = barcodes[0].rawValue;
              const fmt = barcodes[0].format;
              log(`[native] DETECTED: "${text}" (format: ${fmt})`);
              setStatus(`Detected ${text}`);
              onDetectedRef.current(text);
              stopped = true;
              stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
              return;
            }
          }
        } catch (e: any) {
          if (tickCount % 13 === 1) {
            log(`[native] tick #${tickCount} error: ${e?.message ?? e}`);
          }
        }
        if (!stopped) {
          setTimeout(scanLoop, 150);
        }
      };

      scanLoop();
    };

    const startWithZxing = async () => {
      log('Starting ZXing path...');
      const hints = new Map<DecodeHintType, any>();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS);
      hints.set(DecodeHintType.TRY_HARDER, true);
      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 200,
      });

      let tickCount = 0;
      const handleResult = (result: any, error: any, controls?: IScannerControls | null) => {
        if (stopped) return;
        tickCount++;
        if (controls) controlsRef.current = controls;
        if (result) {
          const text = result.getText();
          const fmt = result.getBarcodeFormat?.() ?? 'unknown';
          log(`[zxing] DETECTED: "${text}" (format: ${fmt})`);
          setStatus(`Detected ${text}`);
          onDetectedRef.current(text);
          controls?.stop();
          stopped = true;
          return;
        }
        if (error && error.name !== 'NotFoundException') {
          log(`[zxing] error: ${error.name} - ${error.message}`);
          console.error('Scanner error', error);
        }
        if (tickCount % 15 === 1) {
          log(`[zxing] tick #${tickCount}, scanning...`);
        }
      };

      await reader
        .decodeFromConstraints(constraints, videoElement, handleResult)
        .then((controls) => {
          if (stopped) { controls?.stop(); return; }
          controlsRef.current = controls;
          log('[zxing] decodeFromConstraints attached, scanning started');
          setStatus('Align the barcode within the frame.');
        });
    };

    const startScanner = async () => {
      try {
        setStatus('Initialising camera…');
        if (hasNativeDetector) {
          await startWithNativeDetector();
        } else {
          await startWithZxing();
        }
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
      controlsRef.current?.stop();
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
