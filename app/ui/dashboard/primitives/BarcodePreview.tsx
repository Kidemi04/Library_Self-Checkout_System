export default function BarcodePreview({ barcodes }: { barcodes: string[] | null }) {
  if (barcodes === null) {
    return (
      <div className="rounded-card border border-dashed border-hairline bg-canvas p-6 font-mono text-caption text-muted dark:border-dark-hairline dark:bg-dark-canvas dark:text-on-dark-soft">
        Loading next available barcodes…
      </div>
    );
  }
  if (barcodes.length === 0) return null;

  const first = barcodes[0];
  const last = barcodes[barcodes.length - 1];
  const display = barcodes.length === 1 ? first : `${first} … ${last}`;

  return (
    <div className="rounded-card border border-hairline bg-canvas p-6 dark:border-dark-hairline dark:bg-dark-canvas">
      <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
        Will create {barcodes.length} barcode{barcodes.length === 1 ? '' : 's'}
      </p>
      <p className="mt-1 font-mono text-code text-ink dark:text-on-dark">{display}</p>
    </div>
  );
}
