import '@rainbow-me/rainbowkit/styles.css';
import '@dogeos/dogeos-sdk/style.css';
import { useEffect, useRef, type ReactNode } from 'react';
import { RainbowKitProvider, lightTheme, type Theme } from '@rainbow-me/rainbowkit';
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

/** RainbowKit (browser-wallet fallback) themed with Pack's tokens. */
const base = lightTheme({ accentColor: 'hsl(var(--doge))', accentColorForeground: 'hsl(var(--ink))', borderRadius: 'small' });
const packTheme: Theme = {
    ...base,
    colors: {
        ...base.colors,
        modalBackground: 'hsl(var(--paper-light))',
        modalBorder: 'hsl(var(--ink))',
        modalText: 'hsl(var(--ink))',
        modalTextSecondary: 'hsl(var(--ink-soft))',
        actionButtonSecondaryBackground: 'hsl(var(--paper-deep))',
        closeButtonBackground: 'hsl(var(--paper-deep))',
        closeButton: 'hsl(var(--ink))',
        generalBorder: 'hsl(var(--ink) / 0.2)',
        menuItemBackground: 'hsl(var(--doge) / 0.35)',
        profileForeground: 'hsl(var(--paper-light))',
    },
    fonts: { body: '"Inter Tight", system-ui, sans-serif' },
    shadows: { ...base.shadows, dialog: '6px 6px 0 0 hsl(var(--ink))' },
};

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
            <RainbowKitProvider initialChain={TARGET_CHAIN} modalSize="compact" theme={packTheme}>
                <DogeOSLayer>
                    <ChainGuard />
                    {children}
                </DogeOSLayer>
            </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
);
