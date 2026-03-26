import { redirect } from 'next/navigation';

type SearchParams = Record<string, string | string[] | undefined>;

const toQueryString = (searchParams?: SearchParams) => {
  if (!searchParams) return '';

  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value
        .filter((item): item is string => typeof item === 'string' && item.length > 0)
        .forEach((item) => query.append(key, item));
      return;
    }

    if (typeof value === 'string' && value.length > 0) {
      query.set(key, value);
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};

export default async function LegacyBookItemsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : undefined;
  redirect(`/dashboard/book/items${toQueryString(params)}`);
}
