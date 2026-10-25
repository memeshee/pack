import { Link } from 'react-router-dom';
import { AddressText } from '@/components/pack/AddressText';
import { Amount } from '@/components/pack/Amount';
import type { PackSummary } from '@/lib/pack';

/** The fine print, all read from the Pack contract. */
export function PackDetails({ pack }: { pack: PackSummary }) {
    const rows: [string, React.ReactNode][] = [
        ['Balance', <Amount key="b" wei={pack.balance} />],
        ['Paid out', <Amount key="p" wei={pack.totalPaidOut} />],
        ['Refunded', <Amount key="r" wei={pack.totalRefunded} />],
        ['Deadline', new Date(pack.deadline * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })],
        ['Pack contract', <AddressText key="a" address={pack.address} link />],
        ['Organizer', <AddressText key="c" address={pack.creator} link />],
    ];
    return (
        <div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 font-mono text-xs">
                {rows.map(([k, v]) => (
                    <div key={k} className="contents">
                        <dt className="uppercase tracking-[0.08em] text-ink-soft">{k}</dt>
                        <dd className="text-right">{v}</dd>
                    </div>
                ))}
            </dl>
            <Link to={`/proof?pack=${pack.address}`} className="mt-4 inline-block text-sm font-semibold underline decoration-doge decoration-[3px] underline-offset-[6px]">
                Check the ledger →
            </Link>
        </div>
    );
}
