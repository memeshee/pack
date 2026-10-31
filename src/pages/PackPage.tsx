import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useBalance } from 'wagmi';
import { isAddress, type Address } from 'viem';
import { AppShell } from '@/components/layout/AppShell';
import { ReceiptStrip } from '@/components/landing/ReceiptStrip';
import { PackButton } from '@/components/pack/PackButton';
import { PackTicket } from '@/components/pack/PackTicket';
import { TicketSkeleton } from '@/components/pack/TicketSkeleton';
import { toTicketView } from '@/components/pack/ticketView';
import { ActionPanel } from '@/components/packpage/ActionPanel';
import { NextStepCard } from '@/components/packpage/NextStepCard';
import { PackDetails } from '@/components/packpage/PackDetails';
import { ProposalCard } from '@/components/packpage/ProposalCard';
import { ShareCard } from '@/components/packpage/ShareCard';
import { StickyBar } from '@/components/packpage/StickyBar';
import { usePackSummary, useProposals, useViewerState } from '@/hooks/usePacks';
import { useWalletControls } from '@/hooks/useWalletControls';
import { TARGET_CHAIN } from '@/lib/config';
import { classifyReadError } from '@/lib/pack';

const Missing = ({ rpc, onRetry }: { rpc?: boolean; onRetry?: () => void }) => (
    <AppShell>
        <section className="container max-w-xl py-24">
            <div className="ticket p-8">
                <h1 className="font-display text-4xl">{rpc ? "DogeOS didn't answer." : "We can't find that pack."}</h1>
                <p className="mt-3 text-ink-soft">
                    {rpc ? "The pack may be fine — we just couldn't reach the DogeOS RPC. Check your connection and try again." : "The link might be cut off, or that address isn't a Pack on DogeOS testnet."}
                </p>
                {rpc && onRetry && <PackButton className="mt-6 mr-3" onClick={onRetry}>Try again</PackButton>}
                <PackButton asChild className="mt-6" variant={rpc ? 'ghost' : undefined}><Link to="/">See live packs</Link></PackButton>
            </div>
        </section>
    </AppShell>
);

const PackPage = () => {
    const { address = '' } = useParams();
    const [params] = useSearchParams();
    const valid = isAddress(address);
    const w = useWalletControls();
    const viewer = w.address as Address | undefined;
    const { data: pack, isLoading, isError, error, refetch } = usePackSummary(valid ? (address as Address) : undefined);
    const { data: proposals = [] } = useProposals(pack?.address, pack?.proposalCount);
    const { data: me } = useViewerState(pack?.address, viewer, proposals.map((p) => p.id));
    const { data: bal } = useBalance({ address: viewer, chainId: TARGET_CHAIN.id, query: { enabled: !!viewer, refetchInterval: 15_000 } });

    if (!valid) return <Missing />;
    if (isError && !pack) return <Missing rpc={classifyReadError(error) === 'rpc'} onRetry={() => void refetch()} />;
    const isMember = (me?.contribution ?? 0n) > 0n;
    const ordered = [...proposals].sort((a, b) => Number(a.executed || a.expired) - Number(b.executed || b.expired) || Number(b.id - a.id));

    return (
        <AppShell>
            <section className="container grid gap-10 py-8 pb-28 lg:grid-cols-[1.2fr_1fr] lg:py-14">
                <div className="space-y-8">
                    {isLoading || !pack ? <TicketSkeleton size="lg" /> : <PackTicket view={toTicketView(pack)} />}
                    {pack && <NextStepCard pack={pack} proposals={proposals} viewer={me} connected={w.isConnected} />}
                    {pack && <ActionPanel pack={pack} viewer={me} walletBalance={bal?.value} />}
                    {pack && (
                        <section id="spends" aria-labelledby="spends-title" className="scroll-mt-24 space-y-3">
                            <h2 id="spends-title" className="font-display text-3xl">Spends</h2>
                            {ordered.length === 0 ? (
                                <p className="text-sm text-ink-soft">When the pot hits the goal, decide what it's for.</p>
                            ) : (
                                ordered.map((p) => <ProposalCard key={p.id.toString()} p={p} pack={pack} isMember={isMember} approved={!!me?.approved[p.id.toString()]} />)
                            )}
                        </section>
                    )}
                </div>
                <aside id="share" className="scroll-mt-24 space-y-8">
                    {pack && <ShareCard address={pack.address} name={toTicketView(pack).name} highlight={params.get('new') === '1'} />}
                    <div>
                        <h2 className="font-display text-3xl">The receipt</h2>
                        <ReceiptStrip pack={pack?.address} fromBlock={pack?.createdBlock} limit={30} className="mt-4" />
                    </div>
                    {pack && <PackDetails pack={pack} />}
                </aside>
            </section>
            {pack && <StickyBar pack={pack} />}
        </AppShell>
    );
};

export default PackPage;
