import Image from 'next/image';
import { cn } from '@/app/lib/utils';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, fallback, size = 'md', className }: AvatarProps) {
  // Get initials from name or use fallback
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : fallback?.toUpperCase().slice(0, 2) || '??';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  if (src) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-gray-200',
          sizeClasses[size],
          className,
        )}
      >
        <Image src={src} alt={name || ''} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-swin-red text-white font-medium',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}