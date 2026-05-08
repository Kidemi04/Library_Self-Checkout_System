// app/lib/motion/resolveColorToken.ts
import type { MilestoneColorToken } from './tokens';

const TOKEN_TO_HEX: Record<MilestoneColorToken, string> = {
  primary: '#C62828',
  'accent-teal': '#8FAF87',
  'accent-amber': '#D4A017',
  success: '#8FAF87',
};

export function resolveColorToken(name: MilestoneColorToken): string {
  return TOKEN_TO_HEX[name];
}

export function resolveAllMilestoneColors(): string[] {
  return Object.values(TOKEN_TO_HEX);
}
