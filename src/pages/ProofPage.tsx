import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { isAddress, type Address } from 'viem';
import { AppShell } from '@/components/layout/AppShell';
import { AddressText } from '@/components/pack/AddressText';
import { PackButton } from '@/components/pack/PackButton';
import { AuditReport } from '@/components/proof/AuditReport';
import { FACTORY_DEPLOY_TX, PACK_FACTORY_ADDRESS } from '@/contracts/address';
import { useAllPackAddresses, useChainPulse } from '@/hooks/usePacks';
import { useSourceVerified } from '@/hooks/useSourceVerified';
import { TESTNET_CONFIG, explorerBlock, explorerCode, explorerTx } from '@/lib/config';
import { shortAddress } from '@/lib/pack';

const ext = 'underline underline-offset-4';

const SourceLink = () => {
    const { data = 'unknown' } = useSourceVerified(PACK_FACTORY_ADDRESS);
    const label = { verified: 'Verified source ↗', unverified: 'Not verified yet ↗', unknown: 'View source on explorer ↗' }[data];
    return <a href={explorerCode(PACK_FACTORY_ADDRESS)} target="_blank" rel="noreferrer" className={ext}>{label}</a>;
};

/** Don't trust us — check. Chain facts plus a per-pack audit, all read live from DogeOS. */
const ProofPage = () => {
    const [params, setParams] = useSearchParams();
    const [paste, setPaste] = useState('');
    const { data: pulse } = useChainPulse();
    const { data: packs = [], isLoading, isError, refetch } = useAllPackAddresses();
    const q = params.get('pack');
    const selected = (q && isAddress(q) ? q : packs[0]) as Address | undefined;

    const facts: [string, React.ReactNode][] = [
        ['Network', TESTNET_CONFIG.name],
        ['Chain ID', TESTNET_CONFIG.chainId],
        ['RPC', TESTNET_CONFIG.rpcUrl.replace('https://', '')],
        ['Factory', <AddressText key="f" address={PACK_FACTORY_ADDRESS} link />],
        ['Deploy tx', <a key="t" href={explorerTx(FACTORY_DEPLOY_TX)} target="_blank" rel="noreferrer" className={ext}>{shortAddress(FACTORY_DEPLOY_TX)} ↗</a>],
        ['Source', <SourceLink key="s" />],
        ['Latest block', pulse ? <a key="b" href={explorerBlock(pulse.block)} target="_blank" rel="noreferrer" className={ext}>#{pulse.block.toString()}</a> : '…'],
        ['Packs on chain', pulse ? pulse.packs.toString() : '…'],
    ];

    const lookup = (
        <form className="mt-8 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (isAddress(paste.trim())) setParams({ pack: paste.trim() }); }}>
            <label className="min-w-0 flex-1">
                <span className="sr-only">Pack address to audit</span>
                <input className="field-input font-mono text-sm" placeholder="Paste a pack address 0x…" spellCheck={false} value={paste} onChange={(e) => setPaste(e.target.value)} aria-invalid={paste.trim() !== '' && !isAddress(paste.trim())} />
            </label>
            <PackButton type="submit" variant="ink" disabled={!isAddress(paste.trim())}>Audit</PackButton>
        </form>
    );

    const right = selected ? <AuditReport address={selected} /> : isLoading ? (
        <div className="ticket h-80 animate-pulse" aria-busy="true" />
    ) : isError ? (
        <div className="ticket space-y-3 p-6">
            <p className="font-display text-2xl">DogeOS didn't answer.</p>
            <p className="text-sm text-ink-soft">We couldn't read the list of packs. You can still paste a pack address on the left.</p>
            <PackButton size="sm" onClick={() => void refetch()}>Try again</PackButton>
        </div>
    ) : (
        <div className="ticket space-y-3 p-6">
            <p className="font-display text-2xl">No packs to audit yet.</p>
            <p className="text-sm text-ink-soft">The first pack created on this factory will show up here, with its ledger checked line by line.</p>
            <PackButton asChild size="sm"><Link to="/create">Start a pack</Link></PackButton>
        </div>
    );

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
                    {packs.length > 1 && (
                        <label className="mt-8 block">
                            <span className="text-sm font-semibold">Audit a pack · {packs.length} on chain</span>
                            <select className="field-input mt-1.5 font-mono text-sm" value={selected} onChange={(e) => setParams({ pack: e.target.value })}>
                                {packs.map((p) => <option key={p} value={p}>{shortAddress(p)}</option>)}
                                {selected && !packs.includes(selected) && <option value={selected}>{shortAddress(selected)}</option>}
                            </select>
                        </label>
                    )}
                    {packs.length === 1 && <p className="mt-8 text-sm text-ink-soft">1 pack on chain: <AddressText address={packs[0]} link />.</p>}
                    {lookup}
                </div>
                <div>{right}</div>
            </section>
        </AppShell>
    );
};

export default ProofPage;
