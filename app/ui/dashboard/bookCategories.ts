export const CATEGORY_OPTIONS = [
  { key: 'all',         label: 'All' },
  { key: 'computing',   label: 'Computing' },
  { key: 'design',      label: 'Design' },
  { key: 'business',    label: 'Business' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'psychology',  label: 'Psychology' },
  { key: 'self-help',   label: 'Self-help' },
  { key: 'history',     label: 'History' },
] as const;

export type CategoryKey = typeof CATEGORY_OPTIONS[number]['key'];
