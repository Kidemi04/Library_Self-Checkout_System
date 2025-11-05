'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export type ItemStatus =
  | 'available'
  | 'borrowed'
  | 'checked_out'
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
  publisher?: string | null;
  publication_year?: string | number | null;
  tags?: string[] | null;
  cover_image_url?: string | null;
};

const normalizeTags = (tags: string[]): string[] =>
  Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => tag.toLowerCase()),
    ),
  );

const syncBookTags = async (
  supabase: SupabaseClient,
  bookId: string,
  tags: string[],
): Promise<void> => {
  const normalized = normalizeTags(tags);

  if (normalized.length === 0) {
    await supabase.from('book_tag_links').delete().eq('book_id', bookId);
    return;
  }

  const { data: existingTags, error: fetchTagsError } = await supabase
    .from('book_tags')
    .select('id, name')
    .in('name', normalized);

  if (fetchTagsError) throw fetchTagsError;

  const tagIdByName = new Map<string, string>();
  (existingTags ?? []).forEach((tag) => {
    if (tag?.name) {
      tagIdByName.set(tag.name.toLowerCase(), tag.id);
    }
  });

  const tagsToCreate = normalized.filter((name) => !tagIdByName.has(name));

  if (tagsToCreate.length > 0) {
    const { data: createdTags, error: createError } = await supabase
      .from('book_tags')
      .insert(tagsToCreate.map((name) => ({ name })))
      .select('id, name');

    if (createError) throw createError;

    (createdTags ?? []).forEach((tag) => {
      if (tag?.name) {
        tagIdByName.set(tag.name.toLowerCase(), tag.id);
      }
    });
  }

  const desiredTagIds = normalized
    .map((name) => tagIdByName.get(name))
    .filter((id): id is string => typeof id === 'string');

  const { data: currentLinks, error: fetchLinksError } = await supabase
    .from('book_tag_links')
    .select('tag_id')
    .eq('book_id', bookId);

  if (fetchLinksError) throw fetchLinksError;

  const currentTagIds = new Set(
    (currentLinks ?? [])
      .map((link) => link?.tag_id)
      .filter((id): id is string => typeof id === 'string'),
  );

  const desiredSet = new Set(desiredTagIds);

  const tagIdsToRemove = Array.from(currentTagIds).filter((id) => !desiredSet.has(id));
  const tagIdsToAdd = desiredTagIds.filter((id) => !currentTagIds.has(id));

  if (tagIdsToRemove.length > 0) {
    await supabase
      .from('book_tag_links')
      .delete()
      .eq('book_id', bookId)
      .in('tag_id', tagIdsToRemove);
  }

  if (tagIdsToAdd.length > 0) {
    await supabase
      .from('book_tag_links')
      .insert(tagIdsToAdd.map((tagId) => ({ book_id: bookId, tag_id: tagId })));
  }
};

export async function updateBook(payload: UpdatePayload) {
  const supabase = getSupabaseServerClient();

  const update: Record<string, unknown> = {
    title: payload.title,
    author: payload.author ?? null,
    isbn: payload.isbn ?? null,
    classification: payload.classification ?? null,
    publisher: payload.publisher ?? null,
    publication_year:
      payload.publication_year == null ? null : String(payload.publication_year),
    cover_image_url: payload.cover_image_url ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('books').update(update).eq('id', payload.id);
  if (error) throw new Error(error.message);

  if (Array.isArray(payload.tags)) {
    await syncBookTags(supabase, payload.id, payload.tags);
  }

  revalidatePath('/dashboard/book-items');
}

export async function deleteBook(id: string) {
  const supabase = getSupabaseServerClient();

  const { error: copyError } = await supabase.from('copies').delete().eq('book_id', id);
  if (copyError) throw new Error(copyError.message);

  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/book-items');
}
