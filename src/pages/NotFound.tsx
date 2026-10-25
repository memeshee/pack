import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PackButton } from '@/components/pack/PackButton';
import { Stamp } from '@/components/pack/Stamp';

const NotFound = () => (
    <AppShell>
        <section className="container flex max-w-xl flex-col items-center py-28 text-center">
            <Stamp press className="h-32 w-32 text-sm">
                404
                <br />
                <span className="text-[9px]">no such tab</span>
            </Stamp>
            <h1 className="mt-10 font-display text-5xl leading-none">This page wandered off.</h1>
            <p className="mt-3 text-ink-soft">Good dog, wrong yard. Let's get you back to the pack.</p>
            <PackButton asChild className="mt-8">
                <Link to="/">Back home</Link>
            </PackButton>
        </section>
    </AppShell>
);

export default NotFound;
