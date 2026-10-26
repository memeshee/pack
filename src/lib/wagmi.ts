import { BaseError, UserRejectedRequestError, numberToHex, type EIP1193Provider } from 'viem';
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { getAccount, switchChain } from 'wagmi/actions';
import { TESTNET_CONFIG, TARGET_CHAIN } from '@/lib/config';

/**
 * Module-level singleton: use it from React (via <WagmiProvider>) and from plain
 * TS services (via `wagmi/actions`, e.g. `readContract(wagmiConfig, ...)`).
 *
 * Browser-extension wallets only (MetaMask, Trust Wallet, Rabby, ...) via the
 * injected connector. No WalletConnect relay / QR flow — the DogeOS SDK handles
 * mobile and embedded-wallet sign-in as the primary flow (see Web3Provider.tsx).
 */
export const wagmiConfig = createConfig({
    chains: [TARGET_CHAIN],
    connectors: [injected({ shimDisconnect: true })],
    transports: { [TARGET_CHAIN.id]: http(TESTNET_CONFIG.rpcUrl) },
    ssr: false,
});

declare module 'wagmi' {
    interface Register {
        config: typeof wagmiConfig;
    }
}

/** True when the user dismissed / rejected a wallet prompt. */
export const isUserRejection = (err: unknown): boolean => {
    const e = err as { code?: number | string; name?: string } | undefined;
    if (e?.code === 4001 || e?.code === 'ACTION_REJECTED' || e?.name === 'UserRejectedRequestError') return true;
    return err instanceof BaseError && !!err.walk((x) => x instanceof UserRejectedRequestError);
};

/**
 * Makes sure the connected wallet is on TARGET_CHAIN: switches to it, and adds it
 * to the wallet first (MetaMask, Trust Wallet, ...) if the wallet doesn't know it.
 * Throws if no wallet is connected or the user rejects the prompt.
 */
export async function ensureTargetChain(): Promise<void> {
    const { isConnected, chainId, connector } = getAccount(wagmiConfig);
    if (!isConnected || !connector) throw new Error('Wallet not connected');
    if (chainId === TARGET_CHAIN.id) return;

    try {
        // wagmi switches, and on error 4902 ("unknown chain") adds the chain and retries.
        await switchChain(wagmiConfig, { chainId: TARGET_CHAIN.id });
    } catch (err) {
        if (isUserRejection(err)) throw err;
        // Some wallets (e.g. Trust Wallet) report an unknown chain with a code other
        // than 4902, so wagmi never adds it. Add it explicitly, then switch.
        const provider = (await connector.getProvider()) as EIP1193Provider;
        await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: numberToHex(TARGET_CHAIN.id),
                chainName: TARGET_CHAIN.name,
                nativeCurrency: TARGET_CHAIN.nativeCurrency,
                rpcUrls: [TESTNET_CONFIG.rpcUrl],
                blockExplorerUrls: [TARGET_CHAIN.blockExplorers.default.url],
            }],
        });
        if (getAccount(wagmiConfig).chainId !== TARGET_CHAIN.id) {
            await switchChain(wagmiConfig, { chainId: TARGET_CHAIN.id });
        }
    }
}

/** Address of the connected wallet, or null. Safe to call anywhere. */
export const getConnectedAddress = (): string | null => {
    const { isConnected, address } = getAccount(wagmiConfig);
    return isConnected && address ? address : null;
};

/** The sole injected connector, used by the browser-wallet fallback "Use a browser wallet" action. */
export const getInjectedConnector = () => wagmiConfig.connectors[0];
