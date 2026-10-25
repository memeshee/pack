const STEPS = [
    { n: '01', title: 'Create', line: 'Name the plan, set a DOGE goal, a deadline and how many must approve.' },
    { n: '02', title: 'Chip in', line: 'Share one link. Friends sign in with X or email and put DOGE in the pot.' },
    { n: '03', title: 'Approve', line: 'Goal hit? Propose the spend. It only moves when enough of the pack stamps it.' },
    { n: '04', title: 'Receipt', line: 'Every move is on DogeOS. Goal missed? Everyone takes their DOGE back.' },
];

/** A single ruled timeline — a sequence, not a grid of feature cards. */
export function HowItWorks() {
    return (
        <section aria-labelledby="how" className="border-y-[1.5px] border-ink bg-paper-light/70">
            <div className="container py-16 lg:py-20">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <h2 id="how" className="font-display text-4xl leading-none sm:text-5xl">
                        How a pack works
                    </h2>
                    <p className="max-w-sm text-sm text-ink-soft">The rules live in a contract on DogeOS — not with whoever holds the money.</p>
                </div>
                <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
                    <span aria-hidden className="absolute left-[19px] top-2 h-[calc(100%-1rem)] border-l-2 border-dashed border-ink/30 md:left-0 md:top-[19px] md:h-auto md:w-full md:border-l-0 md:border-t-2" />
                    {STEPS.map((s) => (
                        <li key={s.n} className="relative grid grid-cols-[40px_1fr] gap-4 md:block">
                            <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-ink bg-doge font-mono text-xs font-semibold">
                                {s.n}
                            </span>
                            <div className="md:mt-5">
                                <h3 className="text-lg font-bold tracking-tight">{s.title}</h3>
                                <p className="mt-1.5 text-[15px] leading-snug text-ink-soft">{s.line}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
