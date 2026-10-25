import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressPotProps {
    value: number; // 0..1
    className?: string;
    label?: string;
}

/** The pot filling up — a ruled track with tick marks, filled with Doge yellow on a spring. */
export function ProgressPot({ value, className, label = 'Pot progress' }: ProgressPotProps) {
    const reduce = useReducedMotion();
    const pct = Math.round(value * 100);
    return (
        <div className={cn('relative', className)}>
            <div
                role="progressbar"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                className="relative h-4 overflow-hidden rounded-full border-[1.5px] border-ink bg-paper-deep"
            >
                <motion.div
                    className="absolute inset-y-0 left-0 bg-doge"
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 0.8 }}
                >
                    <div className="absolute inset-y-0 right-0 w-[1.5px] bg-ink" />
                </motion.div>
                <div aria-hidden className="absolute inset-0 flex justify-between px-[12.5%]">
                    {[0, 1, 2].map((i) => (
                        <span key={i} className="h-full w-px bg-ink/20" />
                    ))}
                </div>
            </div>
        </div>
    );
}
