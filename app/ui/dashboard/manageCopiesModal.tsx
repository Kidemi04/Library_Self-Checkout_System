'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type CopyRow = {
  id: string;
  barcode: string;
  status: string;
  created_at: string | null;
};

const STATUS_STYLE: Record<string, { label: string; chip: string }> = {
  available:  { label: 'Available',   chip: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  on_loan:    { label: 'On loan',     chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  lost:       { label: 'Lost',        chip: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  damaged:    { label: 'Damaged',     chip: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  processing: { label: 'Processing',  chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  hold_shelf: { label: 'Hold shelf',  chip: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
};

interface Props {
  bookId: string;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

export default function ManageCopiesModal({ bookId, bookTitle, isOpen, onClose, onChanged }: Props) {
  const [copies, setCopies] = useState<CopyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccess(null);
    setBarcode('');
    loadCopies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bookId]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen]);

  const loadCopies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/copies?bookId=${encodeURIComponent(bookId)}`);
      const data = await res.json();
      if (res.ok) setCopies(data.copies ?? []);
      else setError(data.error ?? 'Failed to load copies.');
    } catch {
      setError('Failed to load copies.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = barcode.trim();
    if (!trimmed) return;
    setError(null);
    setSuccess(null);
    setAdding(true);
    try {
      const res = await fetch('/api/copies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, barcode: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to add copy.');
      } else {
        setSuccess(`Copy "${trimmed}" added.`);
        setBarcode('');
        await loadCopies();
        onChanged?.();
        inputRef.current?.focus();
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (copyId: string, copyBarcode: string) => {
    setError(null);
    setSuccess(null);
    setRemovingId(copyId);
    try {
      const res = await fetch('/api/copies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to remove copy.');
      } else {
        setSuccess(`Copy "${copyBarcode}" removed.`);
        await loadCopies();
        onChanged?.();
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen) return null;

  const availableCount = copies.filter((c) => c.status === 'available').length;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Manage Copies</h2>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{bookTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-4">

          {/* Summary pill */}
          {!loading && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{availableCount}</span> available
              {' · '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{copies.length}</span> total
            </p>
          )}

          {/* Copies table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="h-5 w-5 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : copies.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              No copies yet. Add one below.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="px-3 py-2">Barcode</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {copies.map((copy) => {
                    const s = STATUS_STYLE[copy.status] ?? STATUS_STYLE.available;
                    const canRemove = copy.status !== 'on_loan';
                    return (
                      <tr key={copy.id} className="bg-white dark:bg-slate-900">
                        <td className="px-3 py-2.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                          {copy.barcode}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.chip}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleRemove(copy.id, copy.barcode)}
                            disabled={!canRemove || removingId === copy.id}
                            title={!canRemove ? 'Cannot remove — copy is currently on loan' : 'Remove this copy'}
                            className="rounded-lg border border-red-200 px-2.5 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            {removingId === copy.id ? '…' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Feedback */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {success}
            </p>
          )}

          {/* Add copy form */}
          <form onSubmit={handleAdd} className="flex gap-2 pt-1">
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => { setBarcode(e.target.value); setError(null); setSuccess(null); }}
              placeholder="Enter barcode"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-swin-charcoal focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={adding || !barcode.trim()}
              className="rounded-xl bg-swin-charcoal px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-swin-charcoal"
            >
              {adding ? 'Adding…' : 'Add copy'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
