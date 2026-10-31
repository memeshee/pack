import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import type { Hex } from 'viem';
import type { TxPhase } from '@/hooks/usePackTx';
import { useWalletControls } from '@/hooks/useWalletControls';
import { NOT_SYNCED_COPY } from '@/lib/txErrors';
import { explorerTx } from '@/lib/config';
import { cn } from '@/lib/utils';

/** Inline transaction status: honest about DogeOS block times, always links the receipt. */
export function TxStatus({ phase, hash, error, className }: { phase: TxPhase; hash?: Hex; error?: string; className?: string }) {
    const w = useWalletControls();
    if (phase === 'idle' && !error) return null;
    const link = hash && (
        <a href={explorerTx(hash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline underline-offset-4">
            View tx <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>
    );
    return (
        <div role="status" aria-live="polite" className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px]', className)}>
            {phase === 'signing' && (
                <span className="flex items-center gap-1.5 text-ink-soft">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Confirm in your wallet…
                </span>
            )}
            {phase === 'pending' && (
                <span className="flex items-center gap-1.5 text-ink-soft">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Sending… this can take about 15 seconds on DogeOS.
                </span>
            )}
            {phase === 'success' && (
                <span className="flex items-center gap-1.5 text-moss">
                    <Check className="h-3.5 w-3.5" aria-hidden /> Confirmed.
                </span>
            )}
            {error && <span className="text-stamp">{error}</span>}
            {error === NOT_SYNCED_COPY && (
                <button type="button" onClick={w.openBrowser} className="font-semibold underline underline-offset-4">Use a browser wallet</button>
            )}
            {link}
        </div>
    );
}
