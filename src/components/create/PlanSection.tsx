import { Field } from '@/components/pack/Field';
import { LIMITS } from '@/lib/pack';
import { byteLength, clampBytes, type CreateForm } from '@/lib/validate';

const EMOJI = ['🍜', '🎉', '✈️', '🎁', '🏕️', '🍕', '🎟️', '🐕'];

interface Props {
    form: CreateForm;
    errors: Partial<Record<keyof CreateForm, string>>;
    update: <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => void;
}

export function PlanSection({ form, errors, update }: Props) {
    return (
        <fieldset className="space-y-5">
            <legend className="eyebrow">01 · The plan</legend>
            <Field id="name" label="What's it called?" error={errors.name}>
                <input id="name" className="field-input font-display text-2xl" placeholder="Doge Dinner — Friday" value={form.name}
                    onChange={(e) => update('name', clampBytes(e.target.value, LIMITS.name))} aria-invalid={!!errors.name} autoComplete="off" />
            </Field>
            <div className="space-y-1.5">
                <span className="block text-sm font-semibold tracking-tight">Pick a sticker</span>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Pack emoji">
                    {EMOJI.map((e) => (
                        <button key={e} type="button" className="chip text-xl" aria-pressed={form.emoji === e} onClick={() => update('emoji', e)} aria-label={`Use ${e}`}>
                            {e}
                        </button>
                    ))}
                </div>
            </div>
            <Field id="story" label="The story (optional)" hint={`${byteLength(form.story)}/${LIMITS.story} bytes · Shown to everyone who opens the link.`} error={errors.story}>
                <textarea id="story" rows={2} className="field-input resize-none" placeholder="Rooftop table for the crew. We book it when the pot hits the goal."
                    value={form.story} onChange={(e) => update('story', clampBytes(e.target.value, LIMITS.story))} aria-invalid={!!errors.story} />
            </Field>
        </fieldset>
    );
}
