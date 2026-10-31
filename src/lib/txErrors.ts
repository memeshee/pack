import { BaseError, ContractFunctionRevertedError, HttpRequestError, InsufficientFundsError, TimeoutError } from 'viem';
import { isUserRejection, WALLET_NOT_SYNCED } from '@/lib/wagmi';

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
    NotEnoughMembers: 'This needs more backers: a pot can only be filled or spent once at least as many people have chipped in as approvals are required.',
    TransferFailed: "The recipient couldn't receive DOGE. Try a different address.",
    DeadlineNotPassed: 'Refunds open after the deadline.',
    GoalReached: 'The goal was met and enough backers joined, so the pot is going to the plan — no refunds.',
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

export const NOT_SYNCED_COPY = "Your sign-in worked, but the wallet isn't ready to send yet. Try again in a moment, or use a browser wallet.";
export const RPC_COPY = "DogeOS didn't answer. Nothing was lost — check your connection and try again.";
export const TIMEOUT_COPY = 'This is taking longer than usual. The transaction may still confirm — check the explorer link before trying again.';

/** True when we stopped waiting for a receipt; the transaction itself may still land. */
export const isReceiptTimeout = (err: unknown) => (err as Error)?.name === 'WaitForTransactionReceiptTimeoutError';

export function describeTxError(err: unknown): string {
    if (isUserRejection(err)) return REJECTED_COPY;
    if (isReceiptTimeout(err)) return TIMEOUT_COPY;
    if ((err as Error)?.message === WALLET_NOT_SYNCED) return NOT_SYNCED_COPY;
    if (err instanceof BaseError) {
        const revert = err.walk((e) => e instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError | null;
        const name = revert?.data?.errorName;
        if (name && REVERTS[name]) return `The pack contract said no. ${REVERTS[name]}`;
        if (err.walk((e) => e instanceof InsufficientFundsError)) return "You don't have enough test DOGE for this plus gas. Get test DOGE or chip in less.";
        if (err.walk((e) => e instanceof HttpRequestError || e instanceof TimeoutError)) return RPC_COPY;
        if (err.name === 'ChainMismatchError' || err.walk((e) => (e as Error).name === 'ChainMismatchError') || /chain/i.test(err.shortMessage)) return 'Wrong network. Switch to DogeOS Testnet to use this pack.';
        if (/insufficient funds|exceeds the balance/i.test(err.shortMessage)) return "You don't have enough test DOGE for this plus gas. Get test DOGE or chip in less.";
        return err.shortMessage;
    }
    const msg = (err as Error)?.message ?? '';
    if (/not connected/i.test(msg)) return 'Sign in first.';
    if (/failed to fetch|network ?error/i.test(msg)) return RPC_COPY;
    if (/insufficient funds/i.test(msg)) return "You don't have enough test DOGE for this plus gas. Get test DOGE or chip in less.";
    return msg || 'Something went wrong. Try again.';
}
