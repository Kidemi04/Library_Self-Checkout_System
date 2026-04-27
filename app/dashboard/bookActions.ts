'use server';

import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { findBookByIsbn, getNextAvailableBarcodes } from '@/app/lib/supabase/queries';

export type LookupIsbnResult =
  | { ok: true; existing: { id: string; title: string; author: string | null; copyCount: number } | null }
  | { ok: false; message: string };

export async function lookupIsbnInDb(isbn: string): Promise<LookupIsbnResult> {
  const { user } = await getDashboardSession();
  if (!user || user.role !== 'admin') {
    return { ok: false, message: 'Not allowed.' };
  }
  try {
    const existing = await findBookByIsbn(isbn);
    return { ok: true, existing };
  } catch {
    return { ok: false, message: 'Lookup failed. Try again.' };
  }
}

export type CreateBookInput = {
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: string;
  classification?: string;
  coverImageUrl?: string;
  category?: string;
  tags?: string[];
  copies: number;
};

export type CreateBookResult =
  | { ok: true; bookId: string; barcodes: string[] }
  | { ok: false; message: string; field?: string };

export async function createBookWithCopies(input: CreateBookInput): Promise<CreateBookResult> {
  const { user } = await getDashboardSession();
  if (!user || user.role !== 'admin') {
    return { ok: false, message: 'Not allowed.' };
  }

  const title = input.title?.trim();
  const author = input.author?.trim();
  if (!title) return { ok: false, message: 'Title is required.', field: 'title' };
  if (!author) return { ok: false, message: 'Author is required.', field: 'author' };
  if (!Number.isInteger(input.copies) || input.copies < 1 || input.copies > 20) {
    return { ok: false, message: 'Copies must be between 1 and 20.', field: 'copies' };
  }

  const supabase = getSupabaseServerClient();

  const bookPayload = {
    title,
    author,
    isbn: input.isbn?.trim() || null,
    publisher: input.publisher?.trim() || null,
    publication_year: input.publicationYear?.trim() || null,
    classification: input.classification?.trim() || null,
    cover_image_url: input.coverImageUrl?.trim() || null,
    category: input.category || null,
  };

  const { data: bookRow, error: bookError } = await supabase
    .from('Books')
    .insert(bookPayload)
    .select('id')
    .single();

  if (bookError || !bookRow) {
    console.error('[createBookWithCopies] book insert failed', bookError);
    return { ok: false, message: bookError?.message ?? 'Failed to create book.' };
  }

  let attempt = 0;
  let barcodes: string[] = [];
  while (attempt < 2) {
    barcodes = await getNextAvailableBarcodes(input.copies);
    const copiesPayload = barcodes.map((bc) => ({
      book_id: bookRow.id,
      barcode: bc,
      status: 'available',
    }));
    const { error: copiesError } = await supabase.from('Copies').insert(copiesPayload);
    if (!copiesError) break;
    if (attempt === 1 || !copiesError.message?.includes('duplicate')) {
      await supabase.from('Books').delete().eq('id', bookRow.id);
      console.error('[createBookWithCopies] copies insert failed', copiesError);
      return { ok: false, message: 'Could not generate barcodes. Try again.' };
    }
    attempt++;
  }

  if (input.tags?.length) {
    const normalized = Array.from(new Set(input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))).slice(0, 6);
    if (normalized.length) {
      const { data: existingTags } = await supabase.from('BookTags').select('id, name').in('name', normalized);
      const existingByName = new Map(((existingTags ?? []) as Array<{ id: string; name: string }>).map((t) => [t.name, t.id]));
      const toCreate = normalized.filter((n) => !existingByName.has(n));
      if (toCreate.length) {
        const { data: created } = await supabase.from('BookTags').insert(toCreate.map((name) => ({ name }))).select('id, name');
        ((created ?? []) as Array<{ id: string; name: string }>).forEach((t) => existingByName.set(t.name, t.id));
      }
      const linkRows = normalized
        .map((n) => ({ book_id: bookRow.id, tag_id: existingByName.get(n) }))
        .filter((r): r is { book_id: string; tag_id: string } => Boolean(r.tag_id));
      if (linkRows.length) await supabase.from('BookTagsLinks').insert(linkRows);
    }
  }

  revalidatePath('/dashboard/admin/books/new');
  revalidatePath('/dashboard/book/items');
  return { ok: true, bookId: bookRow.id, barcodes };
}
