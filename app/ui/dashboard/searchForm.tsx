import clsx from 'clsx';
import { MotionButton } from '@/app/ui/motion/MotionButton';

interface SearchFormProps {
  action?: string;
  placeholder?: string;
  defaultValue?: string;
  name?: string;
  extraParams?: Record<string, string | undefined>;
  'aria-label'?: string;
  className?: string;
}

export default function SearchForm({
  action = "/dashboard/book/items",
  placeholder = "Search by title, author, ISBN, or barcode",
  defaultValue,
  name = 'q',
  extraParams,
  'aria-label': ariaLabel,
  className,
}: SearchFormProps) {
  const inputId = `${name}-search`;

  return (
    <form
      action={action}
      className={clsx(
        'flex flex-col gap-2 rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card p-3 md:flex-row md:items-center',
        className,
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel ?? 'Search'}
      </label>
      <input
        id={inputId}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        suppressHydrationWarning
        className="flex-1 rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
      />

      {/* Preserve extra query params */}
      {extraParams &&
        Object.entries(extraParams).map(([key, value]) =>
          value ? (
            <input key={key} type="hidden" name={key} value={value} />
          ) : null
        )}

      <MotionButton
        variant="primary"
        type="submit"
        suppressHydrationWarning
      >
        Search
      </MotionButton>
    </form>
  );
}
