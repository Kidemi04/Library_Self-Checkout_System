'use client';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { motionTap, motionHover, motionSpring } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export type MotionButtonVariant = 'primary' | 'secondary' | 'icon' | 'destructive';
export type MotionButtonState = 'idle' | 'pending' | 'success' | 'error';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: MotionButtonVariant;
  state?: MotionButtonState;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
};

const VARIANT_CLASSES: Record<MotionButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:shadow-md',
  secondary: 'bg-canvas text-ink border border-hairline hover:border-ink',
  icon: 'bg-transparent text-ink rounded-pill h-9 w-9',
  destructive: 'bg-error text-on-primary hover:bg-error/90',
};

const BASE_CLASSES =
  'relative inline-flex items-center justify-center gap-2 rounded-btn px-5 h-10 text-button font-medium ' +
  'transition-colors duration-[180ms] outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

export const MotionButton = forwardRef<HTMLButtonElement, Props>(function MotionButton(
  { variant = 'primary', state = 'idle', className, children, type = 'button', disabled, ...rest },
  ref,
) {
  const reduced = usePrefersReducedMotion();
  const isPending = state === 'pending';
  const isDisabled = disabled || isPending;

  const tapScale = variant === 'icon' ? 0.92 : variant === 'secondary' ? 0.97 : motionTap.scale;
  const hoverY = variant === 'icon' ? 0 : -motionHover.lift;

  const motionProps: HTMLMotionProps<'button'> = reduced
    ? {}
    : {
        whileTap: { scale: tapScale, transition: motionSpring.stamp },
        whileHover: isDisabled ? undefined : { y: hoverY, transition: { duration: motionHover.duration } },
      };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={clsx(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      data-state={state}
      {...motionProps}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
