import { Link } from 'react-router-dom';
import { FAUCET_URL, TESTNET_CONFIG, explorerAddress } from '@/lib/config';
import { PACK_FACTORY_ADDRESS } from '@/contracts/address';
import { shortAddress } from '@/lib/pack';
import { LogoMark } from './Logo';

export function SiteFooter() {
    return (
        <footer className="mt-24 border-t-[1.5px] border-ink bg-ink text-paper">
            <div className="container grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                    <div className="flex items-center gap-2">
                        <LogoMark className="h-7 w-7" />
                        <span className="text-lg font-extrabold uppercase tracking-[-0.04em]">Pack</span>
                    </div>
                    <p className="mt-3 max-w-xs font-display text-2xl leading-tight text-paper/90">Every group has a pot. Give it a pack.</p>
                </div>
                <nav aria-label="Footer" className="flex flex-col gap-2 text-sm text-paper/70">
                    <Link to="/create" className="hover:text-doge">Start a pack</Link>
                    <Link to="/packs" className="hover:text-doge">Your packs</Link>
                    <Link to="/proof" className="hover:text-doge">Proof</Link>
                    <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="hover:text-doge">Get test DOGE ↗</a>
                </nav>
                <div className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-paper/60">
                    <div>{TESTNET_CONFIG.name}</div>
                    <div>Chain {TESTNET_CONFIG.chainId}</div>
                    <a href={explorerAddress(PACK_FACTORY_ADDRESS)} target="_blank" rel="noreferrer" className="hover:text-doge">
                        Factory {shortAddress(PACK_FACTORY_ADDRESS)} ↗
                    </a>
                </div>
            </div>
            <div className="border-t border-paper/15">
                <div className="container py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-doge">
                    Testnet only. DOGE here has no real value. Built with Noah AI on DogeOS.
                </div>
            </div>
        </footer>
    );
}
