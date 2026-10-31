import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWriteContract } from 'wagmi';
import type { Abi, Address, Hex, TransactionReceipt } from 'viem';
import { toast } from '@/hooks/use-toast';
import { TARGET_CHAIN } from '@/lib/config';
import { publicClient } from '@/lib/pack';
import { describeTxError, isReceiptTimeout, REJECTED_COPY } from '@/lib/txErrors';
import { ensureTargetChain, isUserRejection, waitForWalletSync } from '@/lib/wagmi';

export type TxPhase = 'idle' | 'signing' | 'pending' | 'success' | 'error';

export interface TxRequest {
    address: Address;
    abi: Abi;
    functionName: string;
    args?: readonly unknown[];
    value?: bigint;
}

/**
 * One contract write with honest states: signing → pending (~15s blocks) → success / error.
 * Waits for the receipt on the DogeOS RPC, then refreshes every chain query.
 */
export function usePackTx() {
    const { writeContractAsync } = useWriteContract();
    const qc = useQueryClient();
    const [phase, setPhase] = useState<TxPhase>('idle');
    const [hash, setHash] = useState<Hex>();
    const [error, setError] = useState<string>();

    const run = useCallback(
        async (req: TxRequest, successTitle: string): Promise<TransactionReceipt | null> => {
            setError(undefined);
            setHash(undefined);
            setPhase('signing');
            try {
                // Embedded sign-in must be visible to wagmi before any write is attempted.
                await waitForWalletSync();
                await ensureTargetChain();
                const h = await writeContractAsync({ ...req, chainId: TARGET_CHAIN.id } as Parameters<typeof writeContractAsync>[0]);
                setHash(h);
                setPhase('pending');
                const receipt = await publicClient.waitForTransactionReceipt({ hash: h, timeout: 180_000 });
                if (receipt.status !== 'success') throw new Error('The pack contract rejected this transaction.');
                setPhase('success');
                toast({ title: successTitle, description: 'Confirmed on DogeOS. Receipt updated.' });
                await qc.invalidateQueries();
                return receipt;
            } catch (err) {
                const rejected = isUserRejection(err);
                const msg = describeTxError(err);
                const timedOut = isReceiptTimeout(err);
                setError(msg);
                setPhase(rejected ? 'idle' : 'error');
                toast({ title: rejected ? REJECTED_COPY : msg, variant: rejected || timedOut ? 'default' : 'destructive' });
                // The tx may have landed after we stopped waiting: refresh so the UI catches up.
                if (timedOut) void qc.invalidateQueries();
                return null;
            }
        },
        [writeContractAsync, qc],
    );

    const reset = useCallback(() => {
        setPhase('idle');
        setError(undefined);
        setHash(undefined);
    }, []);

    return { run, phase, hash, error, reset, busy: phase === 'signing' || phase === 'pending' };
}
