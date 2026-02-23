import { redirect } from 'next/navigation';

export default async function Page() {
  // If user manually enter the link at the address bar, it will return to book items page.
  redirect('/dashboard/book/items');
}