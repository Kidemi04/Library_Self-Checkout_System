'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';

type DueDatePickerProps = {
  name?: string;
  defaultDate: string;
  minOffsetDays?: number;
  maxOffsetDays?: number;
  presets?: number[];
};

const toIsoDate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const addDays = (base: Date, days: number) => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

export default function DueDatePicker({
  name = 'dueDate',
  defaultDate,
  minOffsetDays = 1,
  maxOffsetDays = 30,
  presets = [7, 14, 21],
}: DueDatePickerProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minDate = toIsoDate(addDays(today, minOffsetDays));
  const maxDate = toIsoDate(addDays(today, maxOffsetDays));

  const [value, setValue] = useState<string>(() => {
    const fallback = toIsoDate(addDays(today, 14));
    return defaultDate || fallback;
  });

  const selectedOffset = useMemo(() => {
    const picked = new Date(value);
    if (Number.isNaN(picked.valueOf())) return null;
    const diff = Math.round((picked.getTime() - today.getTime()) / 86_400_000);
    return diff;
  }, [value, today]);

  const handlePreset = (days: number) => {
    setValue(toIsoDate(addDays(today, days)));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {presets.map((days) => {
          const active = selectedOffset === days;
          return (
            <button
              key={days}
              type="button"
              onClick={() => handlePreset(days)}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
                active
                  ? 'border-swin-red bg-swin-red text-white shadow-sm shadow-swin-red/25'
                  : 'border-swin-charcoal/15 bg-white text-swin-charcoal/75 hover:border-swin-charcoal/30 dark:border-white/15 dark:bg-swin-dark-surface dark:text-white/75',
              )}
            >
              {days}d
            </button>
          );
        })}
      </div>
      <label className="block">
        <span className="sr-only">Due date</span>
        <input
          type="date"
          name={name}
          value={value}
          min={minDate}
          max={maxDate}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-swin-charcoal/15 bg-white px-3 py-2 text-[13px] text-swin-charcoal focus:border-swin-red focus:outline-none focus:ring-2 focus:ring-swin-red/30 dark:border-white/15 dark:bg-swin-dark-surface dark:text-white"
          required
        />
      </label>
      {selectedOffset != null && selectedOffset >= minOffsetDays && selectedOffset <= maxOffsetDays && (
        <p className="font-mono text-[11px] text-swin-charcoal/50 dark:text-white/50">
          Returns in {selectedOffset} day{selectedOffset === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}
