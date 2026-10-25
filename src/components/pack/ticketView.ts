import type { Address } from 'viem';
import { fallbackName, resolveMetadata, type PackMetadata } from '@/lib/metadata';
import type { PackStatusValue, PackSummary } from '@/lib/pack';

/** Presentation model for a pack ticket — decoupled so a clearly-labelled sample can use it too. */
export interface TicketView {
    address?: Address;
    name: string;
    emoji: string;
    story?: string;
    status: PackStatusValue;
    pot: bigint;
    goal: bigint;
    deadline: number;
    threshold: number;
    maxMembers: number;
    members: string[];
    /** True when the name/story hash-matches the on-chain metadataHash. */
    verifiedMeta: boolean;
}

export function toTicketView(s: PackSummary, candidate?: PackMetadata | null): TicketView {
    const meta = resolveMetadata(s.address, s.metadataHash, candidate);
    return {
        address: s.address,
        name: meta?.name ?? fallbackName(s.address),
        emoji: meta?.emoji ?? '🐕',
        story: meta?.story,
        status: s.status,
        pot: s.totalContributed,
        goal: s.goal,
        deadline: s.deadline,
        threshold: s.threshold,
        maxMembers: s.maxMembers,
        members: s.members,
        verifiedMeta: !!meta,
    };
}
