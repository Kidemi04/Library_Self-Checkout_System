import type { MilestonePayload } from '@/app/ui/motion/MilestoneBurst';

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  milestone?: MilestonePayload;
};

export const initialActionState: ActionState = {
  status: 'idle',
  message: '',
};
