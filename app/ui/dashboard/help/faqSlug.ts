import { studentFaqSections } from '@/app/ui/dashboard/studentFaqData';

export function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, '')                  // drop ampersand entirely
    .replace(/[^a-z0-9]+/g, '-')        // any run of non-alphanumeric → single hyphen
    .replace(/^-+|-+$/g, '');           // trim leading/trailing hyphens
}

export function titleFromSlug(slug: string): string | null {
  const found = studentFaqSections.find((s) => slugFromTitle(s.title) === slug);
  return found?.title ?? null;
}

export function allSlugs(): string[] {
  return studentFaqSections.map((s) => slugFromTitle(s.title));
}
