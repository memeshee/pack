import { Field } from '@/components/pack/Field';
import { LIMITS } from '@/lib/pack';
import type { CreateForm } from '@/lib/validate';
import { Stepper } from './Stepper';

interface Props {
    form: CreateForm;
    errors: Partial<Record<keyof CreateForm, string>>;
    update: <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => void;
}

export function GoalSection({ form, errors, update }: Props) {
    return (
        <fieldset className="space-y-5">
            <legend className="eyebrow">02 · The goal and the rules</legend>
            <div className="grid gap-5 sm:grid-cols-2">
                <Field id="goal" label="What does the pack need?" error={errors.goal}>
                    <div className="relative">
                        <input id="goal" inputMode="decimal" className="field-input pr-16 font-mono text-lg" value={form.goal}
                            onChange={(e) => update('goal', e.target.value.replace(',', '.'))} aria-invalid={!!errors.goal} />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-soft">DOGE</span>
                    </div>
                </Field>
                <Field id="deadline" label="Chip in by" hint="Ends at 23:59 that day. Goal missed → refunds open." error={errors.deadline}>
                    <input id="deadline" type="date" className="field-input font-mono" value={form.deadline}
                        onChange={(e) => update('deadline', e.target.value)} aria-invalid={!!errors.deadline} />
                </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <Field id="maxMembers" label="Max backers" error={errors.maxMembers}>
                    <Stepper id="maxMembers" value={form.maxMembers} min={LIMITS.minMembers} max={LIMITS.maxMembers} onChange={(v) => update('maxMembers', v)} suffix="people" />
                </Field>
                <Field id="threshold" label="Approvals per spend" error={errors.threshold}>
                    <Stepper id="threshold" value={form.threshold} min={2} max={form.maxMembers} onChange={(v) => update('threshold', v)} suffix="stamps" />
                </Field>
            </div>
        </fieldset>
    );
}
