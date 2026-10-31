import { useState } from 'react';
import { Field } from '@/components/pack/Field';
import { PackButton } from '@/components/pack/PackButton';
import { TxStatus } from '@/components/pack/TxStatus';
import { usePackTx } from '@/hooks/usePackTx';
import { formatEther } from 'viem';
import { formatDoge, LIMITS, PACK_ABI, type PackSummary } from '@/lib/pack';
import { byteLength, clampBytes, parseDoge, validateProposal, type ProposalForm } from '@/lib/validate';

/** Draft a spend. The proposer's own stamp counts as the first approval. */
export function ProposeForm({ pack }: { pack: PackSummary }) {
    const [open, setOpen] = useState(false);
    const [f, setF] = useState<ProposalForm>({ recipient: '', amount: '', memo: '' });
    const [touched, setTouched] = useState(false);
    const tx = usePackTx();
    const all = validateProposal(f, pack.address, pack.balance);
    const errors = touched ? all : {};

    if (!open) return <PackButton variant="ink" className="w-full" onClick={() => setOpen(true)}>Propose a spend</PackButton>;

    const submit = async () => {
        setTouched(true);
        if (Object.keys(all).length) return;
        const ok = await tx.run(
            { address: pack.address, abi: PACK_ABI, functionName: 'createProposal', args: [f.recipient.trim(), parseDoge(f.amount), f.memo.trim()] },
            'Put to the pack.',
        );
        if (ok) { setOpen(false); setF({ recipient: '', amount: '', memo: '' }); setTouched(false); }
    };

    return (
        <form className="space-y-4 rounded-md border-[1.5px] border-dashed border-ink/40 p-4" onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate>
            <p className="eyebrow">Put it to the pack</p>
            <Field id="memo" label="What's it for?" hint={`${byteLength(f.memo)}/${LIMITS.memo} bytes`} error={errors.memo}>
                <input id="memo" className="field-input" placeholder="Rooftop deposit" value={f.memo} onChange={(e) => setF({ ...f, memo: clampBytes(e.target.value, LIMITS.memo) })} aria-invalid={!!errors.memo} />
            </Field>
            <Field id="recipient" label="Pay to" hint="Double-check it — the pack can't undo a payout." error={errors.recipient}>
                <input id="recipient" className="field-input font-mono text-sm" placeholder="0x…" spellCheck={false} value={f.recipient} onChange={(e) => setF({ ...f, recipient: e.target.value })} aria-invalid={!!errors.recipient} />
            </Field>
            <Field id="amount" label="Amount" hint={`The pot holds ${formatDoge(pack.balance, 4)} DOGE.`} error={errors.amount}>
                <div className="flex gap-2">
                    <input id="amount" inputMode="decimal" className="field-input font-mono" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(',', '.') })} aria-invalid={!!errors.amount} />
                    <button type="button" className="chip font-mono text-xs" onClick={() => setF({ ...f, amount: formatEther(pack.balance) })}>All</button>
                </div>
            </Field>
            <p className="text-[13px] text-ink-soft">This needs {pack.threshold} approvals. Yours counts as the first.</p>
            <div className="flex gap-2">
                <PackButton type="submit" disabled={tx.busy}>{tx.busy ? 'Proposing…' : 'Put it to the pack'}</PackButton>
                <PackButton type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</PackButton>
            </div>
            <TxStatus phase={tx.phase} hash={tx.hash} error={tx.error} />
        </form>
    );
}
