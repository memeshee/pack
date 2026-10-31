import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.8.28',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                    viaIR: true,
                },
            },
            {
                version: '0.8.20',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                    viaIR: true,
                },
            },
            {
                version: '0.8.19',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                    viaIR: true,
                },
            },
        ],
    },
    networks: {
        dogeosTestnet: {
            url: 'https://rpc.testnet.dogeos.com',
            chainId: 6281971,
        },
    },
    etherscan: {
        apiKey: {
            dogeosTestnet: 'blockscout',
        },
        customChains: [
            {
                network: 'dogeosTestnet',
                chainId: 6281971,
                urls: {
                    apiURL: 'https://blockscout.testnet.dogeos.com/api',
                    browserURL: 'https://blockscout.testnet.dogeos.com',
                },
            },
        ],
    },
    sourcify: {
        enabled: false,
    },
};

export default config;
