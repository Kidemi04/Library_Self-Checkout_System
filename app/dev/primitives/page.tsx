import { Button } from '@/app/ui/button';
import Chip from '@/app/ui/dashboard/primitives/Chip';
import StatusBadge from '@/app/ui/dashboard/primitives/StatusBadge';
import KpiCard from '@/app/ui/dashboard/primitives/KpiCard';

export default function PrimitivesGalleryPage() {
  return (
    <div className="min-h-screen">
      <Section title="Light theme" themeClass="bg-canvas text-ink">
        <Gallery />
      </Section>
      <Section title="Dark theme" themeClass="dark bg-dark-canvas text-on-dark">
        <Gallery />
      </Section>
    </div>
  );
}

function Section({
  title,
  themeClass,
  children,
}: {
  title: string;
  themeClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className={themeClass}>
      <div className="mx-auto max-w-6xl px-8 py-section">
        <h1 className="mb-12 font-display text-display-lg">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <div className="space-y-12">
      {/* Buttons */}
      <div>
        <h2 className="mb-4 font-sans text-caption-uppercase text-muted">Buttons</h2>
        <div className="flex gap-3">
          <Button>Primary action</Button>
          <Button disabled aria-disabled>Disabled</Button>
        </div>
      </div>

      {/* Chips */}
      <div>
        <h2 className="mb-4 font-sans text-caption-uppercase text-muted">Chips</h2>
        <div className="flex flex-wrap gap-2">
          <Chip>default</Chip>
          <Chip tone="danger">danger</Chip>
          <Chip tone="gold">gold</Chip>
          <Chip tone="success">success</Chip>
          <Chip tone="warn">warn</Chip>
          <Chip mono>BARCODE-123</Chip>
        </div>
      </div>

      {/* Status badges */}
      <div>
        <h2 className="mb-4 font-sans text-caption-uppercase text-muted">Status badges</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="READY" />
          <StatusBadge status="QUEUED" />
          <StatusBadge status="AVAILABLE" />
          <StatusBadge status="ON_LOAN" />
          <StatusBadge status="OVERDUE" />
          <StatusBadge status="RETURNED" />
          <StatusBadge status="CANCELLED" />
          <StatusBadge status="DAMAGED" />
          <StatusBadge status="BORROWED" />
        </div>
      </div>

      {/* KPI cards */}
      <div>
        <h2 className="mb-4 font-sans text-caption-uppercase text-muted">KPI cards</h2>
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="BORROWED" value="42" delta="+5" positive />
          <KpiCard label="OVERDUE" value="3" delta="−2" danger />
          <KpiCard label="AVAILABLE" value="187" />
        </div>
      </div>

      {/* Typography ladder */}
      <div>
        <h2 className="mb-4 font-sans text-caption-uppercase text-muted">Typography</h2>
        <div className="space-y-4">
          <p className="font-display text-display-xl">display-xl 64</p>
          <p className="font-display text-display-lg">display-lg 48</p>
          <p className="font-display text-display-md">display-md 36</p>
          <p className="font-display text-display-sm">display-sm 28</p>
          <p className="font-sans text-title-lg">title-lg 22</p>
          <p className="font-sans text-title-md">title-md 18</p>
          <p className="font-sans text-title-sm">title-sm 16</p>
          <p className="font-sans text-body-md">body-md 16 — running text default. The quick brown fox jumps over the lazy dog.</p>
          <p className="font-sans text-body-sm">body-sm 14 — secondary running text.</p>
          <p className="font-sans text-caption">caption 13</p>
          <p className="font-sans text-caption-uppercase">caption-uppercase 12</p>
          <p className="font-mono text-code">code 14 — 9780134685991</p>
        </div>
      </div>

      {/* Color tokens swatch */}
      <div>
        <h2 className="mb-4 font-sans text-caption-uppercase text-muted">Color tokens</h2>
        <div className="grid grid-cols-6 gap-2 text-caption">
          <Swatch className="bg-canvas border border-hairline" label="canvas" />
          <Swatch className="bg-surface-soft" label="surface-soft" />
          <Swatch className="bg-surface-card" label="surface-card" />
          <Swatch className="bg-surface-cream-strong" label="cream-strong" />
          <Swatch className="bg-primary text-on-primary" label="primary" />
          <Swatch className="bg-primary-active text-on-primary" label="primary-active" />
          <Swatch className="bg-success text-on-primary" label="success" />
          <Swatch className="bg-warning text-ink" label="warning" />
          <Swatch className="bg-error text-on-primary" label="error" />
          <Swatch className="bg-accent-teal text-on-primary" label="accent-teal" />
          <Swatch className="bg-accent-amber text-ink" label="accent-amber" />
          <Swatch className="bg-ink text-on-dark" label="ink" />
        </div>
      </div>
    </div>
  );
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className={`${className} rounded-btn h-16 flex items-end p-2 font-sans text-caption`}>
      {label}
    </div>
  );
}
