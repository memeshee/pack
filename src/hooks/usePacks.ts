import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getPackActivity } from '@/lib/activity';
import { getPackCount, getPackSummary, getRecentPackAddresses, publicClient } from '@/lib/pack';

/** DogeOS blocks land every ~14s — poll just slower than that. */
const POLL_MS = 15_000;

export function useLivePacks(limit = 6) {
    return useQuery({
        queryKey: ['live-packs', limit],
        queryFn: async () => {
            const addresses = await getRecentPackAddresses(limit);
            return Promise.all(addresses.map(getPackSummary));
        },
        refetchInterval: POLL_MS,
    });
}

export function usePackSummary(address?: Address) {
    return useQuery({
        queryKey: ['pack', address],
        queryFn: () => getPackSummary(address as Address),
        enabled: !!address,
        refetchInterval: POLL_MS,
    });
}

export function usePackActivity(address?: Address, fromBlock?: bigint) {
    return useQuery({
        queryKey: ['pack-activity', address, fromBlock?.toString()],
        queryFn: () => getPackActivity(address as Address, fromBlock as bigint),
        enabled: !!address && fromBlock !== undefined,
        refetchInterval: POLL_MS,
    });
}

export function useChainPulse() {
    return useQuery({
        queryKey: ['chain-pulse'],
        queryFn: async () => {
            const [block, packs] = await Promise.all([publicClient.getBlockNumber(), getPackCount()]);
            return { block, packs };
        },
        refetchInterval: POLL_MS,
    });
}
