'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

/** SIP-style item state (includes maintenance + reserved). */
export type ItemStatus =
  | 'available'
  | 'checked_out'
  | 'borrowed'
  | 'reserved'
  | 'in_transit'
  | 'on_hold'
  | 'in_process'
  | 'lost'
  | 'missing'
  | 'maintenance';

export type UpdatePayload = {
  id: string;
  title: string;
  author?: string | null;
  isbn?: string | null;
  classification?: string | null;
  location?: string | null;
  publisher?: string | null;
  publication_year?: string | number | null;
  tags?: string[] | null;
  status?: ItemStatus | null;
  available?: boolean | null;
  copies_available?: number | null; // may be null from the form if left blank
  total_copies?: number | null;     // may be null from the form if left blank
};

export async function updateBook(payload: UpdatePayload) {
  const supabase = getSupabaseServerClient();

  // Decide availability: explicit boolean wins, else derive from status
  const derivedAvailable =
    typeof payload.available === 'boolean'
      ? payload.available
      : (payload.status ?? null) === 'available';

  // Build a *partial* update object and only include numeric fields if valid.
  const update: Record<string, any> = {
    title: payload.title,
    author: payload.author ?? null,
    isbn: payload.isbn ?? null,
    classification: payload.classification ?? null,
    location: payload.location ?? null,
    publisher: payload.publisher ?? null,
    publication_year:
      payload.publication_year == null ? null : String(payload.publication_year),
    tags: payload.tags ?? [],
    status: payload.status ?? null,
    available: derivedAvailable,
  };

  // Only set copies_available / total_copies if they are valid numbers.
  if (typeof payload.copies_available === 'number' && Number.isFinite(payload.copies_available)) {
    update.copies_available = payload.copies_available;
  }
  if (typeof payload.total_copies === 'number' && Number.isFinite(payload.total_copies)) {
    update.total_copies = payload.total_copies;
  }

  const { error } = await supabase.from('books').update(update).eq('id', payload.id);

  if (error) throw new Error(error.message);

  // Revalidate the SSR page so UI reflects the latest row immediately
  revalidatePath('/dashboard/book-items');
}

export async function deleteBook(id: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/book-items');
}
