'use client';

import { useEffect } from 'react';

/**
 * Invisible component — fires once on mount to check if the current user
 * has any loans due in ~3 days and creates due_soon notifications if needed.
 */
export default function DueDateChecker() {
  useEffect(() => {
    fetch('/api/notifications/due-check', { method: 'POST' }).catch(() => {
      // Non-critical — silently ignore failures
    });
  }, []);

  return null;
}
