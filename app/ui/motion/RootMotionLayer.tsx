'use client';
import { useState, createContext, useContext, type ReactNode } from 'react';
import { MilestoneBurst, type MilestonePayload } from './MilestoneBurst';

type Ctx = {
  fireMilestone: (m: MilestonePayload) => void;
};

const MotionLayerContext = createContext<Ctx | null>(null);

export function useMotionLayer(): Ctx {
  const ctx = useContext(MotionLayerContext);
  if (!ctx) throw new Error('useMotionLayer must be inside <RootMotionLayer>');
  return ctx;
}

export function RootMotionLayer({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<MilestonePayload | null>(null);

  return (
    <MotionLayerContext.Provider value={{ fireMilestone: setActive }}>
      {children}
      <MilestoneBurst
        trigger={active !== null}
        milestone={active ?? undefined}
        onClose={() => setActive(null)}
      />
    </MotionLayerContext.Provider>
  );
}
