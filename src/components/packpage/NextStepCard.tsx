import { PackButton } from '@/components/pack/PackButton';
import { nextStep, STEP_ORDER } from '@/lib/nextStep';
import type { PackSummary, Proposal, ViewerState } from '@/lib/pack';
import { cn } from '@/lib/utils';

interface Props {
    pack: PackSummary;
    proposals: Proposal[];
    viewer?: ViewerState;
    connected: boolean;
}

/** Derived from live chain state only: invite, chip in, propose, approve, release or refund. */
export function NextStepCard(props: Props) {
    const step = nextStep(props);
    const go = () => step.target && document.getElementById(step.target.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return (
        <section aria-label="Next step" className="rounded-md border-[1.5px] border-ink bg-paper-light p-4 sm:p-5">
            <p className="eyebrow">Next step</p>
            <p className="mt-1 font-display text-2xl leading-tight">{step.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
            <ol className="mt-3 flex flex-wrap gap-1.5" aria-label="Pack steps">
                {STEP_ORDER.map((s) => (
                    <li key={s.key} aria-current={s.key === step.key ? 'step' : undefined}
                        className={cn('rounded-full border-[1.5px] border-ink/30 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-soft', s.key === step.key && 'border-ink bg-doge font-bold text-ink')}>
                        {s.label}
                    </li>
                ))}
            </ol>
            {step.target && <PackButton size="sm" variant="ink" className="mt-3" onClick={go}>Take me there</PackButton>}
        </section>
    );
}
