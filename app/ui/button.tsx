import { cn } from '@/app/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

export function Button({ children, className, variant = 'default', ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        {
          'bg-blue-500 text-white hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600':
            variant === 'default',
          'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-500':
            variant === 'outline',
          'text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-500': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-400 focus-visible:outline-red-500 active:bg-red-600':
            variant === 'destructive',
        },
        className,
      )}
    >
      {children}
    </button>
  );
}
