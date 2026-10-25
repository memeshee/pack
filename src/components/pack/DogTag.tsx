import { cn } from '@/lib/utils';

/** Deterministic tag tint from an address so the same backer always looks the same. */
const TINTS = ['bg-doge', 'bg-sky', 'bg-paper-deep', 'bg-moss text-paper-light', 'bg-stamp text-paper-light'];
const tintFor = (seed: string) => TINTS[parseInt(seed.slice(-2), 16) % TINTS.length];

interface DogTagProps {
    seed: string;
    label: string;
    className?: string;
    empty?: boolean;
}

/** A backer, rendered as a small notched dog tag. */
export function DogTag({ seed, label, className, empty }: DogTagProps) {
    return (
        <span
            className={cn(
                'relative inline-flex h-8 min-w-8 items-center justify-center rounded-[6px] border-[1.5px] border-ink pl-3 pr-2 font-mono text-[11px] font-semibold uppercase',
                empty ? 'border-dashed border-ink/35 bg-transparent text-ink-faint' : tintFor(seed),
                className,
            )}
            title={empty ? 'Open spot' : seed}
        >
            <span aria-hidden className={cn('absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full', empty ? 'bg-ink/20' : 'bg-ink')} />
            {label}
        </span>
    );
}
