export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = CustomersTableType;

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'paid' | 'pending';
};

export type LatestInvoice = {
  id: string;
  name: string;
  email: string;
  amount: string;
  image_url: string;
  status?: 'paid' | 'pending';
};

export type Revenue = {
  month: string;
  revenue: number;
};
