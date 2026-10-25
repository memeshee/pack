import type { Address } from 'viem';
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
}

/** Name, emoji and story are stored on-chain in the Pack contract — no off-chain lookup. */
export const toTicketView = (s: PackSummary): TicketView => ({
    address: s.address,
    name: s.name || `Pack ${s.address.slice(2, 6).toUpperCase()}`,
    emoji: s.emoji || '🐕',
    story: s.story || undefined,
    status: s.status,
    pot: s.totalContributed,
    goal: s.goal,
    deadline: s.deadline,
    threshold: s.threshold,
    maxMembers: s.maxMembers,
    members: s.members,
});
