import { Link } from 'react-router-dom';
import type { Address } from 'viem';
import { AppShell } from '@/components/layout/AppShell';
import { PackButton } from '@/components/pack/PackButton';
import { PackTicket } from '@/components/pack/PackTicket';
import { TicketSkeleton } from '@/components/pack/TicketSkeleton';
import { toTicketView } from '@/components/pack/ticketView';
import { useMyPacks } from '@/hooks/usePacks';
import { useWalletControls } from '@/hooks/useWalletControls';

/** Packs this wallet organized or backed — read from the factory's on-chain registry. */
const MyPacksPage = () => {
    const w = useWalletControls();
    const { data, isLoading, isError, refetch } = useMyPacks(w.address as Address | undefined);

    let body: React.ReactNode;
    if (!w.isConnected) {
        body = (
            <div className="ticket flex flex-col items-start gap-4 p-6">
                <p className="font-display text-2xl">Sign in to see your packs.</p>
                <PackButton onClick={w.open}>Sign in</PackButton>
            </div>
        );
    } else if (isLoading) {
        body = <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <TicketSkeleton key={i} />)}</div>;
    } else if (isError) {
        body = (
            <div className="ticket flex flex-col items-start gap-3 p-6">
                <p className="font-display text-2xl">We couldn't reach DogeOS.</p>
                <PackButton size="sm" variant="secondary" onClick={() => refetch()}>Try again</PackButton>
            </div>
        );
    } else if (!data?.length) {
        body = (
            <div className="ticket flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-display text-2xl">No packs yet. Start one, or open an invite link.</p>
                <PackButton asChild><Link to="/create">Start a pack</Link></PackButton>
            </div>
        );
    } else {
        body = <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{data.map((p) => <PackTicket key={p.address} view={toTicketView(p)} size="sm" />)}</div>;
    }

    return (
        <AppShell>
            <section className="container py-10 sm:py-14">
                <p className="eyebrow">Organized or backed by you</p>
                <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">Your packs</h1>
                <div className="mt-10">{body}</div>
            </section>
        </AppShell>
    );
};

export default MyPacksPage;
