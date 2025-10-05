'use client';

import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { CameraIcon, PhotoIcon, StopCircleIcon } from '@heroicons/react/24/outline';

type Detector = {
  detect: (image: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
};

type CheckInScannerProps = {
  onDetection: (value: string) => void;
};

const SUPPORTED_FORMATS = [
  'code_128',
  'code_39',
  'code_93',
  'ean_13',
  'ean_8',
  'itf',
  'qr_code',
  'upc_a',
  'upc_e',
];

export default function CheckInScanner({ onDetection }: CheckInScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<Detector | null>(null);
  const frameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isBarcodeSupported =
    typeof window !== 'undefined' && typeof (window as any).BarcodeDetector !== 'undefined';

  const cleanup = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const ensureDetector = async (): Promise<Detector> => {
    if (!isBarcodeSupported) {
      throw new Error('Barcode scanning is not supported on this device.');
    }
    if (!detectorRef.current) {
      detectorRef.current = new (window as any).BarcodeDetector({ formats: SUPPORTED_FORMATS }) as Detector;
    }
    return detectorRef.current as Detector;
  };

  const handleDetection = useCallback(
    (value: string) => {
      onDetection(value);
      setStatus(`Detected: ${value}`);
    },
    [onDetection],
  );

  const scanFrame = useCallback(async () => {
    if (!isScanning || !videoRef.current) return;
    try {
      const detector = await ensureDetector();
      const video = videoRef.current;
      if (!video.videoWidth || !video.videoHeight) {
        frameRef.current = requestAnimationFrame(() => scanFrame());
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const bitmap = await createImageBitmap(canvas);
      const barcodes = await detector.detect(bitmap);
      if (barcodes.length > 0) {
        cleanup();
        handleDetection(barcodes[0].rawValue);
        return;
      }
    } catch (error) {
      console.error('Barcode detection failed', error);
      setStatus('Unable to read barcode. Try adjusting the camera or upload a photo.');
    }
    frameRef.current = requestAnimationFrame(() => scanFrame());
  }, [cleanup, ensureDetector, handleDetection, isScanning]);

  const startCameraScan = useCallback(async () => {
    try {
      const detector = await ensureDetector();
      if (!detector) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('Align the barcode within the frame');
      setIsScanning(true);
      frameRef.current = requestAnimationFrame(() => scanFrame());
    } catch (error) {
      console.error('Unable to start camera', error);
      setStatus('Cannot access camera. Check permissions or use photo upload.');
      cleanup();
    }
  }, [cleanup, ensureDetector, scanFrame]);

  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const detector = await ensureDetector();
        const bitmap = await createImageBitmap(file);
        const barcodes = await detector.detect(bitmap);
        if (barcodes.length > 0) {
          handleDetection(barcodes[0].rawValue);
        } else {
          setStatus('No barcode detected. Try another image or use the camera.');
        }
      } catch (error) {
        console.error('Failed to detect barcode from file', error);
        setStatus('Unable to read the selected image.');
      } finally {
        event.target.value = '';
      }
    },
    [ensureDetector, handleDetection],
  );

  return (
    <div className="mt-3 rounded-lg border border-swin-charcoal/15 bg-swin-ivory p-3 text-xs text-swin-charcoal/80">
      <p className="font-semibold text-swin-charcoal">Scan options</p>
      <p className="mt-1 text-[11px] text-swin-charcoal/60">
        Populate the identifier automatically using your device camera or a saved photo.
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startCameraScan}
          disabled={isScanning || !isBarcodeSupported}
          className="inline-flex items-center gap-2 rounded-md bg-swin-charcoal px-3 py-2 text-xs font-semibold text-swin-ivory shadow-sm shadow-swin-charcoal/20 transition hover:bg-swin-red disabled:cursor-not-allowed disabled:bg-swin-charcoal/40"
        >
          <CameraIcon className="h-4 w-4" />
          {isScanning ? 'Scanning…' : 'Scan with camera'}
        </button>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-swin-charcoal/20 px-3 py-2 text-xs font-semibold text-swin-charcoal transition hover:border-swin-red">
          <PhotoIcon className="h-4 w-4" />
          <span>Upload photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        {isScanning ? (
          <button
            type="button"
            onClick={() => {
              cleanup();
              setStatus('Camera closed.');
            }}
            className="inline-flex items-center gap-2 rounded-md border border-swin-red/40 px-3 py-2 text-xs font-semibold text-swin-red transition hover:bg-swin-red/10"
          >
            <StopCircleIcon className="h-4 w-4" />
            Stop scan
          </button>
        ) : null}
      </div>

      {isScanning ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-swin-charcoal/20 bg-black/60">
          <video ref={videoRef} className="h-48 w-full object-cover" muted playsInline />
        </div>
      ) : null}

      {status ? <p className="mt-2 text-[11px] text-swin-charcoal/70">{status}</p> : null}

      {!isBarcodeSupported ? (
        <p className="mt-2 text-[11px] text-swin-red/70">
          BarcodeDetector is not supported on this device. Use the photo upload option or enter the
          identifier manually.
        </p>
      ) : null}
    </div>
  );
}
