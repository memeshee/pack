import { isAddress, parseEther } from 'viem';
import { LIMITS } from '@/lib/pack';

const bytes = (s: string) => new TextEncoder().encode(s).length;
const AMOUNT_RE = /^\d+(\.\d{1,18})?$/;

/** Parses a DOGE amount string to wei, or null if malformed / zero. */
export function parseDoge(input: string): bigint | null {
    const v = input.trim();
    if (!AMOUNT_RE.test(v)) return null;
    try {
        const wei = parseEther(v);
        return wei > 0n ? wei : null;
    } catch {
        return null;
    }
}

export interface CreateForm {
    name: string;
    emoji: string;
    story: string;
    goal: string;
    deadline: string; // yyyy-mm-dd (local)
    threshold: number;
    maxMembers: number;
}

/** Deadline = end of the chosen local day, as unix seconds. */
export const deadlineUnix = (date: string) => Math.floor(new Date(`${date}T23:59:00`).getTime() / 1000);

export function validateCreate(f: CreateForm): Partial<Record<keyof CreateForm, string>> {
    const e: Partial<Record<keyof CreateForm, string>> = {};
    const now = Date.now() / 1000;
    if (!f.name.trim()) e.name = 'Give the plan a name.';
    else if (bytes(f.name.trim()) > LIMITS.name) e.name = `Keep it under ${LIMITS.name} characters.`;
    if (!f.emoji || bytes(f.emoji) > LIMITS.emoji) e.emoji = 'Pick one emoji.';
    if (bytes(f.story.trim()) > LIMITS.story) e.story = `Keep the story under ${LIMITS.story} characters.`;
    if (!parseDoge(f.goal)) e.goal = 'Set a goal above zero, like 300.';
    const d = f.deadline ? deadlineUnix(f.deadline) : NaN;
    if (!Number.isFinite(d)) e.deadline = 'Pick a deadline.';
    else if (d < now + 3600 + 120) e.deadline = 'The deadline needs to be at least an hour away.';
    else if (d > now + 364 * 86400) e.deadline = 'Keep the deadline within a year.';
    if (f.maxMembers < LIMITS.minMembers || f.maxMembers > LIMITS.maxMembers) e.maxMembers = 'A pack holds 2 to 12 backers.';
    if (f.threshold < 2 || f.threshold > f.maxMembers) e.threshold = `Approvals must be between 2 and ${f.maxMembers}.`;
    return e;
}

export interface ProposalForm {
    recipient: string;
    amount: string;
    memo: string;
}

export function validateProposal(f: ProposalForm, pack: string, balance: bigint): Partial<Record<keyof ProposalForm, string>> {
    const e: Partial<Record<keyof ProposalForm, string>> = {};
    const r = f.recipient.trim();
    if (!isAddress(r)) e.recipient = 'Paste a full 0x… address.';
    else if (/^0x0{40}$/i.test(r) || r.toLowerCase() === pack.toLowerCase()) e.recipient = "The pack can't pay itself or the zero address.";
    const wei = parseDoge(f.amount);
    if (!wei) e.amount = 'Enter an amount above zero.';
    else if (wei > balance) e.amount = "The pot doesn't hold that much.";
    if (!f.memo.trim()) e.memo = "Say what it's for.";
    else if (bytes(f.memo.trim()) > LIMITS.memo) e.memo = `Keep it under ${LIMITS.memo} characters.`;
    return e;
}
