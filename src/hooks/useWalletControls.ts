import { useAccount as useDogeAccount, useWalletConnect } from '@dogeos/dogeos-sdk';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { DOGEOS_SDK_ENABLED, TARGET_CHAIN } from '@/lib/config';
import { getInjectedConnector } from '@/lib/wagmi';

export interface WalletControls {
    address?: string;
    isConnected: boolean;
    isConnecting: boolean;
    /** Signed in through the SDK but wagmi has not picked the account up yet: writes are not ready. */
    syncing: boolean;
    wrongChain: boolean;
    /** Primary sign-in: DogeOS modal (X / email), or the browser wallet if no SDK is configured. */
    open: () => void;
    /** Always-available fallback: connect an injected browser wallet (MetaMask, Rabby, ...). */
    openBrowser: () => void;
    disconnect: () => void;
    provider: 'dogeos' | 'browser';
}

/** Shared by both variants so the fallback behaves identically. */
function useBrowserConnect() {
    const { connect, isPending } = useConnect();
    return { isPending, openBrowser: () => connect({ connector: getInjectedConnector(), chainId: TARGET_CHAIN.id }) };
}

/** DogeOS SDK: embedded wallets (email / Google / X) + injected; synced into wagmi. */
function useDogeOSControls(): WalletControls {
    const sdk = useWalletConnect();
    const sdkAccount = useDogeAccount();
    const wagmi = useAccount();
    const browser = useBrowserConnect();
    const { disconnect: wagmiDisconnect } = useDisconnect();
    return {
        address: wagmi.address ?? sdkAccount.address ?? undefined,
        isConnected: wagmi.isConnected || sdk.isConnected,
        isConnecting: sdk.isConnecting || browser.isPending,
        syncing: sdk.isConnected && !wagmi.isConnected,
        wrongChain: wagmi.isConnected && wagmi.chainId !== TARGET_CHAIN.id,
        open: () => sdk.openModal(),
        openBrowser: browser.openBrowser,
        disconnect: () => {
            void sdk.disconnect();
            wagmiDisconnect();
        },
        provider: 'dogeos',
    };
}

/** Fallback when no DogeOS client id is configured: "Use a browser wallet" via the injected connector. */
function useBrowserControls(): WalletControls {
    const browser = useBrowserConnect();
    const { disconnect } = useDisconnect();
    const { address, isConnected, chainId } = useAccount();
    return {
        address,
        isConnected,
        isConnecting: browser.isPending,
        syncing: false,
        wrongChain: isConnected && chainId !== TARGET_CHAIN.id,
        open: browser.openBrowser,
        openBrowser: browser.openBrowser,
        disconnect: () => disconnect(),
        provider: 'browser',
    };
}

/** Chosen once at module load (stable across renders), so hook order never changes. */
export const useWalletControls = DOGEOS_SDK_ENABLED ? useDogeOSControls : useBrowserControls;
