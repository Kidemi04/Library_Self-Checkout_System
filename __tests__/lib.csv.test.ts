import { toCsv } from '@/app/lib/csv';

describe('toCsv', () => {
  it('serializes a simple table with header and BOM', () => {
    const result = toCsv(
      ['name', 'age'],
      [['Alice', 30], ['Bob', 25]],
    );
    expect(result).toBe('﻿name,age\nAlice,30\nBob,25\n');
  });

  it('quotes fields containing commas', () => {
    const result = toCsv(['city'], [['Kuching, Sarawak']]);
    expect(result).toBe('﻿city\n"Kuching, Sarawak"\n');
  });

  it('escapes embedded double quotes by doubling them', () => {
    const result = toCsv(['quote'], [['She said "hi"']]);
    expect(result).toBe('﻿quote\n"She said ""hi"""\n');
  });

  it('quotes fields containing newlines', () => {
    const result = toCsv(['note'], [['line1\nline2']]);
    expect(result).toBe('﻿note\n"line1\nline2"\n');
  });

  it('renders null and undefined as empty string', () => {
    const result = toCsv(['a', 'b'], [[null, undefined]]);
    expect(result).toBe('﻿a,b\n,\n');
  });

  it('renders Date objects as ISO date YYYY-MM-DD', () => {
    const d = new Date('2026-04-28T10:00:00Z');
    const result = toCsv(['date'], [[d]]);
    expect(result).toBe('﻿date\n2026-04-28\n');
  });

  it('handles empty rows array', () => {
    const result = toCsv(['x', 'y'], []);
    expect(result).toBe('﻿x,y\n');
  });
});
