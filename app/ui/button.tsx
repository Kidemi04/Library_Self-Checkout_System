import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex h-10 items-center rounded-btn bg-primary px-5 font-sans text-button text-on-primary transition-colors',
        'hover:bg-primary-active active:bg-primary-active active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'dark:focus-visible:ring-offset-dark-canvas',
        'aria-disabled:cursor-not-allowed aria-disabled:bg-primary-disabled aria-disabled:text-muted',
        'dark:bg-dark-primary dark:hover:bg-primary-active',
        className,
      )}
    >
      {children}
    </button>
  );
}
