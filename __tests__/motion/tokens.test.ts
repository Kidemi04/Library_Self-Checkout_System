// __tests__/motion/tokens.test.ts
import {
  motionDuration,
  motionEase,
  motionSpring,
  motionTap,
  motionHover,
  motionDistance,
  motionStagger,
  milestoneColors,
} from '@/app/lib/motion/tokens';

describe('motion tokens', () => {
  test('duration values are seconds and monotonically increase', () => {
    expect(motionDuration.instant).toBe(0.1);
    expect(motionDuration.quick).toBe(0.2);
    expect(motionDuration.base).toBe(0.35);
    expect(motionDuration.paper).toBe(0.5);
    expect(motionDuration.slow).toBe(0.8);
    expect(motionDuration.dramatic).toBe(1.2);
  });

  test('eases are non-linear cubic-bezier tuples', () => {
    expect(motionEase.out).toEqual([0.4, 0, 0.2, 1]);
    expect(motionEase.inOut).toEqual([0.4, 0, 0.6, 1]);
    expect(motionEase.inkWrite).toEqual([0.7, 0, 0.3, 1]);
  });

  test('springs declare type spring with stiffness and damping', () => {
    expect(motionSpring.paper).toMatchObject({ type: 'spring', stiffness: 220, damping: 24 });
    expect(motionSpring.stamp).toMatchObject({ type: 'spring', stiffness: 280, damping: 18 });
    expect(motionSpring.milestone).toMatchObject({ type: 'spring', stiffness: 350, damping: 12 });
  });

  test('tap and hover values', () => {
    expect(motionTap).toEqual({ scale: 0.96, duration: 0.12 });
    expect(motionHover).toEqual({ lift: 2, cardLift: 4, duration: 0.18 });
  });

  test('distance and stagger values', () => {
    expect(motionDistance.paperRise).toBe(8);
    expect(motionDistance.popUp).toBe(12);
    expect(motionStagger.list).toBe(0.04);
    expect(motionStagger.cards).toBe(0.08);
  });

  test('milestoneColors references Tailwind token names only', () => {
    expect(milestoneColors).toEqual(['primary', 'accent-teal', 'accent-amber', 'success']);
  });
});
