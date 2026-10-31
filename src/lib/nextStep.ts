import { packPhase, type PackSummary, type Proposal, type ViewerState } from '@/lib/pack';

export type StepKey = 'invite' | 'chipin' | 'propose' | 'approve' | 'release' | 'refund' | 'done';

export interface NextStep {
    key: StepKey;
    title: string;
    body: string;
    /** In-page anchor for the call to action. */
    target?: string;
}

export const STEP_ORDER: { key: StepKey; label: string }[] = [
    { key: 'invite', label: 'Invite' },
    { key: 'chipin', label: 'Chip in' },
    { key: 'propose', label: 'Propose' },
    { key: 'approve', label: 'Approve' },
    { key: 'release', label: 'Release' },
    { key: 'refund', label: 'Refund' },
];

interface Input {
    pack: PackSummary;
    proposals: Proposal[];
    viewer?: ViewerState;
    connected: boolean;
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

/** The one thing that should happen next, derived only from chain state and the viewer's stake. */
export function nextStep({ pack, proposals, viewer, connected }: Input): NextStep {
    const ph = packPhase(pack);
    const mine = viewer?.contribution ?? 0n;
    const member = mine > 0n;
    const live = proposals.filter((p) => !p.executed && !p.expired);

    if (ph.refundable) {
        if (viewer?.refunded) return { key: 'done', title: 'Refunded', body: 'You already took your DOGE back.' };
        if (member) return { key: 'refund', title: 'Claim your refund', body: ph.goalMet ? 'The goal was met but too few backers joined to approve a spend.' : 'The goal was missed. Take back exactly what you put in.', target: '#actions' };
        return { key: 'refund', title: 'Refunds are open', body: 'Backers can each claim back what they put in.' };
    }
    if (pack.totalPaidOut > 0n && pack.balance === 0n) return { key: 'done', title: 'All paid out', body: 'Every spend has a receipt. Check the ledger any time.' };

    if (!ph.enoughBackers) {
        return { key: 'invite', title: `Invite ${plural(ph.backersNeeded, 'more backer')}`, body: `Spends need ${pack.threshold} approvals, so at least ${pack.threshold} people have to chip in${ph.goalMet ? ' before the pot can be spent' : ''}.`, target: '#share' };
    }
    if (!ph.goalMet) {
        if (!connected && ph.open) return { key: 'chipin', title: 'Sign in to chip in', body: 'X, email or a browser wallet.', target: '#actions' };
        return { key: 'chipin', title: 'Fill the pot', body: 'Keep chipping in until the goal is met, then decide together what it is for.', target: '#actions' };
    }

    const ready = live.find((p) => p.approvals >= pack.threshold);
    if (ready) return { key: 'release', title: `Release "${ready.memo}"`, body: member ? 'It has enough approvals. Any backer can release it.' : 'It has enough approvals and is waiting on a backer to release it.', target: '#spends' };
    const needsMe = live.find((p) => member && !viewer?.approved[p.id.toString()]);
    if (needsMe) return { key: 'approve', title: `Approve "${needsMe.memo}"`, body: `${needsMe.approvals} of ${pack.threshold} approvals so far.`, target: '#spends' };
    if (live.length > 0) return { key: 'approve', title: 'Waiting on approvals', body: `${live[0].approvals} of ${pack.threshold} for "${live[0].memo}". Nudge the pack.`, target: '#share' };
    return { key: 'propose', title: 'Propose a spend', body: member ? 'Say what the pot is for and who gets paid.' : 'Waiting for a backer to propose a spend.', target: member ? '#actions' : undefined };
}
