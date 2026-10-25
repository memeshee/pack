import { Link } from 'react-router-dom';
import { PACK_FACTORY_ADDRESS } from '@/contracts/address';
import { useChainPulse } from '@/hooks/usePacks';
import { TESTNET_CONFIG, explorerAddress, explorerBlock } from '@/lib/config';
import { shortAddress } from '@/lib/pack';

const Sep = () => <span aria-hidden className="text-ink/30">·</span>;

/** Proof, not claims: every item here is read live or links to the explorer. */
export function ProofStrip() {
    const { data, isError } = useChainPulse();
    return (
        <section aria-label="On-chain proof" className="container py-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11.5px] uppercase tracking-[0.12em] text-ink-soft">
                <span className="font-semibold text-ink">Proof</span>
                <Sep />
                <a href={explorerAddress(PACK_FACTORY_ADDRESS)} target="_blank" rel="noreferrer" className="underline decoration-ink/25 underline-offset-4 hover:text-ink">
                    Factory {shortAddress(PACK_FACTORY_ADDRESS)} ↗
                </a>
                <Sep />
                <span>DogeOS {TESTNET_CONFIG.chainId}</span>
                <Sep />
                {isError ? (
                    <span className="text-stamp">RPC unreachable</span>
                ) : data ? (
                    <>
                        <a href={explorerBlock(data.block)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
                            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-moss" aria-hidden />
                            Block #{data.block.toString()}
                        </a>
                        <Sep />
                        <span>{data.packs.toString()} packs on chain</span>
                    </>
                ) : (
                    <span className="animate-pulse">Reading chain…</span>
                )}
                <Sep />
                <Link to="/proof" className="text-ink underline decoration-doge decoration-2 underline-offset-4">
                    Full proof
                </Link>
            </div>
        </section>
    );
}
