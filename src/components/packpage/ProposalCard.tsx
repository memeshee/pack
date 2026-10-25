import { useState } from 'react';
import { AddressText } from '@/components/pack/AddressText';
import { Amount } from '@/components/pack/Amount';
import { PackButton } from '@/components/pack/PackButton';
import { Stamp } from '@/components/pack/Stamp';
import { TxStatus } from '@/components/pack/TxStatus';
import { usePackTx } from '@/hooks/usePackTx';
import { PACK_ABI, type PackSummary, type Proposal } from '@/lib/pack';
import { cn } from '@/lib/utils';

interface Props {
    p: Proposal;
    pack: PackSummary;
    isMember: boolean;
    approved: boolean;
}

/** A proposed spend: approvals as stamp dots, then a red stamp and a two-step release. */
export function ProposalCard({ p, pack, isMember, approved }: Props) {
    const tx = usePackTx();
    const [confirm, setConfirm] = useState(false);
    const ready = p.approvals >= pack.threshold && !p.executed && !p.expired;
    const call = (fn: 'approve' | 'execute', title: string) => tx.run({ address: pack.address, abi: PACK_ABI, functionName: fn, args: [p.id] }, title);

    return (
        <article className={cn('relative rounded-md border-[1.5px] border-ink bg-paper-light p-4', (p.executed || p.expired) && 'bg-paper-deep/50')}>
            {p.executed && <Stamp press className="absolute right-3 top-3 h-16 w-16 text-[10px]">Paid</Stamp>}
            {ready && <Stamp press tone="moss" className="absolute right-3 top-3 h-16 w-16 text-[8px]" rotate={-8}>Approved</Stamp>}
            {p.expired && !p.executed && <Stamp tone="ink" className="absolute right-3 top-3 h-16 w-16 text-[8px]" rotate={6}>Expired</Stamp>}
            <p className="eyebrow">Proposal #{p.id.toString()}</p>
            <h3 className="mt-1 pr-16 text-lg font-bold leading-snug">{p.memo}</h3>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm text-ink-soft">
                <Amount wei={p.amount} className="text-xl text-ink" /> to <AddressText address={p.recipient} link />
            </div>
            <div className="mt-3 flex items-center gap-1.5" aria-label={`${p.approvals} of ${pack.threshold} approvals`}>
                {Array.from({ length: pack.threshold }).map((_, i) => (
                    <span key={i} className={cn('h-3 w-3 rounded-full border-[1.5px] border-ink', i < p.approvals ? 'bg-stamp' : 'bg-transparent')} />
                ))}
                <span className="ml-1 font-mono text-xs text-ink-soft">{p.approvals} of {pack.threshold} approvals</span>
            </div>
            {isMember && !p.executed && !p.expired && (
                <div className="mt-4 space-y-2">
                    {!approved && !ready && <PackButton size="sm" onClick={() => call('approve', 'You stamped it.')} disabled={tx.busy}>Approve</PackButton>}
                    {approved && !ready && <p className="text-[13px] text-ink-soft">You approved. Waiting on {pack.threshold - p.approvals} more.</p>}
                    {ready && !confirm && <PackButton size="sm" variant="danger" onClick={() => setConfirm(true)}>Release funds</PackButton>}
                    {ready && confirm && (
                        <div className="space-y-2 rounded-md bg-doge/30 p-3 text-sm">
                            <p>This sends the DOGE from the pack to <AddressText address={p.recipient} />. It can't be undone.</p>
                            <div className="flex gap-2">
                                <PackButton size="sm" variant="danger" onClick={() => call('execute', 'Paid. Receipt below.')} disabled={tx.busy}>Send it</PackButton>
                                <PackButton size="sm" variant="ghost" onClick={() => setConfirm(false)}>Not yet</PackButton>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <TxStatus phase={tx.phase} hash={tx.hash} error={tx.error} className="mt-2" />
        </article>
    );
}
