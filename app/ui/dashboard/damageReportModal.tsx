'use client';

import { useRef, useState } from 'react';
import { XMarkIcon, PhotoIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { uploadDamagePhotos } from '@/app/dashboard/damageActions';

export type DamageSeverity = 'damaged' | 'lost' | 'needs_inspection';

export type DamageSubmitPayload = {
  severity: DamageSeverity;
  notes: string;
  photoUrls: string[];
};

type DamageReportModalProps = {
  open: boolean;
  loanId: string | null;
  onClose: () => void;
  onSubmit: (payload: DamageSubmitPayload) => void;
};

const SEVERITY_OPTIONS: { value: DamageSeverity; label: string; hint: string }[] = [
  { value: 'damaged', label: 'Damaged', hint: 'Returned but needs repair' },
  { value: 'needs_inspection', label: 'Needs inspection', hint: "Unsure \u2014 flag for later review" },
  { value: 'lost', label: 'Lost', hint: 'Copy did not come back' },
];

const MAX_PHOTOS = 3;

export default function DamageReportModal({ open, loanId, onClose, onSubmit }: DamageReportModalProps) {
  const [severity, setSeverity] = useState<DamageSeverity>('damaged');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const handleFilesChosen = (files: FileList | null) => {
    if (!files) return;
    const next = [...photos, ...Array.from(files)].slice(0, MAX_PHOTOS);
    setPhotos(next);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!loanId) {
      setError('Missing loan reference.');
      return;
    }
    if (notes.length > 500) {
      setError('Notes must be 500 characters or fewer.');
      return;
    }
    setBusy(true);
    try {
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        const fd = new FormData();
        fd.set('loanId', loanId);
        photos.forEach((p) => fd.append('photos', p));
        const result = await uploadDamagePhotos(fd);
        if (result.status !== 'success') {
          setError(result.message);
          setBusy(false);
          return;
        }
        photoUrls = result.urls;
      }
      onSubmit({ severity, notes: notes.trim(), photoUrls });
      // caller closes the modal; we reset state for next open
      setNotes('');
      setPhotos([]);
      setSeverity('damaged');
    } catch (err) {
      console.error('Damage submit failed', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="damage-report-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={() => !busy && onClose()}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-swin-dark-surface">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-swin-red/10">
              <ExclamationTriangleIcon className="h-5 w-5 text-swin-red" />
            </div>
            <div>
              <h2
                id="damage-report-title"
                className="font-display text-[20px] font-semibold text-swin-charcoal dark:text-white"
              >
                Report condition
              </h2>
              <p className="mt-0.5 text-[12px] text-swin-charcoal/60 dark:text-white/60">
                Capture any damage before marking the return complete.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-full p-1 text-swin-charcoal/50 transition hover:bg-swin-charcoal/5 hover:text-swin-charcoal dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <fieldset className="mb-4">
          <legend className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/55 dark:text-white/55">
            Severity
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSeverity(opt.value)}
                className={clsx(
                  'rounded-lg border px-3 py-2.5 text-left text-[12px] transition',
                  severity === opt.value
                    ? 'border-swin-red bg-swin-red/8 text-swin-red dark:bg-swin-red/15'
                    : 'border-swin-charcoal/15 bg-white text-swin-charcoal/70 hover:border-swin-charcoal/25 dark:border-white/15 dark:bg-swin-dark-surface dark:text-white/70',
                )}
                aria-pressed={severity === opt.value}
              >
                <p className="font-semibold">{opt.label}</p>
                <p className="mt-0.5 text-[11px] opacity-75">{opt.hint}</p>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mb-4 block">
          <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/55 dark:text-white/55">
            Notes (optional)
          </span>
          <textarea
            value={notes}
            maxLength={500}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. cover torn on spine, water damage on pages 40-60"
            className="w-full rounded-lg border border-swin-charcoal/15 bg-white px-3 py-2 text-[13px] text-swin-charcoal focus:border-swin-red focus:outline-none focus:ring-2 focus:ring-swin-red/30 dark:border-white/15 dark:bg-swin-dark-surface dark:text-white"
          />
          <p className="mt-1 text-right font-mono text-[10px] text-swin-charcoal/40 dark:text-white/40">
            {notes.length}/500
          </p>
        </label>

        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/55 dark:text-white/55">
              Photos (optional, up to {MAX_PHOTOS})
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photos.length >= MAX_PHOTOS || busy}
              className="flex items-center gap-1.5 rounded-full border border-swin-charcoal/15 bg-white px-3 py-1 text-[11px] font-semibold text-swin-charcoal transition hover:border-swin-charcoal/30 disabled:opacity-50 dark:border-white/15 dark:bg-swin-dark-surface dark:text-white"
            >
              <PhotoIcon className="h-3.5 w-3.5" /> Add photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => handleFilesChosen(e.target.files)}
              className="hidden"
            />
          </div>
          {photos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-swin-charcoal/15 p-3 text-center font-mono text-[11px] text-swin-charcoal/45 dark:border-white/10 dark:text-white/45">
              No photos attached.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {photos.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-swin-charcoal/10 bg-white px-3 py-2 text-[12px] dark:border-white/10 dark:bg-swin-dark-surface"
                >
                  <span className="truncate font-mono text-swin-charcoal/70 dark:text-white/70">
                    {file.name} · {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="rounded-full border border-swin-charcoal/15 px-2 py-0.5 text-[10px] font-semibold text-swin-charcoal/60 hover:text-swin-red dark:border-white/15 dark:text-white/60"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="mb-3 text-[12px] font-semibold text-swin-red">{error}</p>}

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-swin-charcoal/15 bg-white px-4 py-2.5 text-[13px] font-semibold text-swin-charcoal transition hover:bg-swin-charcoal/5 disabled:opacity-60 dark:border-white/15 dark:bg-swin-dark-surface dark:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="rounded-xl bg-swin-red px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-swin-red/90 disabled:opacity-60"
          >
            {busy ? 'Uploading\u2026' : 'Attach to return'}
          </button>
        </div>
      </div>
    </div>
  );
}
