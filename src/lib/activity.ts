import type { Address, Hex } from 'viem';
import { PACK_ABI, publicClient } from '@/lib/pack';

export type ActivityKind = 'Contributed' | 'ProposalCreated' | 'ProposalApproved' | 'PayoutExecuted' | 'RefundClaimed';

export interface ActivityItem {
    id: string;
    kind: ActivityKind;
    actor: Address;
    amount?: bigint;
    proposalId?: bigint;
    memo?: string;
    approvals?: number;
    txHash: Hex;
    blockNumber: bigint;
    timestamp?: number;
}

const CHUNK = 10_000n;
const KINDS = new Set<string>(['Contributed', 'ProposalCreated', 'ProposalApproved', 'PayoutExecuted', 'RefundClaimed']);

type DecodedLog = {
    eventName?: string;
    args?: Record<string, unknown>;
    transactionHash: Hex | null;
    blockNumber: bigint | null;
    logIndex: number | null;
};

function toItem(log: DecodedLog): ActivityItem | null {
    if (!log.eventName || !KINDS.has(log.eventName) || !log.transactionHash || log.blockNumber == null) return null;
    const a = (log.args ?? {}) as {
        member?: Address;
        proposer?: Address;
        approver?: Address;
        recipient?: Address;
        amount?: bigint;
        id?: bigint;
        memo?: string;
        approvals?: number | bigint;
    };
    const kind = log.eventName as ActivityKind;
    const actor = (a.member ?? a.proposer ?? a.approver ?? a.recipient) as Address;
    if (!actor) return null;
    return {
        id: `${log.transactionHash}-${log.logIndex}`,
        kind,
        actor,
        amount: a.amount,
        proposalId: a.id,
        memo: a.memo,
        approvals: a.approvals != null ? Number(a.approvals) : undefined,
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
    };
}

/**
 * Full on-chain receipt for a pack, newest first. Reads events in 10k-block chunks
 * from the pack's creation block, then stamps the latest rows with block times.
 */
export async function getPackActivity(pack: Address, fromBlock: bigint, withTimesFor = 12): Promise<ActivityItem[]> {
    const latest = await publicClient.getBlockNumber();
    const logs: DecodedLog[] = [];
    for (let start = fromBlock; start <= latest; start += CHUNK) {
        const end = start + CHUNK - 1n > latest ? latest : start + CHUNK - 1n;
        const chunk = await publicClient.getContractEvents({ address: pack, abi: PACK_ABI, fromBlock: start, toBlock: end });
        logs.push(...(chunk as unknown as DecodedLog[]));
    }
    const items = logs
        .map(toItem)
        .filter((x): x is ActivityItem => x !== null)
        // The proposer's automatic approval duplicates the proposal row — keep the receipt clean.
        .filter((x, _, all) => !(x.kind === 'ProposalApproved' && x.approvals === 1 && all.some((p) => p.kind === 'ProposalCreated' && p.txHash === x.txHash)))
        .reverse();

    const blocks = [...new Set(items.slice(0, withTimesFor).map((i) => i.blockNumber))];
    const times = new Map<bigint, number>();
    await Promise.all(
        blocks.map(async (n) => {
            const b = await publicClient.getBlock({ blockNumber: n });
            times.set(n, Number(b.timestamp));
        }),
    );
    return items.map((i) => ({ ...i, timestamp: times.get(i.blockNumber) }));
}

export function relativeTime(ts?: number, now = Date.now() / 1000): string {
    if (!ts) return '—';
    const s = Math.max(0, now - ts);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}
