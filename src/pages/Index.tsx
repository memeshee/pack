import { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LivePacks } from '@/components/landing/LivePacks';
import { ProofStrip } from '@/components/landing/ProofStrip';
import { useLivePacks } from '@/hooks/usePacks';

const Index = () => {
    const { data: packs, isLoading, isError, refetch } = useLivePacks(6);

    /** Feature the fullest live pot — the most convincing ticket. */
    const featured = useMemo(
        () => (packs?.length ? [...packs].sort((a, b) => (b.totalContributed > a.totalContributed ? 1 : -1))[0] : undefined),
        [packs],
    );

    return (
        <AppShell>
            <Hero featured={featured} loading={isLoading} />
            <HowItWorks />
            <ProofStrip />
            <LivePacks packs={packs} loading={isLoading} error={isError} onRetry={() => refetch()} />
        </AppShell>
    );
};

export default Index;
