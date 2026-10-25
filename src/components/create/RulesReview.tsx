import type { CreateForm } from '@/lib/validate';

/** The social contract in plain words — exactly what Pack.sol enforces. */
export function RulesReview({ form }: { form: CreateForm }) {
    const goal = form.goal.trim() || '—';
    const date = form.deadline ? new Date(`${form.deadline}T23:59:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    return (
        <section aria-labelledby="rules" className="receipt px-5 pt-4 font-mono text-[13px] leading-relaxed">
            <h2 id="rules" className="border-b border-dashed border-ink/30 pb-2 text-[10.5px] uppercase tracking-[0.18em] text-ink-soft">
                03 · The rules, enforced on DogeOS
            </h2>
            <ul className="space-y-2 py-3">
                <li>→ We only spend when the pot hits <b>{goal} DOGE</b>.</li>
                <li>→ If we don't by <b>{date}</b>, everyone can take their DOGE back.</li>
                <li>→ <b>{form.threshold} of {form.maxMembers}</b> backers must approve each spend.</li>
                <li className="text-ink-soft">→ No one — not even you — can move the pot alone.</li>
            </ul>
        </section>
    );
}
