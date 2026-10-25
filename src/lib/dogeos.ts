import { ChainTypeEnum, type WalletConnectKitConfig } from '@dogeos/dogeos-sdk';
import { DOGEOS_CLIENT_ID, TARGET_CHAIN } from '@/lib/config';

/**
 * DogeOS SDK configuration: embedded wallets (email / Google / X) + injected wallets,
 * locked to DogeOS Chikyū Testnet. The modal renders outside our CSS, so its theme
 * takes literal brand values mirroring the tokens in index.css (paper / ink / doge).
 */
export const dogeOSConfig = {
    clientId: DOGEOS_CLIENT_ID,
    defaultConnectChain: ChainTypeEnum.EVM,
    chains: { evm: [TARGET_CHAIN] },
    metadata: {
        name: 'Pack',
        description: "The shared pot for your pack's plans.",
        url: typeof window !== 'undefined' ? window.location.origin : '',
        icons: typeof window !== 'undefined' ? [`${window.location.origin}/favicon.svg`] : [],
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: { DEFAULT: '#F2C94C', foreground: '#14120F' },
                    background: '#F4EEDF',
                    foreground: '#14120F',
                },
            },
        },
    },
} as unknown as WalletConnectKitConfig;
