import { computeNextBarcodes } from '@/app/lib/barcode';

describe('computeNextBarcodes', () => {
  it('starts at 00001 when no SWI- barcodes exist', () => {
    expect(computeNextBarcodes([], 3)).toEqual(['SWI-00001', 'SWI-00002', 'SWI-00003']);
  });
  it('continues after the highest existing SWI- numeric suffix', () => {
    expect(computeNextBarcodes(['SWI-00100', 'SWI-00050'], 2)).toEqual(['SWI-00101', 'SWI-00102']);
  });
  it('ignores non-SWI prefix and malformed barcodes', () => {
    expect(computeNextBarcodes(['ABC-00200', 'SWI-foo', 'SWI-00012'], 1)).toEqual(['SWI-00013']);
  });
  it('pads to 5 digits but allows overflow past 99999', () => {
    expect(computeNextBarcodes(['SWI-99999'], 2)).toEqual(['SWI-100000', 'SWI-100001']);
  });
  it('throws if count <= 0', () => {
    expect(() => computeNextBarcodes([], 0)).toThrow();
  });
  it('throws if count > 20', () => {
    expect(() => computeNextBarcodes([], 21)).toThrow();
  });
});
