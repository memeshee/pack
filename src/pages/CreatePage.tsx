import { useBalance } from 'wagmi';
import type { Address } from 'viem';
import { AppShell } from '@/components/layout/AppShell';
import { GoalSection } from '@/components/create/GoalSection';
import { PlanSection } from '@/components/create/PlanSection';
import { RulesReview } from '@/components/create/RulesReview';
import { PackButton } from '@/components/pack/PackButton';
import { TxStatus } from '@/components/pack/TxStatus';
import { useCreatePack } from '@/hooks/useCreatePack';
import { useWalletControls } from '@/hooks/useWalletControls';
import { FAUCET_URL, TARGET_CHAIN } from '@/lib/config';

const CreatePage = () => {
    const { form, update, errors, submit, tx } = useCreatePack();
    const w = useWalletControls();
    const { data: bal } = useBalance({ address: w.address as Address | undefined, chainId: TARGET_CHAIN.id, query: { enabled: !!w.address } });
    const broke = !!bal && bal.value === 0n;

    return (
        <AppShell>
            <section className="container max-w-3xl py-10 sm:py-14">
                <p className="eyebrow">New pack</p>
                <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">What's the plan?</h1>
                <form className="ticket mt-8" onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate>
                    <div className="space-y-10 p-6 sm:p-8">
                        <PlanSection form={form} errors={errors} update={update} />
                        <GoalSection form={form} errors={errors} update={update} />
                    </div>
                    <div className="perforation rounded-b-[8px] bg-paper-deep/60 p-6 sm:p-8">
                        <RulesReview form={form} />
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {w.isConnected ? (
                                <PackButton type="submit" size="lg" disabled={tx.busy}>{tx.busy ? 'Creating…' : 'Create the pack'}</PackButton>
                            ) : (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                    <PackButton type="button" size="lg" onClick={w.open}>Sign in to create</PackButton>
                                    <button type="button" onClick={w.openBrowser} className="text-sm font-semibold underline underline-offset-4">Use a browser wallet</button>
                                </div>
                            )}
                            {broke && (
                                <p className="text-sm text-ink-soft">
                                    You need a little test DOGE for gas.{' '}
                                    <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">Get test DOGE ↗</a>
                                </p>
                            )}
                        </div>
                        <TxStatus phase={tx.phase} hash={tx.hash} error={tx.error} className="mt-4" />
                    </div>
                </form>
            </section>
        </AppShell>
    );
};

export default CreatePage;
