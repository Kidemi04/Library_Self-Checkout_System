export type InvoiceRow = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  status: 'paid' | 'pending';
  amount: number;
  date: string;
};

export async function fetchFilteredInvoices(
  _query: string,
  _currentPage: number,
): Promise<InvoiceRow[]> {
  return [];
}
