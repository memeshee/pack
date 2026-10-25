import { NavLink } from 'react-router-dom';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

const NAV = [
    { to: '/packs', label: 'Your packs' },
    { to: '/proof', label: 'Proof' },
];

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 border-b-[1.5px] border-ink bg-paper/90 backdrop-blur-[2px]">
            <div className="container flex h-16 items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <Logo />
                    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
                        {NAV.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                className={({ isActive }) =>
                                    cn(
                                        'rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink',
                                        isActive && 'text-ink underline decoration-doge decoration-[3px] underline-offset-[6px]',
                                    )
                                }
                            >
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <ConnectButton />
            </div>
        </header>
    );
}
