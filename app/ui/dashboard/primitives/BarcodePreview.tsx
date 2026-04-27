export default function BarcodePreview({ barcodes }: { barcodes: string[] | null }) {
  if (barcodes === null) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs font-mono text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
        Loading next available barcodes…
      </div>
    );
  }
  if (barcodes.length === 0) return null;

  const first = barcodes[0];
  const last = barcodes[barcodes.length - 1];
  const display = barcodes.length === 1 ? first : `${first} … ${last}`;

  return (
    <div className="rounded-lg border border-swin-charcoal/10 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
      <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-swin-charcoal/45 dark:text-white/45">
        Will create {barcodes.length} barcode{barcodes.length === 1 ? '' : 's'}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold text-swin-charcoal dark:text-white">{display}</p>
    </div>
  );
}
