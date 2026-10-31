import { useState } from 'react';
import { formatEther } from 'viem';
import { PackButton } from '@/components/pack/PackButton';
import { TxStatus } from '@/components/pack/TxStatus';
import { usePackTx } from '@/hooks/usePackTx';
import { FAUCET_URL } from '@/lib/config';
import { PACK_ABI, type PackSummary } from '@/lib/pack';
import { parseDoge } from '@/lib/validate';

const PRESETS = ['10', '25', '50'];

interface Props {
    pack: PackSummary;
    isMember: boolean;
    walletBalance?: bigint;
}

/** Put DOGE in the pot. First contribution makes you a backer. */
export function ChipIn({ pack, isMember, walletBalance }: Props) {
    const [amount, setAmount] = useState('25');
    const tx = usePackTx();
    const wei = parseDoge(amount);
    const short = walletBalance !== undefined && wei !== null && wei > walletBalance;
    const toGo = pack.goal > pack.totalContributed ? pack.goal - pack.totalContributed : 0n;
    // The contract refuses a contribution that fills the pot while backers < approvals needed.
    const backersAfter = pack.memberCount + (isMember ? 0 : 1);
    const needsMoreBackers = toGo > 0n && backersAfter < pack.threshold;
    const cap = needsMoreBackers ? toGo - 1n : toGo;
    const tooMuch = needsMoreBackers && wei !== null && wei >= toGo;

    const send = () => wei && tx.run({ address: pack.address, abi: PACK_ABI, functionName: 'contribute', value: wei }, `You chipped in ${amount} DOGE.`);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Amount presets">
                {PRESETS.map((p) => (
                    <button key={p} type="button" className="chip font-mono" aria-pressed={amount === p} onClick={() => setAmount(p)}>{p}</button>
                ))}
                {cap > 0n && (
                    <button type="button" className="chip font-mono text-xs" onClick={() => setAmount(formatEther(cap))}>{needsMoreBackers ? 'Nearly fill it' : 'Fill it'}</button>
                )}
                <label className="relative min-w-[8rem] flex-1">
                    <span className="sr-only">Custom amount in DOGE</span>
                    <input inputMode="decimal" className="field-input pr-14 font-mono" value={amount} onChange={(e) => setAmount(e.target.value.replace(',', '.'))} aria-invalid={!wei || short || tooMuch} />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-soft">DOGE</span>
                </label>
            </div>
            {tooMuch && (
                <p role="alert" className="text-[13px] text-stamp">
                    That would fill the pot with only {backersAfter} {backersAfter === 1 ? 'backer' : 'backers'}, and spends need {pack.threshold}. Put in less, or have {pack.threshold - backersAfter} more {pack.threshold - backersAfter === 1 ? 'person' : 'people'} chip in first.
                </p>
            )}
            {short && (
                <p className="text-[13px] text-stamp">
                    You need {amount} DOGE plus a little gas. <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">Get test DOGE ↗</a> or chip in less.
                </p>
            )}
            <PackButton size="lg" className="w-full" onClick={send} disabled={!wei || short || tooMuch || tx.busy}>
                {tx.busy ? 'Chipping in…' : `Chip in${wei ? ` ${amount} DOGE` : ''}`}
            </PackButton>
            <TxStatus phase={tx.phase} hash={tx.hash} error={tx.error} />
        </div>
    );
}
