import { cn } from '@/lib/utils';

const Bar = ({ className }: { className?: string }) => <div className={cn('animate-pulse rounded bg-ink/10', className)} />;

/** Reserves the ticket's footprint while chain reads load — no layout shift. */
export function TicketSkeleton({ size = 'sm' }: { size?: 'lg' | 'sm' }) {
    const lg = size === 'lg';
    return (
        <div className="ticket" aria-busy="true" aria-label="Loading pack">
            <div className={lg ? 'p-7' : 'p-5'}>
                <div className="flex items-center gap-3">
                    <Bar className="h-10 w-10 rounded-full" />
                    <Bar className="h-7 w-40" />
                </div>
                <Bar className={cn('mt-6', lg ? 'h-12 w-56' : 'h-8 w-36')} />
                <Bar className="mt-4 h-4 w-full rounded-full" />
                <Bar className="mt-2 h-3 w-20" />
            </div>
            <div className={cn('perforation bg-paper-deep/60', lg ? 'px-7 py-5' : 'px-5 py-4')}>
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <Bar key={i} className="h-8 w-12" />
                    ))}
                </div>
            </div>
        </div>
    );
}
