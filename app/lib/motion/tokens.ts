// app/lib/motion/tokens.ts
export const motionDuration = {
  instant: 0.1,
  quick: 0.2,
  base: 0.35,
  paper: 0.5,
  slow: 0.8,
  dramatic: 1.2,
} as const;

export const motionEase = {
  out: [0.4, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.6, 1] as const,
  inkWrite: [0.7, 0, 0.3, 1] as const,
} as const;

export const motionSpring = {
  paper: { type: 'spring', stiffness: 220, damping: 24 } as const,
  stamp: { type: 'spring', stiffness: 280, damping: 18 } as const,
  milestone: { type: 'spring', stiffness: 350, damping: 12 } as const,
} as const;

export const motionTap = { scale: 0.96, duration: 0.12 } as const;

export const motionHover = {
  lift: 2,
  cardLift: 4,
  duration: 0.18,
} as const;

export const motionDistance = {
  paperRise: 8,
  popUp: 12,
} as const;

export const motionStagger = {
  list: 0.04,
  cards: 0.08,
} as const;

export const milestoneColors = ['primary', 'accent-teal', 'accent-amber', 'success'] as const;
export type MilestoneColorToken = (typeof milestoneColors)[number];
