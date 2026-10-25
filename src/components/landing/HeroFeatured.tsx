import { PackTicket } from '@/components/pack/PackTicket';
import { Stamp } from '@/components/pack/Stamp';
import { TicketSkeleton } from '@/components/pack/TicketSkeleton';
import { toTicketView } from '@/components/pack/ticketView';
import type { PackSummary } from '@/lib/pack';
import { ReceiptStrip } from './ReceiptStrip';
import { SAMPLE_TICKET } from './samplePack';

interface HeroFeaturedProps {
    featured?: PackSummary;
    loading: boolean;
}

/** The hero object: a live pack ticket, stamped, with its receipt tucked underneath. */
export function HeroFeatured({ featured, loading }: HeroFeaturedProps) {
    if (loading) return <TicketSkeleton size="lg" />;
    const live = !!featured;
    return (
        <div className="relative">
            <div className="relative z-10 animate-rise [animation-delay:120ms] sm:-rotate-[1.5deg]">
                <PackTicket view={live ? toTicketView(featured) : SAMPLE_TICKET} ribbon={live ? undefined : 'Sample ticket · not on chain'} />
                <Stamp press tone={live ? 'stamp' : 'ink'} className="absolute -right-2 -top-7 z-20 h-[92px] w-[92px] text-[10px] sm:-right-6" rotate={-14}>
                    {live ? (
                        <>
                            On
                            <br />
                            chain
                        </>
                    ) : (
                        'Sample'
                    )}
                </Stamp>
            </div>
            <ReceiptStrip
                pack={featured?.address}
                fromBlock={featured?.createdBlock}
                className="relative z-0 ml-auto mr-2 -mt-3 w-[90%] animate-rise pt-7 [animation-delay:280ms] sm:rotate-[1deg]"
            />
        </div>
    );
}
