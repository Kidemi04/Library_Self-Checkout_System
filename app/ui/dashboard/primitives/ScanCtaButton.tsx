import Link from 'next/link';
import clsx from 'clsx';
import { ArrowRightIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

type Variant = 'red' | 'green';
type Size = 'sm' | 'lg';

type ScanCtaButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  eyebrow?: string;
  title: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  red: 'bg-primary hover:bg-primary-active dark:bg-dark-primary dark:hover:bg-primary-active',
  green: 'bg-success hover:bg-success/90 dark:bg-success dark:hover:bg-success/90',
};

export default function ScanCtaButton({
  href,
  variant = 'red',
  size = 'lg',
  eyebrow = 'Self-Checkout',
  title,
  icon: Icon = QrCodeIcon,
  className,
}: ScanCtaButtonProps) {
  const isLg = size === 'lg';

  return (
    <Link
      href={href}
      className={clsx(
        'relative flex w-full items-center overflow-hidden text-on-primary transition-colors',
        VARIANT_CLASSES[variant],
        isLg ? 'gap-5 rounded-hero px-6 py-5' : 'gap-4 rounded-card px-5 py-5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas',
        className,
      )}
    >
      <div
        className={clsx(
          'absolute rounded-full bg-on-primary/8',
          isLg ? '-right-8 -top-8 h-40 w-40' : '-right-5 -top-5 h-36 w-36',
        )}
      />
      <div
        className={clsx(
          'flex flex-shrink-0 items-center justify-center rounded-card border border-on-primary/22 bg-on-primary/16',
          isLg ? 'h-14 w-14' : 'h-[52px] w-[52px]',
        )}
      >
        <Icon className={isLg ? 'h-7 w-7' : 'h-6 w-6'} strokeWidth={1.8} />
      </div>
      <div className="flex-1">
        <p className="font-mono text-caption-uppercase opacity-80">{eyebrow}</p>
        <p
          className={clsx(
            'font-display tracking-tight',
            isLg ? 'text-display-sm' : 'text-title-lg',
          )}
        >
          {title}
        </p>
      </div>
      <ArrowRightIcon className="h-5 w-5 opacity-80" />
    </Link>
  );
}
