-- ============================================================
-- v3.0.3 housekeeping — captures the search_books RPC, pg_trgm
-- extension, and the two GIN trigram indexes that v3.0.2 created
-- via Supabase Dashboard but never wrote to a migration file.
-- This makes the database reproducible from the repo alone.
--
-- ALREADY DEPLOYED to live Supabase (during v3.0.2). This file
-- captures the current state for fresh-environment provisioning.
-- All statements are idempotent (CREATE ... IF NOT EXISTS,
-- CREATE OR REPLACE) so re-running is safe.
--
-- Definitions extracted via pg_get_functiondef + pg_indexes
-- on 2026-04-28 from project zjlebdnlquxkfcdycssy.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS books_title_trgm_idx
  ON public."Books" USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS books_author_trgm_idx
  ON public."Books" USING gin (author gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.search_books(q text)
  RETURNS TABLE(id uuid)
  LANGUAGE sql
  STABLE
AS $function$
    SELECT b.id FROM "Books" b
    WHERE word_similarity(q, b.title) > 0.3
       OR word_similarity(q, coalesce(b.author, '')) > 0.3
       OR b.title ILIKE '%' || q || '%'
       OR coalesce(b.author, '') ILIKE '%' || q || '%'
       OR coalesce(b.isbn, '') ILIKE '%' || q || '%'
       OR coalesce(b.classification, '') ILIKE '%' || q || '%'
       OR coalesce(b.publisher, '') ILIKE '%' || q || '%'
    ORDER BY GREATEST(
      word_similarity(q, b.title),
      word_similarity(q, coalesce(b.author, ''))
    ) DESC
    LIMIT 50;
$function$;
