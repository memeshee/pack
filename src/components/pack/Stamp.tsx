import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StampProps {
    children: React.ReactNode;
    className?: string;
    tone?: 'stamp' | 'moss' | 'ink';
    /** Animate the press on mount. */
    press?: boolean;
    rotate?: number;
}

const TONES = { stamp: 'text-stamp border-stamp', moss: 'text-moss border-moss', ink: 'text-ink border-ink' };

/** A red rubber stamp. Presses down with a little overshoot when `press` is set. */
export function Stamp({ children, className, tone = 'stamp', press = false, rotate = -12 }: StampProps) {
    const reduce = useReducedMotion();
    const animated = press && !reduce;
    return (
        <motion.div
            initial={animated ? { scale: 1.9, opacity: 0, rotate: rotate - 8 } : false}
            animate={{ scale: 1, opacity: 0.92, rotate }}
            transition={{ type: 'spring', stiffness: 520, damping: 22, mass: 0.7 }}
            className={cn(
                'pointer-events-none inline-flex select-none items-center justify-center rounded-full border-[3px] p-1 mix-blend-multiply',
                TONES[tone],
                className,
            )}
            aria-hidden
        >
            <div className={cn('flex h-full w-full flex-col items-center justify-center rounded-full border-[1.5px] px-3 text-center font-sans font-extrabold uppercase leading-none tracking-[0.18em]', TONES[tone])}>
                {children}
            </div>
        </motion.div>
    );
}
