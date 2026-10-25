import { Amount } from '@/components/pack/Amount';
import { PackButton } from '@/components/pack/PackButton';
import { useWalletControls } from '@/hooks/useWalletControls';
import { PackStatus, type PackSummary, type ViewerState } from '@/lib/pack';
import { ChipIn } from './ChipIn';
import { ProposeForm } from './ProposeForm';
import { RefundPanel } from './RefundPanel';

interface Props {
    pack: PackSummary;
    viewer?: ViewerState;
    walletBalance?: bigint;
}

/** One primary action for the current state of the pack and the viewer. */
export function ActionPanel({ pack, viewer, walletBalance }: Props) {
    const w = useWalletControls();
    const open = Date.now() / 1000 <= pack.deadline;
    const goalMet = pack.totalContributed >= pack.goal;
    const isMember = (viewer?.contribution ?? 0n) > 0n;
    const full = pack.memberCount >= pack.maxMembers;

    return (
        <section id="actions" aria-label="Actions" className="ticket scroll-mt-24 space-y-5 p-5 sm:p-6">
            {isMember && (
                <p className="flex items-center gap-2 text-sm">
                    <span className="rounded-full border-[1.5px] border-ink bg-doge px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em]">You're in</span>
                    You put in <Amount wei={viewer!.contribution} />
                </p>
            )}
            {pack.status === PackStatus.Refundable ? (
                <RefundPanel pack={pack} viewer={viewer} />
            ) : (
                <>
                    {open && !w.isConnected && (
                        <div className="space-y-2">
                            <p className="font-display text-2xl leading-tight">{goalMet ? 'Goal met — time to decide.' : 'Filling the pot.'}</p>
                            <PackButton size="lg" className="w-full" onClick={w.open}>Sign in to chip in</PackButton>
                            <p className="text-center text-[12px] text-ink-soft">X, email or a browser wallet. No seed phrase.</p>
                        </div>
                    )}
                    {open && w.isConnected && (full && !isMember ? <p className="text-sm text-ink-soft">This pack is full — every spot is taken.</p> : <ChipIn pack={pack} walletBalance={walletBalance} />)}
                    {goalMet && isMember && pack.balance > 0n && <ProposeForm pack={pack} />}
                    {goalMet && !isMember && w.isConnected && <p className="text-sm text-ink-soft">Goal met — backers are deciding what it's for.</p>}
                    {!open && goalMet && pack.balance === 0n && <p className="font-display text-2xl">Paid. Receipt below.</p>}
                </>
            )}
        </section>
    );
}
