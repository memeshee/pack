import '@dogeos/dogeos-sdk/style.css';
import { useEffect, useRef, type ReactNode } from 'react';
import { WalletConnectProvider } from '@dogeos/dogeos-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import { DOGEOS_SDK_ENABLED, TARGET_CHAIN } from '@/lib/config';
import { dogeOSConfig } from '@/lib/dogeos';
import { ensureTargetChain, isUserRejection, wagmiConfig } from '@/lib/wagmi';

const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 2 } },
});

/**
 * Keeps the connected wallet on TARGET_CHAIN: prompts once to switch / add it.
 * If the user rejects, the header shows "Switch to DogeOS" and writes stay blocked.
 */
const ChainGuard = () => {
    const { isConnected, chainId, connector } = useAccount();
    const lastPrompt = useRef<string | null>(null);

    useEffect(() => {
        if (!isConnected || !chainId || chainId === TARGET_CHAIN.id) {
            lastPrompt.current = null;
            return;
        }
        const key = `${connector?.uid}:${chainId}`;
        if (lastPrompt.current === key) return;
        lastPrompt.current = key;

        ensureTargetChain().catch((err) => {
            toast({
                title: 'Switch to DogeOS Testnet to use Pack.',
                description: isUserRejection(err) ? 'No worries — you can switch from the header any time.' : 'Pick DogeOS Testnet in your wallet.',
                variant: 'destructive',
            });
        });
    }, [isConnected, chainId, connector]);

    return null;
};

/** DogeOS SDK sits inside WagmiProvider so embedded-wallet connections sync to wagmi hooks. */
const DogeOSLayer = ({ children }: { children: ReactNode }) =>
    DOGEOS_SDK_ENABLED ? <WalletConnectProvider config={dogeOSConfig}>{children}</WalletConnectProvider> : <>{children}</>;

export const Web3Provider = ({ children }: { children: ReactNode }) => (
    <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
            <DogeOSLayer>
                <ChainGuard />
                {children}
            </DogeOSLayer>
        </QueryClientProvider>
    </WagmiProvider>
);
