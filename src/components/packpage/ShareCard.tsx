import { Copy, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/** One link is the whole invite. Highlighted right after creation. */
export function ShareCard({ address, name, highlight }: { address: string; name: string; highlight?: boolean }) {
    const link = `${window.location.origin}/pack/${address}`;
    const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Starting a pack for ${name}. Chip in here: ${link}`)}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(`You're invited to ${name}. Chip in with DOGE — no wallet setup, just sign in. ${link}`)}`;

    const copy = async () => {
        await navigator.clipboard.writeText(link);
        toast({ title: 'Invite link copied' });
    };
    const native = () => navigator.share?.({ title: name, text: `Chip in to ${name}`, url: link }).catch(() => undefined);

    return (
        <section aria-label="Invite" className={cn('rounded-md border-[1.5px] border-ink p-4', highlight ? 'bg-doge shadow-press' : 'bg-paper-light')}>
            <p className="font-display text-2xl leading-tight">{highlight ? 'Your pack is live. Invite the pack.' : 'Invite the pack'}</p>
            <div className="mt-3 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded border border-ink/30 bg-paper-light px-2 py-2 font-mono text-xs">{link}</code>
                <button type="button" onClick={copy} className="chip" aria-label="Copy invite link"><Copy className="h-4 w-4" aria-hidden /></button>
                {'share' in navigator && <button type="button" onClick={native} className="chip" aria-label="Share"><Share2 className="h-4 w-4" aria-hidden /></button>}
            </div>
            <div className="mt-3 flex gap-4 text-sm font-semibold">
                <a href={x} target="_blank" rel="noreferrer" className="underline underline-offset-4">Post on X ↗</a>
                <a href={wa} target="_blank" rel="noreferrer" className="underline underline-offset-4">WhatsApp ↗</a>
            </div>
        </section>
    );
}
