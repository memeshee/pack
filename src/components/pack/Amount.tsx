import { formatDoge } from '@/lib/pack';
import { cn } from '@/lib/utils';

interface AmountProps {
    wei: bigint;
    className?: string;
    unitClassName?: string;
    digits?: number;
    showUnit?: boolean;
}

/** DOGE amount set in mono numerals with a small unit. */
export function Amount({ wei, className, unitClassName, digits = 2, showUnit = true }: AmountProps) {
    return (
        <span className={cn('font-mono tabular-nums tracking-tight', className)}>
            {formatDoge(wei, digits)}
            {showUnit && <span className={cn('ml-1 text-[0.55em] font-medium uppercase tracking-widest text-ink-soft', unitClassName)}>DOGE</span>}
        </span>
    );
}
