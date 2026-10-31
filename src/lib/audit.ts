import { encodeAbiParameters, keccak256, type Address } from 'viem';
import { getPackActivity, type ActivityItem } from '@/lib/activity';
import { formatDoge, getPackSummary, getProposals, publicClient, type PackSummary } from '@/lib/pack';

export interface Check {
    label: string;
    ok: boolean;
    detail: string;
}

export interface PackAudit {
    pack: PackSummary;
    nativeBalance: bigint;
    events: ActivityItem[];
    checks: Check[];
    ok: boolean;
    checkedAt: number;
}

const sum = (items: ActivityItem[], kind: ActivityItem['kind']) => items.filter((i) => i.kind === kind).reduce((a, i) => a + (i.amount ?? 0n), 0n);
const d = (wei: bigint) => `${formatDoge(wei, 4)} DOGE`;

/**
 * Independently rebuilds a pack's ledger from its DogeOS event log and compares it
 * against the contract's own counters and the address's native balance.
 */
export async function auditPack(address: Address): Promise<PackAudit> {
    const pack = await getPackSummary(address);
    const [events, proposals, nativeBalance] = await Promise.all([
        getPackActivity(address, pack.createdBlock, 0),
        getProposals(address),
        publicClient.getBalance({ address }),
    ]);

    const contributed = sum(events, 'Contributed');
    const paid = sum(events, 'PayoutExecuted');
    const refunded = sum(events, 'RefundClaimed');
    const expected = pack.totalContributed - pack.totalPaidOut - pack.totalRefunded;
    const backers = new Set(events.filter((e) => e.kind === 'Contributed').map((e) => e.actor.toLowerCase())).size;
    const executed = proposals.filter((p) => p.executed);
    const hash = keccak256(encodeAbiParameters([{ type: 'string' }, { type: 'string' }, { type: 'string' }], [pack.name, pack.emoji, pack.story]));
    const goalMet = pack.totalContributed >= pack.goal;
    const enough = pack.memberCount >= pack.threshold;
    // Refunds are legitimate when the goal was missed OR too few backers existed to ever approve a spend.
    const refundAllowed = !goalMet || !enough;

    const checks: Check[] = [
        { label: 'Contributions match the event log', ok: contributed === pack.totalContributed, detail: `${d(contributed)} in events · ${d(pack.totalContributed)} on contract` },
        { label: 'Payouts match the event log', ok: paid === pack.totalPaidOut, detail: `${d(paid)} in events · ${d(pack.totalPaidOut)} on contract` },
        { label: 'Refunds match the event log', ok: refunded === pack.totalRefunded, detail: `${d(refunded)} in events · ${d(pack.totalRefunded)} on contract` },
        { label: 'Balance = in − paid − refunded', ok: nativeBalance === expected, detail: `${d(nativeBalance)} held · ${d(expected)} expected` },
        { label: 'Backer count matches', ok: backers === pack.memberCount && pack.memberCount === pack.members.length, detail: `${backers} unique contributors · ${pack.memberCount} members` },
        { label: 'Within the member cap', ok: pack.memberCount <= pack.maxMembers, detail: `${pack.memberCount} of ${pack.maxMembers}` },
        { label: 'Every payout had enough approvals', ok: executed.every((p) => p.approvals >= pack.threshold), detail: `${executed.length} paid · threshold ${pack.threshold}` },
        { label: 'No payout before the goal', ok: pack.totalPaidOut === 0n || goalMet, detail: goalMet ? 'Goal met' : 'Goal not met' },
        { label: 'Enough backers to approve', ok: enough || !goalMet, detail: `${pack.memberCount} backers · ${pack.threshold} approvals needed${enough ? '' : goalMet ? ' — goal met but pot is stuck until refunds open' : ' — not needed until the goal is met'}` },
        { label: 'Refunds only when the goal was missed or backers were too few', ok: pack.totalRefunded === 0n || refundAllowed, detail: `${d(pack.totalRefunded)} refunded · ${goalMet ? 'goal met' : 'goal missed'}, ${enough ? 'enough' : 'too few'} backers` },
        { label: 'No payout and refund both happened', ok: pack.totalPaidOut === 0n || pack.totalRefunded === 0n, detail: `${d(pack.totalPaidOut)} paid · ${d(pack.totalRefunded)} refunded` },
        { label: 'Name & story match the on-chain hash', ok: hash.toLowerCase() === pack.metadataHash.toLowerCase(), detail: `${pack.metadataHash.slice(0, 10)}…${pack.metadataHash.slice(-6)}` },
    ];

    return { pack, nativeBalance, events, checks, ok: checks.every((c) => c.ok), checkedAt: Date.now() };
}
