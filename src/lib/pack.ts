import { createPublicClient, formatEther, http, type Abi, type Address, type Hex } from 'viem';
import PackArtifact from '@/abi/PackABI.json';
import PackFactoryArtifact from '@/abi/PackFactoryABI.json';
import { PACK_FACTORY_ADDRESS } from '@/contracts/address';
import { TARGET_CHAIN, TESTNET_CONFIG } from '@/lib/config';

/** Hardhat artifacts contain metadata — only the `.abi` array goes to viem. */
export const PACK_ABI = PackArtifact.abi as Abi;
export const PACK_FACTORY_ABI = PackFactoryArtifact.abi as Abi;

/** Read-only client straight to the DogeOS RPC — the chain is the only source of truth. */
export const publicClient = createPublicClient({
    chain: TARGET_CHAIN,
    transport: http(TESTNET_CONFIG.rpcUrl),
});

export const PackStatus = { Funding: 0, Funded: 1, PaidOut: 2, Refundable: 3 } as const;
export type PackStatusValue = (typeof PackStatus)[keyof typeof PackStatus];

/** Contract limits mirrored for client-side validation (see Pack.sol). */
export const LIMITS = { name: 48, emoji: 16, story: 160, memo: 140, minMembers: 2, maxMembers: 12, proposalTtl: 7 * 86400 } as const;

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
    name: string;
    emoji: string;
    story: string;
    members: Address[];
}

export interface Proposal {
    id: bigint;
    recipient: Address;
    amount: bigint;
    memo: string;
    approvals: number;
    executed: boolean;
    createdAt: number;
    proposer: Address;
    expired: boolean;
}

type Raw = Record<string, unknown>;

const readPack = <T,>(address: Address, functionName: string, args: readonly unknown[] = []) =>
    publicClient.readContract({ address, abi: PACK_ABI, functionName, args }) as Promise<T>;

const readFactory = <T,>(functionName: string, args: readonly unknown[] = []) =>
    publicClient.readContract({ address: PACK_FACTORY_ADDRESS, abi: PACK_FACTORY_ABI, functionName, args }) as Promise<T>;

/** Everything the UI needs about one pack — name, rules, totals — in two RPC calls. */
export async function getPackSummary(address: Address): Promise<PackSummary> {
    const [s, members] = await Promise.all([readPack<Raw>(address, 'summary'), readPack<Address[]>(address, 'members')]);
    return {
        address,
        creator: s.creator as Address,
        goal: s.goal as bigint,
        deadline: Number(s.deadline),
        threshold: Number(s.threshold),
        maxMembers: Number(s.maxMembers),
        metadataHash: s.metadataHash as Hex,
        totalContributed: s.totalContributed as bigint,
        totalPaidOut: s.totalPaidOut as bigint,
        totalRefunded: s.totalRefunded as bigint,
        memberCount: Number(s.memberCount),
        proposalCount: s.proposalCount as bigint,
        balance: s.balance as bigint,
        status: Number(s.status) as PackStatusValue,
        createdAt: Number(s.createdAt),
        createdBlock: s.createdBlock as bigint,
        name: String(s.name ?? ''),
        emoji: String(s.emoji ?? '🐕'),
        story: String(s.story ?? ''),
        members,
    };
}

export async function getProposals(address: Address): Promise<Proposal[]> {
    const raw = await readPack<Raw[]>(address, 'getProposals');
    const now = Date.now() / 1000;
    return raw.map((p, i) => {
        const createdAt = Number(p.createdAt);
        return {
            id: BigInt(i),
            recipient: p.recipient as Address,
            amount: p.amount as bigint,
            memo: String(p.memo),
            approvals: Number(p.approvals),
            executed: Boolean(p.executed),
            createdAt,
            proposer: p.proposer as Address,
            expired: now > createdAt + LIMITS.proposalTtl,
        };
    });
}

export interface ViewerState {
    contribution: bigint;
    refunded: boolean;
    approved: Record<string, boolean>;
}

/** The connected wallet's stake in a pack and which proposals it already stamped. */
export async function getViewerState(pack: Address, viewer: Address, proposalIds: bigint[]): Promise<ViewerState> {
    const [contribution, refunded, approvals] = await Promise.all([
        readPack<bigint>(pack, 'contributions', [viewer]),
        readPack<boolean>(pack, 'refunded', [viewer]),
        Promise.all(proposalIds.map((id) => readPack<boolean>(pack, 'approvedBy', [id, viewer]))),
    ]);
    return { contribution, refunded, approved: Object.fromEntries(proposalIds.map((id, i) => [id.toString(), approvals[i]])) };
}

/** Newest-first addresses of the most recent packs. */
export async function getRecentPackAddresses(limit = 6): Promise<Address[]> {
    const count = await getPackCount();
    if (count === 0n) return [];
    const take = BigInt(limit);
    const offset = count > take ? count - take : 0n;
    const addresses = await readFactory<Address[]>('getPacks', [offset, take]);
    return [...addresses].reverse();
}

export const getPackCount = () => readFactory<bigint>('packCount');
export const getAllPackAddresses = async () => [...(await readFactory<Address[]>('getPacks', [0n, await getPackCount()]))].reverse();

/** Packs a wallet backed or organized — straight from the factory registry. */
export async function getMyPackAddresses(user: Address): Promise<Address[]> {
    const [joined, created] = await Promise.all([readFactory<Address[]>('packsOf', [user]), readFactory<Address[]>('packsByCreator', [user])]);
    const seen = new Set<string>();
    return [...created, ...joined].reverse().filter((a) => {
        const k = a.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

export const isPackAddress = (address: Address) => readFactory<boolean>('isPack', [address]);

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
    if (s <= 0) return 'Deadline passed';
    const d = Math.floor(s / 86400);
    if (d >= 2) return `${d} days left`;
    const h = Math.floor(s / 3600);
    if (h >= 1) return `${h}h left`;
    return `${Math.max(1, Math.floor(s / 60))}m left`;
}
