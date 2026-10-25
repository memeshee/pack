import { useSearchParams } from 'react-router-dom';
import { isAddress, type Address } from 'viem';
import { AppShell } from '@/components/layout/AppShell';
import { AddressText } from '@/components/pack/AddressText';
import { AuditReport } from '@/components/proof/AuditReport';
import { PACK_FACTORY_ADDRESS } from '@/contracts/address';
import { useAllPackAddresses, useChainPulse } from '@/hooks/usePacks';
import { TESTNET_CONFIG, explorerBlock } from '@/lib/config';
import { shortAddress } from '@/lib/pack';

/** Don't trust us — check. Chain facts plus a per-pack audit, all read live from DogeOS. */
const ProofPage = () => {
    const [params, setParams] = useSearchParams();
    const { data: pulse } = useChainPulse();
    const { data: packs = [] } = useAllPackAddresses();
    const q = params.get('pack');
    const selected = (q && isAddress(q) ? q : packs[0]) as Address | undefined;

    const facts: [string, React.ReactNode][] = [
        ['Network', TESTNET_CONFIG.name],
        ['Chain ID', TESTNET_CONFIG.chainId],
        ['RPC', TESTNET_CONFIG.rpcUrl.replace('https://', '')],
        ['Factory', <AddressText key="f" address={PACK_FACTORY_ADDRESS} link />],
        ['Latest block', pulse ? <a key="b" href={explorerBlock(pulse.block)} target="_blank" rel="noreferrer" className="underline underline-offset-4">#{pulse.block.toString()}</a> : '…'],
        ['Packs on chain', pulse ? pulse.packs.toString() : '…'],
    ];

    return (
        <AppShell>
            <section className="container grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.4fr]">
                <div>
                    <p className="eyebrow">Proof</p>
                    <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">Don't trust us. Check.</h1>
                    <p className="mt-4 max-w-md text-ink-soft">
                        Each pack's ledger is rebuilt in your browser from its DogeOS event log and compared against the contract's own numbers and its real balance. No server in between.
                    </p>
                    <dl className="receipt mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 px-5 pt-4 font-mono text-xs">
                        {facts.map(([k, v]) => (
                            <div key={k} className="contents">
                                <dt className="uppercase tracking-[0.08em] text-ink-soft">{k}</dt>
                                <dd className="text-right">{v}</dd>
                            </div>
                        ))}
                    </dl>
                    {packs.length > 0 && (
                        <label className="mt-8 block">
                            <span className="text-sm font-semibold">Audit a pack</span>
                            <select className="field-input mt-1.5 font-mono text-sm" value={selected} onChange={(e) => setParams({ pack: e.target.value })}>
                                {packs.map((p) => <option key={p} value={p}>{shortAddress(p)}</option>)}
                                {selected && !packs.includes(selected) && <option value={selected}>{shortAddress(selected)}</option>}
                            </select>
                        </label>
                    )}
                </div>
                <div>{selected ? <AuditReport address={selected} /> : <div className="ticket p-6"><p className="font-display text-2xl">No packs to audit yet.</p></div>}</div>
            </section>
        </AppShell>
    );
};

export default ProofPage;
