import { slugFromTitle, titleFromSlug, allSlugs } from '@/app/ui/dashboard/help/faqSlug';
import { studentFaqSections } from '@/app/ui/dashboard/studentFaqData';

describe('slugFromTitle', () => {
  test('lowercases and replaces spaces with hyphens', () => {
    expect(slugFromTitle('Returning Books')).toBe('returning-books');
    expect(slugFromTitle('How to Borrow a Book')).toBe('how-to-borrow-a-book');
    expect(slugFromTitle('Holds & Reservations')).toBe('holds-reservations');
  });
});

describe('titleFromSlug', () => {
  test('round-trips every real FAQ section title', () => {
    for (const section of studentFaqSections) {
      const slug = slugFromTitle(section.title);
      expect(titleFromSlug(slug)).toBe(section.title);
    }
  });

  test('returns null for unknown slug', () => {
    expect(titleFromSlug('not-a-real-slug')).toBeNull();
  });
});

describe('allSlugs', () => {
  test('returns one slug per FAQ section', () => {
    expect(allSlugs()).toHaveLength(studentFaqSections.length);
  });
});
