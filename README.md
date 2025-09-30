## Install and Running
Install nodejs:
\
[Nodejs](https://nodejs.org/en)

\
Install pnpm:

```
npm install -g pnpm
```
\
Run the program:
```
pnpm i
pnpm dev
```

Notice:
When you run the program, it will show a black Dev Tools at the corner.
\
To disable the UI, set **devIndicators: false** in the next.config file.
\
Leave the tools until final.

## Supabase Setup

The dashboard relies on a Supabase project for catalogue and circulation data. Configure the following environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side actions)

Recommended tables:

```sql
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  isbn text unique,
  barcode text unique,
  classification text,
  location text,
  cover_image_url text,
  total_copies integer not null default 1,
  available_copies integer not null default 1,
  status text not null default 'available',
  last_transaction_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  borrower_identifier text not null,
  borrower_name text not null,
  borrower_type text not null check (borrower_type in ('student', 'staff')),
  status text not null default 'borrowed' check (status in ('borrowed', 'returned', 'overdue')),
  borrowed_at timestamptz not null default now(),
  due_at timestamptz not null,
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Add row-level security policies that allow the service role key to perform inserts/updates, and expose read access to the anon key as required by your deployment.
