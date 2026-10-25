import { useAccount as useDogeAccount, useWalletConnect } from '@dogeos/dogeos-sdk';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { DOGEOS_SDK_ENABLED, TARGET_CHAIN } from '@/lib/config';

export interface WalletControls {
    address?: string;
    isConnected: boolean;
    isConnecting: boolean;
    wrongChain: boolean;
    open: () => void;
    disconnect: () => void;
    provider: 'dogeos' | 'browser';
}

/** DogeOS SDK: embedded wallets (email / Google / X) + injected; synced into wagmi. */
function useDogeOSControls(): WalletControls {
    const sdk = useWalletConnect();
    const sdkAccount = useDogeAccount();
    const wagmi = useAccount();
    return {
        address: wagmi.address ?? sdkAccount.address ?? undefined,
        isConnected: wagmi.isConnected || sdk.isConnected,
        isConnecting: sdk.isConnecting,
        wrongChain: wagmi.isConnected && wagmi.chainId !== TARGET_CHAIN.id,
        open: () => sdk.openModal(),
        disconnect: () => void sdk.disconnect(),
        provider: 'dogeos',
    };
}

/** Fallback when no DogeOS client id is configured: browser wallets via RainbowKit. */
function useBrowserControls(): WalletControls {
    const { openConnectModal } = useConnectModal();
    const { disconnect } = useDisconnect();
    const { address, isConnected, isConnecting, chainId } = useAccount();
    return {
        address,
        isConnected,
        isConnecting,
        wrongChain: isConnected && chainId !== TARGET_CHAIN.id,
        open: () => openConnectModal?.(),
        disconnect: () => disconnect(),
        provider: 'browser',
    };
}

/** Chosen once at module load (stable across renders), so hook order never changes. */
export const useWalletControls = DOGEOS_SDK_ENABLED ? useDogeOSControls : useBrowserControls;
