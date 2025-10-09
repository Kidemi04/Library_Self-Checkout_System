import type { Revenue } from '@/app/lib/definitions';

export const generateYAxis = (revenue: Revenue[]) => {
  const defaultLabels = [0, 25, 50, 75, 100];
  if (!revenue.length) {
    return {
      yAxisLabels: defaultLabels.map((label) => `${label}%`),
      topLabel: 100,
    };
  }

  const max = revenue.reduce((highest, entry) => Math.max(highest, entry.revenue), 0);
  const topLabel = max === 0 ? 100 : Math.ceil(max / 50) * 50;

  const yAxisLabels = Array.from({ length: 5 }, (_, index) => {
    const value = (topLabel / 4) * index;
    return value.toString();
  }).reverse();

  return {
    yAxisLabels,
    topLabel,
  };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  const pages: Array<number | string> = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      pages.push(page);
    }
    return pages;
  }

  const addEllipsis = () => {
    if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  };

  for (let page = 1; page <= totalPages; page += 1) {
    const isBoundary = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= 1;
    const isEdge = page <= 2 || page >= totalPages - 1;

    if (isBoundary || isNearCurrent || isEdge) {
      pages.push(page);
    } else {
      addEllipsis();
    }
  }

  return pages;
};

export const formatDateToLocal = (date: string | number | Date) => {
  try {
    const value = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(value);
  } catch (error) {
    console.error('Failed to format date', error);
    return '';
  }
};

export const formatCurrency = (amount: number) => {
  if (!Number.isFinite(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 2,
  }).format(amount);
};
