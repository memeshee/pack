import { Link } from 'react-router-dom';
import { PackButton } from '@/components/pack/PackButton';
import { Stamp } from '@/components/pack/Stamp';
import { AppShell } from './AppShell';

interface ComingNextProps {
    eyebrow: string;
    title: string;
    line: string;
}

/** Honest placeholder for routes whose milestone hasn't shipped yet. */
export function ComingNext({ eyebrow, title, line }: ComingNextProps) {
    return (
        <AppShell>
            <section className="container max-w-2xl py-20">
                <div className="ticket relative p-8 sm:p-10">
                    <Stamp tone="ink" className="absolute -right-3 -top-6 h-20 w-20 text-[9px]" rotate={10}>
                        Next
                        <br />
                        up
                    </Stamp>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">{eyebrow}</p>
                    <h1 className="mt-3 font-display text-5xl leading-none">{title}</h1>
                    <p className="mt-4 text-ink-soft">{line}</p>
                    <PackButton asChild variant="secondary" className="mt-8">
                        <Link to="/">Back to the packs</Link>
                    </PackButton>
                </div>
            </section>
        </AppShell>
    );
}
