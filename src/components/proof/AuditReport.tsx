import { useQuery } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Address } from 'viem';
import { ReceiptRow } from '@/components/pack/ReceiptRow';
import { Stamp } from '@/components/pack/Stamp';
import { auditPack } from '@/lib/audit';
import { cn } from '@/lib/utils';

/** One pack's ledger, rebuilt from events and checked line by line. Mismatches are red. */
export function AuditReport({ address }: { address: Address }) {
    const { data: a, isLoading, isError } = useQuery({ queryKey: ['audit', address], queryFn: () => auditPack(address), refetchInterval: 30_000 });

    if (isLoading) return <div className="ticket h-80 animate-pulse" aria-busy="true" />;
    if (isError || !a) return <div className="ticket p-6 text-stamp">Couldn't read this pack from DogeOS. Retrying…</div>;

    return (
        <div className="ticket relative overflow-visible">
            <Stamp press tone={a.ok ? 'moss' : 'stamp'} className="absolute -right-3 -top-6 h-24 w-24 text-[9px]" rotate={-12}>
                {a.ok ? <>Ledger<br />checks out</> : <>Mismatch<br />found</>}
            </Stamp>
            <div className="p-6 sm:p-7">
                <p className="eyebrow">Audited {new Date(a.checkedAt).toLocaleTimeString()} · from {a.events.length} events</p>
                <h2 className="mt-1 pr-20 font-display text-3xl">
                    <Link to={`/pack/${address}`} className="hover:underline">{a.pack.emoji} {a.pack.name}</Link>
                </h2>
                <ul className="mt-5 divide-y divide-dashed divide-ink/20">
                    {a.checks.map((c) => (
                        <li key={c.label} className={cn('grid grid-cols-[24px_1fr] gap-3 py-2.5', !c.ok && 'bg-stamp/10')}>
                            <span className={cn('mt-0.5 grid h-5 w-5 place-items-center rounded-full border-[1.5px]', c.ok ? 'border-moss text-moss' : 'border-stamp bg-stamp text-paper-light')}>
                                {c.ok ? <Check className="h-3 w-3" aria-label="Pass" /> : <X className="h-3 w-3" aria-label="Fail" />}
                            </span>
                            <div>
                                <p className="text-sm font-semibold">{c.label}</p>
                                <p className="font-mono text-[11.5px] text-ink-soft">{c.detail}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="perforation rounded-b-[8px] bg-paper-deep/60 px-6 py-4">
                <p className="eyebrow">Every event, linked</p>
                {a.events.length === 0 ? <p className="py-3 font-mono text-xs text-ink-soft">No activity yet.</p> : (
                    <ul className="max-h-80 divide-y divide-dashed divide-ink/20 overflow-y-auto">{a.events.map((e) => <ReceiptRow key={e.id} item={e} />)}</ul>
                )}
            </div>
        </div>
    );
}
