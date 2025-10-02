interface SearchFormProps {
  action: string;
  placeholder: string;
  defaultValue?: string;
  name?: string;
  'aria-label'?: string;
}

export default function SearchForm({
  action,
  placeholder,
  defaultValue,
  name = 'q',
  'aria-label': ariaLabel,
}: SearchFormProps) {
  const inputId = `${name}-search`;

  return (
    <form
      action={action}
      className="flex flex-col gap-2 rounded-xl border border-swin-charcoal/10 bg-white p-3 shadow-sm shadow-swin-charcoal/5 md:flex-row md:items-center"
    >
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel ?? 'Search'}
      </label>
      <input
        id={inputId}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg border border-swin-charcoal/20 bg-swin-charcoal px-4 py-2 text-sm font-semibold text-swin-ivory transition hover:border-swin-red hover:bg-swin-red"
      >
        Search
      </button>
    </form>
  );
}
