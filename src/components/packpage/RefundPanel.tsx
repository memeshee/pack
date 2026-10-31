import { Amount } from '@/components/pack/Amount';
import { PackButton } from '@/components/pack/PackButton';
import { TxStatus } from '@/components/pack/TxStatus';
import { usePackTx } from '@/hooks/usePackTx';
import { PACK_ABI, packPhase, type PackSummary, type ViewerState } from '@/lib/pack';

/** Goal missed, or too few backers to ever approve a spend: each backer takes back exactly what they put in. */
export function RefundPanel({ pack, viewer }: { pack: PackSummary; viewer?: ViewerState }) {
    const tx = usePackTx();
    const mine = viewer?.contribution ?? 0n;
    const tooFew = packPhase(pack).goalMet;

    return (
        <div className="space-y-3">
            <p className="font-display text-2xl leading-tight">
                {tooFew ? "Too few backers to spend the pot. Take your DOGE back." : "The goal wasn't met. Take your DOGE back."}
            </p>
            {viewer?.refunded ? (
                <p className="text-sm text-moss">You got your <Amount wei={mine} /> back.</p>
            ) : mine > 0n ? (
                <>
                    <PackButton size="lg" className="w-full" disabled={tx.busy}
                        onClick={() => tx.run({ address: pack.address, abi: PACK_ABI, functionName: 'claimRefund' }, 'Your DOGE is back.')}>
                        {tx.busy ? 'Refunding…' : <>Claim refund · <Amount wei={mine} unitClassName="text-ink" /></>}
                    </PackButton>
                    <TxStatus phase={tx.phase} hash={tx.hash} error={tx.error} />
                </>
            ) : (
                <p className="text-sm text-ink-soft">Backers can each claim back exactly what they put in.</p>
            )}
        </div>
    );
}
