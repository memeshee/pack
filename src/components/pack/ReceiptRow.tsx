import { ArrowUpRight } from 'lucide-react';
import { relativeTime, type ActivityItem } from '@/lib/activity';
import { explorerTx } from '@/lib/config';
import { formatDoge, shortAddress } from '@/lib/pack';
import { cn } from '@/lib/utils';

const LABEL: Record<ActivityItem['kind'], string> = {
    Contributed: 'Chipped in',
    ProposalCreated: 'Proposed',
    ProposalApproved: 'Approved',
    PayoutExecuted: 'Paid out',
    RefundClaimed: 'Refunded',
};

const SIGN: Partial<Record<ActivityItem['kind'], string>> = { Contributed: '+', PayoutExecuted: '−', RefundClaimed: '−' };

/** One printed line on the receipt roll, linked to its transaction. */
export function ReceiptRow({ item, className }: { item: ActivityItem; className?: string }) {
    const detail = item.kind === 'ProposalApproved' ? `#${item.proposalId} · ${item.approvals} ok` : item.memo;
    return (
        <li className={cn('animate-print-in', className)}>
            <a
                href={explorerTx(item.txHash)}
                target="_blank"
                rel="noreferrer"
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-0.5 py-2.5 font-mono text-[12.5px] transition-colors hover:bg-doge/25"
            >
                <span className="truncate">
                    <span className="font-semibold text-ink">{LABEL[item.kind]}</span>
                    <span className="text-ink-soft"> · {shortAddress(item.actor)}</span>
                </span>
                <span className={cn('tabular-nums', item.kind === 'PayoutExecuted' && 'text-stamp')}>
                    {item.amount != null ? `${SIGN[item.kind] ?? ''}${formatDoge(item.amount)}` : '—'}
                </span>
                <span className="truncate text-[11px] text-ink-faint">{detail ?? relativeTime(item.timestamp)}</span>
                <span className="flex items-center justify-end gap-0.5 text-[11px] text-ink-faint group-hover:text-ink">
                    {detail ? relativeTime(item.timestamp) : 'tx'}
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                </span>
            </a>
        </li>
    );
}
