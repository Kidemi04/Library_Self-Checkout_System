-- Extend the Books.category CHECK constraint to support the new UI categories:
--   Psychology, Self-help, History
-- (keeping the existing 4 values so current rows stay valid).

alter table "Books" drop constraint if exists "Books_category_check";

alter table "Books" add constraint "Books_category_check"
  check (category in (
    'Computer Science',
    'Art & Design',
    'Business',
    'Engineering',
    'Psychology',
    'Self-help',
    'History'
  ));
