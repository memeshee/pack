import { Amount } from '@/components/pack/Amount';
import { PackButton } from '@/components/pack/PackButton';
import { PackStatus, type PackSummary } from '@/lib/pack';

const LABEL: Record<number, string> = { [PackStatus.Funding]: 'Chip in', [PackStatus.Funded]: 'Decide', [PackStatus.PaidOut]: 'Open', [PackStatus.Refundable]: 'Refund' };

/** Mobile-only bottom bar: the pot and the one thing to do next. */
export function StickyBar({ pack }: { pack: PackSummary }) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-[1.5px] border-ink bg-paper-light/95 px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="eyebrow !text-[10px]">In the pot</p>
                    <Amount wei={pack.totalContributed} className="text-xl" />
                </div>
                <PackButton onClick={() => document.getElementById('actions')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                    {LABEL[pack.status]}
                </PackButton>
            </div>
        </div>
    );
}
