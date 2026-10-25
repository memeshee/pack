import { Minus, Plus } from 'lucide-react';

interface StepperProps {
    id: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
    suffix: string;
}

/** − value + control with 44px targets; mono numeral. */
export function Stepper({ id, value, min, max, onChange, suffix }: StepperProps) {
    return (
        <div id={id} role="group" className="inline-flex items-center gap-2">
            <button type="button" className="chip" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${suffix}`}>
                <Minus className="h-4 w-4" aria-hidden />
            </button>
            <output aria-live="polite" className="min-w-[4.5rem] text-center font-mono text-lg tabular-nums">
                {value} <span className="text-xs text-ink-soft">{suffix}</span>
            </output>
            <button type="button" className="chip" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${suffix}`}>
                <Plus className="h-4 w-4" aria-hidden />
            </button>
        </div>
    );
}
