'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowserClient } from '@/app/lib/supabase/client';

type HoldState = 'none' | 'queued' | 'ready';

type PlaceHoldButtonProps = {
  bookId: string;
  patronId?: string;
  bookTitle?: string;
};

export default function PlaceHoldButton({ bookId, patronId, bookTitle }: PlaceHoldButtonProps) {
  const supabase = supabaseBrowserClient;
  const [holdState, setHoldState] = useState<HoldState>('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if the user already has an active hold for this book
  useEffect(() => {
    const checkExistingHold = async () => {
      if (!patronId) return;

      const { data, error } = await supabase
        .from('Holds')
        .select('id, status')
        .eq('patron_id', patronId)
        .eq('book_id', bookId)
        .in('status', ['queued', 'ready'])
        .order('placed_at', { ascending: true })
        .limit(1);

      if (error) {
        console.error('checkExistingHold error', error);
        return;
      }

      if (data && data.length > 0) {
        setHoldState(data[0].status === 'ready' ? 'ready' : 'queued');
      } else {
        setHoldState('none');
      }
    };

    checkExistingHold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patronId, bookId]);

  const handleClick = async () => {
    setError(null);

    if (!patronId) {
      setError('Please log in to place a hold.');
      return;
    }

    if (holdState !== 'none') {
      setError('You already have a hold for this book.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/holds/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, bookTitle: bookTitle ?? '' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to place hold. Please try again.');
        return;
      }

      setHoldState('queued');
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const hasHold = holdState === 'queued' || holdState === 'ready';

  if (hasHold) {
    const label =
      holdState === 'ready' ? 'Ready for pickup' : 'Hold placed ✓';

    return (
      <div className="flex flex-col gap-1">
        <button
          disabled
          className="rounded-xl bg-emerald-600/90 px-3 py-1.5 text-xs sm:text-sm font-medium text-white"
        >
          {label}
        </button>
        {holdState === 'ready' && (
          <p className="text-[11px] text-emerald-700">
            Please visit the library desk before it expires.
          </p>
        )}
        {error && (
          <p className="text-[11px] text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }

  // No hold yet → normal "Place Hold" button
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-xl bg-swin-charcoal px-3 py-1.5 text-xs sm:text-sm font-medium text-swin-ivory shadow hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Placing…' : 'Place Hold'}
      </button>

      {error && (
        <p className="text-[11px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
