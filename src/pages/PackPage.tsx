import { Link, useParams, useSearchParams } from 'react-router-dom';
import { isAddress, type Address } from 'viem';
import { AppShell } from '@/components/layout/AppShell';
import { ReceiptStrip } from '@/components/landing/ReceiptStrip';
import { AddressText } from '@/components/pack/AddressText';
import { Amount } from '@/components/pack/Amount';
import { PackButton } from '@/components/pack/PackButton';
import { PackTicket } from '@/components/pack/PackTicket';
import { TicketSkeleton } from '@/components/pack/TicketSkeleton';
import { toTicketView } from '@/components/pack/ticketView';
import { usePackSummary } from '@/hooks/usePacks';
import { decodeMetadataParam } from '@/lib/metadata';

/** Read-only pack view from chain state. Actions (chip in / approve / release / refund) ship next. */
const PackPage = () => {
    const { address = '' } = useParams();
    const [params] = useSearchParams();
    const valid = isAddress(address);
    const { data: pack, isLoading, isError } = usePackSummary(valid ? (address as Address) : undefined);

    if (!valid || isError) {
        return (
            <AppShell>
                <section className="container max-w-xl py-24">
                    <div className="ticket p-8">
                        <h1 className="font-display text-4xl">We can't find that pack.</h1>
                        <p className="mt-3 text-ink-soft">The link might be cut off, or that address isn't a Pack on DogeOS testnet.</p>
                        <PackButton asChild className="mt-6"><Link to="/">See live packs</Link></PackButton>
                    </div>
                </section>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <section className="container grid gap-10 py-10 lg:grid-cols-[1.25fr_1fr] lg:py-14">
                <div>
                    {isLoading || !pack ? <TicketSkeleton size="lg" /> : <PackTicket view={toTicketView(pack, decodeMetadataParam(params.get('m')))} />}
                    {pack && (
                        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-[0.08em]">
                            <dt className="text-ink-soft">Balance</dt>
                            <dd className="text-right"><Amount wei={pack.balance} /></dd>
                            <dt className="text-ink-soft">Paid out</dt>
                            <dd className="text-right"><Amount wei={pack.totalPaidOut} /></dd>
                            <dt className="text-ink-soft">Pack contract</dt>
                            <dd className="text-right normal-case"><AddressText address={pack.address} link /></dd>
                            <dt className="text-ink-soft">Organizer</dt>
                            <dd className="text-right normal-case"><AddressText address={pack.creator} link /></dd>
                        </dl>
                    )}
                </div>
                <div>
                    <h2 className="font-display text-3xl">The receipt</h2>
                    <ReceiptStrip pack={pack?.address} fromBlock={pack?.createdBlock} limit={25} className="mt-4" />
                </div>
            </section>
        </AppShell>
    );
};

export default PackPage;
