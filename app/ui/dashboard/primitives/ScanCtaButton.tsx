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

const GRADIENTS: Record<Variant, string> = {
  red: 'linear-gradient(120deg, #A81C2A 0%, #C82333 60%, #E85566 100%)',
  green: 'linear-gradient(120deg, #1F6E47 0%, #2F8F5A 60%, #58B483 100%)',
};

const SHADOWS: Record<Variant, string> = {
  red: '0 16px 40px rgba(200,35,51,0.2)',
  green: '0 16px 40px rgba(47,143,90,0.2)',
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
        'relative flex w-full items-center overflow-hidden text-white',
        isLg ? 'gap-5 rounded-2xl px-6 py-5' : 'gap-4 rounded-[18px] px-5 py-5',
        className,
      )}
      style={{ background: GRADIENTS[variant], boxShadow: SHADOWS[variant] }}
    >
      <div
        className={clsx(
          'absolute rounded-full bg-white/8',
          isLg ? '-right-8 -top-8 h-40 w-40' : '-right-5 -top-5 h-36 w-36',
        )}
      />
      <div
        className={clsx(
          'flex flex-shrink-0 items-center justify-center rounded-[14px] border border-white/22 bg-white/16',
          isLg ? 'h-14 w-14' : 'h-[52px] w-[52px]',
        )}
      >
        <Icon className={isLg ? 'h-7 w-7' : 'h-6 w-6'} strokeWidth={1.8} />
      </div>
      <div className="flex-1">
        <p
          className={clsx(
            'font-mono font-bold uppercase tracking-[2px] opacity-80',
            isLg ? 'text-[10px]' : 'text-[10px] tracking-[1.8px] opacity-75',
          )}
        >
          {eyebrow}
        </p>
        <p
          className={clsx(
            'font-display font-semibold tracking-tight',
            isLg ? 'text-[24px]' : 'text-[22px]',
          )}
        >
          {title}
        </p>
      </div>
      <ArrowRightIcon className="h-5 w-5 opacity-80" />
    </Link>
  );
}
