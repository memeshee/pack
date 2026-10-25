import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PackButton } from '@/components/pack/PackButton';
import type { PackSummary } from '@/lib/pack';
import { HeroFeatured } from './HeroFeatured';

interface HeroProps {
    featured?: PackSummary;
    loading: boolean;
}

export function Hero({ featured, loading }: HeroProps) {
    return (
        <section className="container grid items-center gap-14 pb-16 pt-10 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-24">
            <div className="lg:col-span-6">
                <p className="inline-flex animate-rise items-center gap-2 rounded-full border-[1.5px] border-ink bg-paper-light px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em]">
                    <span className="h-2 w-2 rounded-full bg-moss" aria-hidden />
                    On DogeOS testnet
                </p>
                <h1 className="mt-6 animate-rise font-display text-[3.6rem] leading-[0.92] tracking-[-0.02em] [animation-delay:60ms] sm:text-[5.2rem] lg:text-[6.4rem]">
                    Money for
                    <br />
                    the <em className="marker italic">pack.</em>
                </h1>
                <p className="mt-6 max-w-[30rem] animate-rise text-lg leading-relaxed text-ink-soft [animation-delay:120ms]">
                    Pack is the shared pot for your group's plans. Everyone chips in. The pack approves the spend. Every move leaves a receipt.
                </p>
                <div className="mt-8 flex animate-rise flex-wrap items-center gap-3 [animation-delay:180ms]">
                    <PackButton asChild size="lg">
                        <Link to="/create">
                            Start a pack <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </PackButton>
                    <PackButton asChild size="lg" variant="ghost" className="underline decoration-ink/30 underline-offset-4">
                        {featured ? <Link to={`/pack/${featured.address}`}>See a live pack</Link> : <a href="#live">See live packs</a>}
                    </PackButton>
                </div>
                <p className="mt-6 animate-rise font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint [animation-delay:240ms]">
                    Sign in with X or email · No seed phrase · Refund if the goal is missed
                </p>
            </div>
            <div className="lg:col-span-6 lg:pl-6">
                <HeroFeatured featured={featured} loading={loading} />
            </div>
        </section>
    );
}
