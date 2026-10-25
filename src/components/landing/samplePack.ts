import { parseEther } from 'viem';
import type { TicketView } from '@/components/pack/ticketView';
import { PackStatus } from '@/lib/pack';

/**
 * Shown only while the factory has zero packs, always under a "Sample — not on chain" ribbon.
 * Never presented as live data.
 */
export const SAMPLE_TICKET: TicketView = {
    name: 'Doge Dinner — Friday',
    emoji: '🍜',
    story: 'Rooftop table for the Lisbon crew. We book it when the pot hits 300.',
    status: PackStatus.Funding,
    pot: parseEther('220'),
    goal: parseEther('300'),
    deadline: Math.floor(Date.now() / 1000) + 5 * 86400,
    threshold: 2,
    maxMembers: 6,
    members: ['0x7a31c2d0000000000000000000000000000000a1', '0x1f9e44b0000000000000000000000000000000b2', '0xc0de5a70000000000000000000000000000000c3'],
    verifiedMeta: false,
};
