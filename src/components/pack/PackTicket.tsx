import { Link } from 'react-router-dom';
import { potProgress, timeLeft } from '@/lib/pack';
import { cn } from '@/lib/utils';
import { Amount } from './Amount';
import { ProgressPot } from './ProgressPot';
import { StatusChip } from './StatusChip';
import { TicketStub } from './TicketStub';
import type { TicketView } from './ticketView';

interface PackTicketProps {
    view: TicketView;
    size?: 'lg' | 'sm';
    className?: string;
    /** Banner shown across the top, e.g. for a sample ticket. */
    ribbon?: string;
}

/** The pack card: a physical ticket with the pot on top and the rules on the stub. */
export function PackTicket({ view, size = 'lg', className, ribbon }: PackTicketProps) {
    const lg = size === 'lg';
    const body = (
        <article className={cn('ticket overflow-visible', lg ? 'p-0' : 'p-0 transition-transform duration-200 ease-out group-hover:-translate-y-1', className)}>
            {ribbon && (
                <div className="rounded-t-[8px] border-b-[1.5px] border-ink bg-ink px-4 py-1.5 text-center font-mono text-[10.5px] uppercase tracking-[0.2em] text-doge">{ribbon}</div>
            )}
            <div className={cn(lg ? 'p-6 sm:p-7' : 'p-5')}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className={cn('grid shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-doge', lg ? 'h-12 w-12 text-2xl' : 'h-10 w-10 text-xl')} aria-hidden>
                            {view.emoji}
                        </span>
                        <h3 className={cn('truncate font-display leading-none', lg ? 'text-[2rem] sm:text-[2.4rem]' : 'text-[1.6rem]')}>{view.name}</h3>
                    </div>
                    <StatusChip status={view.status} balance={view.balance} className="mt-1 shrink-0" />
                </div>
                {view.story && lg && <p className="mt-3 max-w-md text-[15px] leading-snug text-ink-soft">{view.story}</p>}

                <div className={cn('flex items-end justify-between gap-3', lg ? 'mt-7' : 'mt-5')}>
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">In the pot</div>
                        <Amount wei={view.pot} className={cn('block leading-none', lg ? 'mt-1 text-[2.75rem] sm:text-[3.25rem]' : 'mt-1 text-[1.9rem]')} />
                    </div>
                    <div className="pb-1 text-right font-mono text-xs text-ink-soft">
                        of <Amount wei={view.goal} digits={0} className="text-ink" unitClassName="text-[0.85em]" />
                    </div>
                </div>
                <ProgressPot value={potProgress({ totalContributed: view.pot, goal: view.goal })} className="mt-3" />
                <div className="mt-2 font-mono text-[11px] text-ink-soft">{timeLeft(view.deadline)}</div>
            </div>
            <TicketStub view={view} compact={!lg} />
        </article>
    );

    if (!view.address) return body;
    return (
        <Link to={`/pack/${view.address}`} className="group block rounded-[10px] focus-visible:outline-offset-4" aria-label={`Open ${view.name}`}>
            {body}
        </Link>
    );
}
