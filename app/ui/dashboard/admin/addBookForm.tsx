'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import IsbnLookupBox from '@/app/ui/dashboard/primitives/IsbnLookupBox';
import BarcodePreview from '@/app/ui/dashboard/primitives/BarcodePreview';
import ConfirmModal from '@/app/ui/dashboard/confirmModal';
import CameraScanModal from '@/app/ui/dashboard/admin/cameraScanModal';
import { lookupIsbnInDb, createBookWithCopies } from '@/app/dashboard/bookActions';
import { supabaseBrowserClient } from '@/app/lib/supabase/client';

type ExistingMatch = { id: string; title: string; author: string | null; copyCount: number };

export default function AddBookForm() {
  const router = useRouter();

  const [isbn, setIsbn] = useState('');
  const [lookupPending, setLookupPending] = useState(false);
  const [existing, setExisting] = useState<ExistingMatch | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState('');
  const [classification, setClassification] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [copies, setCopies] = useState(1);
  const [previewBarcodes, setPreviewBarcodes] = useState<string[] | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPreviewBarcodes(null);
    (async () => {
      const { data } = await supabaseBrowserClient
        .from('Copies')
        .select('barcode')
        .like('barcode', 'SWI-%')
        .order('barcode', { ascending: false })
        .limit(50);
      if (cancelled) return;
      const { computeNextBarcodes } = await import('@/app/lib/barcode');
      const existingBarcodes = ((data ?? []) as Array<{ barcode: string | null }>)
        .map((r) => r.barcode)
        .filter((b): b is string => Boolean(b));
      try {
        setPreviewBarcodes(computeNextBarcodes(existingBarcodes, copies));
      } catch {
        setPreviewBarcodes([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [copies]);

  const runLookup = async (value: string) => {
    setLookupPending(true);
    setError(null);
    setExisting(null);
    const res = await lookupIsbnInDb(value);
    setLookupPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    if (res.existing) setExisting(res.existing);
  };

  const handleLookup = () => {
    void runLookup(isbn);
  };

  const handleScan = () => setShowCamera(true);

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 6) setTags([...tags, t]);
    setTagInput('');
  };

  const submit = () => {
    setError(null);
    if (!title.trim() || !author.trim()) {
      setError('Title and Author are required.');
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    setConfirmOpen(false);
    startTransition(async () => {
      const res = await createBookWithCopies({
        title,
        author,
        isbn,
        publisher,
        publicationYear: year,
        classification,
        coverImageUrl: coverUrl,
        category,
        tags,
        copies,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.push(`/dashboard/book/${res.bookId}`);
    });
  };

  return (
    <div className="space-y-6 text-swin-charcoal dark:text-white">
      {error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500 dark:bg-rose-500/10 dark:text-rose-100">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
        <h2 className="font-display text-[18px] font-semibold mb-3">ISBN duplicate check</h2>
        <IsbnLookupBox
          value={isbn}
          onChange={setIsbn}
          onLookup={handleLookup}
          onScan={handleScan}
          pending={lookupPending}
        />
        {existing && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-sm font-semibold">This book already exists in the library:</p>
            <p className="mt-1 text-sm">
              &ldquo;{existing.title}&rdquo; by {existing.author ?? 'Unknown'} ({existing.copyCount}{' '}
              cop{existing.copyCount === 1 ? 'y' : 'ies'})
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/book/${existing.id}`)}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Go to that book
              </button>
              <button
                type="button"
                onClick={() => setExisting(null)}
                className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:text-amber-200"
              >
                Continue creating new entry
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
        <h2 className="font-display text-[18px] font-semibold mb-3">Basic information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              maxLength={200}
            />
          </Field>
          <Field label="Author *">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={inputCls}
              maxLength={200}
            />
          </Field>
          <Field label="Publisher">
            <input
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Publication year">
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={inputCls}
              maxLength={4}
            />
          </Field>
          <Field label="Classification">
            <input
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className={inputCls}
              placeholder="e.g. 005.1 MAR"
            />
          </Field>
          <Field label="Cover image URL">
            <input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
        <h2 className="font-display text-[18px] font-semibold mb-3">Category &amp; tags</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              <option value="">— Select —</option>
              <option>Computer Science</option>
              <option>Business</option>
              <option>Art &amp; Design</option>
              <option>Engineering</option>
            </select>
          </Field>
          <Field label="Tags">
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-2 dark:border-white/10 dark:bg-slate-950">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-white/10"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type and press Enter"
                className="flex-1 min-w-[8rem] bg-transparent px-2 py-0.5 text-sm focus:outline-none"
              />
            </div>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
        <h2 className="font-display text-[18px] font-semibold mb-3">Copies</h2>
        <Field label="Number of copies">
          <input
            type="number"
            min={1}
            max={20}
            value={copies}
            onChange={(e) =>
              setCopies(Math.max(1, Math.min(20, parseInt(e.target.value || '1', 10) || 1)))
            }
            className={`${inputCls} max-w-[6rem]`}
          />
        </Field>
        <div className="mt-3">
          <BarcodePreview barcodes={previewBarcodes} />
        </div>
      </section>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded-xl bg-swin-red px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-swin-red/90 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {submitting
            ? 'Creating…'
            : `Create book + ${copies} cop${copies === 1 ? 'y' : 'ies'}`}
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        type="info"
        title="Create new book?"
        message={`You are about to create "${title}" with ${copies} cop${
          copies === 1 ? 'y' : 'ies'
        }${
          previewBarcodes && previewBarcodes.length
            ? ` (${previewBarcodes[0]} to ${previewBarcodes[previewBarcodes.length - 1]})`
            : ''
        }. Proceed?`}
        confirmText="Yes, create"
        cancelText="Go back"
        onConfirm={confirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      />

      {showCamera && (
        <CameraScanModal
          onResult={(scannedIsbn) => {
            setShowCamera(false);
            setIsbn(scannedIsbn);
            void runLookup(scannedIsbn);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-swin-charcoal/55 dark:text-white/55">
        {label}
      </span>
      {children}
    </label>
  );
}
