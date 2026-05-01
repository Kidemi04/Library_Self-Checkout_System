type CsvCell = string | number | boolean | Date | null | undefined;

const needsQuoting = (s: string): boolean =>
  s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r');

const escapeCell = (value: CsvCell): string => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value);
  if (needsQuoting(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  const BOM = '﻿';
  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','));
  }
  return BOM + lines.join('\n') + '\n';
}

export function csvResponse(filename: string, body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
