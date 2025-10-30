'use server';

import { getSupabaseServerClient } from '@/app/lib/supabase/server';

/** Payload used by the Book Items “Manage” form */
export type UpdatePayload = {
  id: string;
  title: string;
  author?: string;
  isbn?: string;
  classification?: string;
  location?: string;
  publisher?: string;
  year?: string | number;
  tags?: string[];
  available: boolean;
  copies_available: number;
  total_copies: number;
};

export async function updateBook(payload: UpdatePayload) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('books') // adjust if your table name differs
    .update({
      title: payload.title,
      author: payload.author ?? null,
      isbn: payload.isbn ?? null,
      classification: payload.classification ?? null,
      location: payload.location ?? null,
      publisher: payload.publisher ?? null,
      year: payload.year ?? null,
      tags: payload.tags ?? [],
      available: payload.available,
      copies_available: payload.copies_available,
      total_copies: payload.total_copies,
    })
    .eq('id', payload.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBook(id: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}
