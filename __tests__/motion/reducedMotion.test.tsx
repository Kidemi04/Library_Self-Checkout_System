// __tests__/motion/reducedMotion.test.tsx
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

function setMediaQueryMock(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, cb: any) => listeners.add(cb),
    removeEventListener: (_: string, cb: any) => listeners.delete(cb),
    dispatchEvent: (e: MediaQueryListEvent) => {
      listeners.forEach((cb) => cb(e));
      return true;
    },
  } as unknown as MediaQueryList;
  window.matchMedia = jest.fn().mockReturnValue(mql);
  return mql;
}

describe('usePrefersReducedMotion', () => {
  test('returns false when system prefers default motion', () => {
    setMediaQueryMock(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  test('returns true when system prefers reduced motion', () => {
    setMediaQueryMock(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  test('updates when media query change event fires', () => {
    const mql = setMediaQueryMock(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    act(() => {
      (mql as any).matches = true;
      (mql as any).dispatchEvent({ matches: true } as MediaQueryListEvent);
    });
    expect(result.current).toBe(true);
  });
});
