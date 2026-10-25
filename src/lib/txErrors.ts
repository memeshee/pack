import { BaseError, ContractFunctionRevertedError, InsufficientFundsError } from 'viem';
import { isUserRejection } from '@/lib/wagmi';

/** Pack.sol custom errors → calm, actionable copy. */
const REVERTS: Record<string, string> = {
    DeadlinePassed: 'The deadline has passed, so the pot is closed to new DOGE.',
    ZeroAmount: 'Enter an amount above zero.',
    PackFull: 'This pack is full — every spot is taken.',
    GoalNotReached: 'The pot has to hit the goal before anyone can propose a spend.',
    NotMember: 'Only backers can do this. Chip in first.',
    InvalidRecipient: "That recipient can't receive from this pack.",
    InsufficientBalance: "The pot doesn't hold that much DOGE.",
    InvalidMemo: 'Add a short note (up to 140 characters).',
    ProposalNotFound: "That proposal doesn't exist.",
    AlreadyExecuted: 'This spend was already paid.',
    ProposalExpired: 'This proposal expired after 7 days. Propose it again.',
    AlreadyApproved: "You've already stamped this one.",
    ThresholdNotMet: "Not enough approvals yet — the pack hasn't agreed.",
    NotEnoughMembers: 'The pack needs more backers than the approval rule before money can move.',
    TransferFailed: "The recipient couldn't receive DOGE. Try a different address.",
    DeadlineNotPassed: 'Refunds open after the deadline.',
    GoalReached: 'The goal was met, so the pot is going to the plan — no refunds.',
    PayoutsMade: 'Money has already been spent from this pack, so refunds are closed.',
    NothingToRefund: "You didn't put anything into this pack.",
    AlreadyRefunded: 'You already got your DOGE back.',
    InvalidDeadline: 'Pick a deadline between 1 hour and 1 year from now.',
    InvalidMaxMembers: 'A pack holds 2 to 12 backers.',
    InvalidThreshold: 'Approvals must be at least 2 and no more than the max backers.',
    InvalidName: 'Give the pack a name (up to 48 characters).',
    InvalidEmoji: 'Pick one emoji.',
    InvalidStory: 'Keep the story under 160 characters.',
    ZeroGoal: 'Set a goal above zero.',
};

export const REJECTED_COPY = "No worries — nothing was sent. Try again when you're ready.";

export function describeTxError(err: unknown): string {
    if (isUserRejection(err)) return REJECTED_COPY;
    if (err instanceof BaseError) {
        const revert = err.walk((e) => e instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError | null;
        const name = revert?.data?.errorName;
        if (name && REVERTS[name]) return `The pack contract said no. ${REVERTS[name]}`;
        if (err.walk((e) => e instanceof InsufficientFundsError)) return "You don't have enough test DOGE for this plus gas. Get test DOGE or chip in less.";
        if (/chain/i.test(err.shortMessage)) return 'Switch to DogeOS Testnet to use this pack.';
        return err.shortMessage;
    }
    const msg = (err as Error)?.message ?? '';
    if (/not connected/i.test(msg)) return 'Sign in first.';
    return msg || 'Something went wrong. Try again.';
}
