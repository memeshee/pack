import { PackStatus, type PackStatusValue } from '@/lib/pack';
import { cn } from '@/lib/utils';

const STYLES: Record<PackStatusValue, { label: string; className: string }> = {
    [PackStatus.Funding]: { label: 'Filling the pot', className: 'bg-doge text-ink' },
    [PackStatus.Funded]: { label: 'Goal met', className: 'bg-moss text-paper-light' },
    [PackStatus.PaidOut]: { label: 'Paid out', className: 'bg-ink text-paper-light' },
    [PackStatus.Refundable]: { label: 'Refundable', className: 'bg-stamp text-paper-light' },
};

export function StatusChip({ status, className }: { status: PackStatusValue; className?: string }) {
    const s = STYLES[status] ?? STYLES[PackStatus.Funding];
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em]', s.className, className)}>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
            {s.label}
        </span>
    );
}
