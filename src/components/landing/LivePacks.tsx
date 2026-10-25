import { Link } from 'react-router-dom';
import { PackButton } from '@/components/pack/PackButton';
import { PackTicket } from '@/components/pack/PackTicket';
import { TicketSkeleton } from '@/components/pack/TicketSkeleton';
import { toTicketView } from '@/components/pack/ticketView';
import type { PackSummary } from '@/lib/pack';

interface LivePacksProps {
    packs?: PackSummary[];
    loading: boolean;
    error: boolean;
    onRetry: () => void;
}

/** Recent packs straight from the factory, with loading / empty / error states. */
export function LivePacks({ packs, loading, error, onRetry }: LivePacksProps) {
    return (
        <section id="live" aria-labelledby="live-title" className="container scroll-mt-24 pt-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">Newest first · refreshes every block</p>
                    <h2 id="live-title" className="mt-2 font-display text-4xl leading-none sm:text-5xl">
                        Packs on the chain
                    </h2>
                </div>
                <Link to="/create" className="text-sm font-semibold underline decoration-doge decoration-[3px] underline-offset-[6px]">
                    Start your own →
                </Link>
            </div>

            <div className="mt-10">
                {loading ? (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2].map((i) => (
                            <TicketSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="ticket flex flex-col items-start gap-3 p-6">
                        <p className="font-display text-2xl">We couldn't reach DogeOS.</p>
                        <p className="text-sm text-ink-soft">The testnet RPC didn't answer. Your DOGE is safe — this is just a read.</p>
                        <PackButton size="sm" variant="secondary" onClick={onRetry}>Try again</PackButton>
                    </div>
                ) : !packs?.length ? (
                    <div className="ticket flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-display text-2xl">No packs yet. Yours could be the first.</p>
                            <p className="mt-1 text-sm text-ink-soft">It takes about a minute and one link to share.</p>
                        </div>
                        <PackButton asChild>
                            <Link to="/create">Start a pack</Link>
                        </PackButton>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {packs.map((p) => (
                            <PackTicket key={p.address} view={toTicketView(p)} size="sm" />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
