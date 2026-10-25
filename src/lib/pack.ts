import { createPublicClient, formatEther, http, type Abi, type Address, type Hex } from 'viem';
import PackArtifact from '@/abi/PackABI.json';
import PackFactoryArtifact from '@/abi/PackFactoryABI.json';
import { PACK_FACTORY_ADDRESS } from '@/contracts/address';
import { TARGET_CHAIN, TESTNET_CONFIG } from '@/lib/config';

/** Hardhat artifacts contain metadata — only the `.abi` array goes to viem/ethers. */
export const PACK_ABI = PackArtifact.abi as Abi;
export const PACK_FACTORY_ABI = PackFactoryArtifact.abi as Abi;

/** Read-only client straight to the DogeOS RPC — the chain is the source of truth. */
export const publicClient = createPublicClient({
    chain: TARGET_CHAIN,
    transport: http(TESTNET_CONFIG.rpcUrl),
});

export const PackStatus = { Funding: 0, Funded: 1, PaidOut: 2, Refundable: 3 } as const;
export type PackStatusValue = (typeof PackStatus)[keyof typeof PackStatus];

export interface PackSummary {
    address: Address;
    creator: Address;
    goal: bigint;
    deadline: number;
    threshold: number;
    maxMembers: number;
    metadataHash: Hex;
    totalContributed: bigint;
    totalPaidOut: bigint;
    totalRefunded: bigint;
    memberCount: number;
    proposalCount: bigint;
    balance: bigint;
    status: PackStatusValue;
    createdAt: number;
    createdBlock: bigint;
    members: Address[];
}

type RawSummary = Omit<PackSummary, 'address' | 'createdBlock' | 'members' | 'deadline' | 'createdAt' | 'threshold' | 'maxMembers' | 'memberCount' | 'status'> & {
    deadline: bigint | number;
    createdAt: bigint | number;
    threshold: number;
    maxMembers: number;
    memberCount: number;
    status: number;
};

const readPack = <T,>(address: Address, functionName: string) =>
    publicClient.readContract({ address, abi: PACK_ABI, functionName }) as Promise<T>;

/** Everything the UI needs about one pack, in four RPC calls. */
export async function getPackSummary(address: Address): Promise<PackSummary> {
    const [raw, createdBlock, members] = await Promise.all([
        readPack<RawSummary>(address, 'summary'),
        readPack<bigint>(address, 'createdBlock'),
        readPack<Address[]>(address, 'members'),
    ]);
    return {
        ...raw,
        address,
        deadline: Number(raw.deadline),
        createdAt: Number(raw.createdAt),
        threshold: Number(raw.threshold),
        maxMembers: Number(raw.maxMembers),
        memberCount: Number(raw.memberCount),
        status: Number(raw.status) as PackStatusValue,
        createdBlock,
        members,
    };
}

/** Newest-first addresses of the most recent packs from the factory. */
export async function getRecentPackAddresses(limit = 6): Promise<Address[]> {
    const count = (await publicClient.readContract({
        address: PACK_FACTORY_ADDRESS,
        abi: PACK_FACTORY_ABI,
        functionName: 'packCount',
    })) as bigint;
    if (count === 0n) return [];
    const take = BigInt(limit);
    const offset = count > take ? count - take : 0n;
    const addresses = (await publicClient.readContract({
        address: PACK_FACTORY_ADDRESS,
        abi: PACK_FACTORY_ABI,
        functionName: 'getPacks',
        args: [offset, take],
    })) as Address[];
    return [...addresses].reverse();
}

export async function getPackCount(): Promise<bigint> {
    return (await publicClient.readContract({
        address: PACK_FACTORY_ADDRESS,
        abi: PACK_FACTORY_ABI,
        functionName: 'packCount',
    })) as bigint;
}

/* ---------- formatting ---------- */

/** Wei → human DOGE string. Never uses JS number for the raw amount. */
export function formatDoge(wei: bigint, maxFractionDigits = 2): string {
    const [whole, frac = ''] = formatEther(wei).split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const trimmed = frac.slice(0, maxFractionDigits).replace(/0+$/, '');
    return trimmed ? `${grouped}.${trimmed}` : grouped;
}

export const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** 0..1 progress toward the goal (capped). */
export const potProgress = (s: Pick<PackSummary, 'totalContributed' | 'goal'>) =>
    s.goal === 0n ? 0 : Math.min(1, Number((s.totalContributed * 10_000n) / s.goal) / 10_000);

export function timeLeft(deadline: number, now = Date.now() / 1000): string {
    const s = deadline - now;
    if (s <= 0) return 'Ended';
    const d = Math.floor(s / 86400);
    if (d >= 2) return `${d} days left`;
    const h = Math.floor(s / 3600);
    if (h >= 1) return `${h}h left`;
    return `${Math.max(1, Math.floor(s / 60))}m left`;
}
