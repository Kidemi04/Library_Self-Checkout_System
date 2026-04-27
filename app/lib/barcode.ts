const PREFIX = 'SWI-';
const PAD = 5;

export function computeNextBarcodes(existing: string[], count: number): string[] {
  if (count <= 0) throw new Error('count must be >= 1');
  if (count > 20) throw new Error('count must be <= 20');

  let max = 0;
  for (const code of existing) {
    if (!code?.startsWith(PREFIX)) continue;
    const tail = code.slice(PREFIX.length);
    if (!/^\d+$/.test(tail)) continue;
    const num = parseInt(tail, 10);
    if (num > max) max = num;
  }

  const result: string[] = [];
  for (let i = 1; i <= count; i++) {
    const num = max + i;
    result.push(PREFIX + num.toString().padStart(PAD, '0'));
  }
  return result;
}
