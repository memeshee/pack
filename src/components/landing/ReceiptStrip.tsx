import type { Address } from 'viem';
import { ReceiptRow } from '@/components/pack/ReceiptRow';
import { usePackActivity } from '@/hooks/usePacks';
import { cn } from '@/lib/utils';

interface ReceiptStripProps {
    pack?: Address;
    fromBlock?: bigint;
    className?: string;
    limit?: number;
}

/** A torn receipt roll printing the latest on-chain moves for one pack. */
export function ReceiptStrip({ pack, fromBlock, className, limit = 4 }: ReceiptStripProps) {
    const { data, isLoading, isError } = usePackActivity(pack, fromBlock);
    const rows = data?.slice(0, limit) ?? [];

    return (
        <div className={cn('receipt px-5 pt-4', className)}>
            <div className="flex items-center justify-between border-b border-dashed border-ink/30 pb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-soft">
                <span>Receipt</span>
                <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-blink rounded-full bg-moss" aria-hidden />
                    {pack ? 'Live from DogeOS' : 'Waiting for the first pack'}
                </span>
            </div>
            {isLoading && pack ? (
                <div className="space-y-2 py-3" aria-busy="true">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-8 animate-pulse rounded bg-ink/[0.07]" />
                    ))}
                </div>
            ) : isError ? (
                <p className="py-4 font-mono text-xs text-stamp">Couldn't reach the DogeOS RPC. Retrying…</p>
            ) : rows.length === 0 ? (
                <p className="py-4 font-mono text-xs leading-relaxed text-ink-soft">Every move will show up here with a receipt.</p>
            ) : (
                <ul className="divide-y divide-dashed divide-ink/20">
                    {rows.map((item) => (
                        <ReceiptRow key={item.id} item={item} />
                    ))}
                </ul>
            )}
        </div>
    );
}
