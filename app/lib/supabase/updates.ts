'use server';

import { getSupabaseServerClient } from '@/app/lib/supabase/server';

type UpdatePayload = {
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
  const supabase = getSupabaseServerClient(); // <-- use your factory

  const { data, error } = await supabase
    .from('books')
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
