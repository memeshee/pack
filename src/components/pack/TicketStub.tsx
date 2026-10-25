import { cn } from '@/lib/utils';
import { DogTag } from './DogTag';
import type { TicketView } from './ticketView';

/** The tear-off stub: who's in, open spots, and the approval rule. */
export function TicketStub({ view, compact }: { view: TicketView; compact?: boolean }) {
    const open = Math.max(0, view.maxMembers - view.members.length);
    const shown = view.members.slice(0, compact ? 4 : 8);
    const hiddenCount = view.members.length - shown.length;
    return (
        <div className={cn('perforation rounded-b-[8px] bg-paper-deep/60', compact ? 'px-5 py-4' : 'px-6 py-5 sm:px-7')}>
            <div className="flex flex-wrap items-center gap-1.5">
                {shown.map((m) => (
                    <DogTag key={m} seed={m} label={m.slice(2, 5)} />
                ))}
                {hiddenCount > 0 && <DogTag seed="0x00" label={`+${hiddenCount}`} />}
                {!compact && Array.from({ length: Math.min(open, 3) }).map((_, i) => <DogTag key={`o${i}`} seed="" label="" empty />)}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                <span>
                    {view.members.length}/{view.maxMembers} backers
                </span>
                <span className="text-ink">
                    {view.threshold} of {Math.max(view.members.length, view.threshold)} approve each spend
                </span>
            </div>
        </div>
    );
}
