import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getPackActivity } from '@/lib/activity';
import {
    getAllPackAddresses,
    getMyPackAddresses,
    getPackCount,
    getPackSummary,
    getProposals,
    getRecentPackAddresses,
    getViewerState,
    publicClient,
} from '@/lib/pack';

/** DogeOS blocks land every ~14s — poll just slower than that. */
const POLL_MS = 15_000;

export function useLivePacks(limit = 6) {
    return useQuery({
        queryKey: ['live-packs', limit],
        queryFn: async () => Promise.all((await getRecentPackAddresses(limit)).map(getPackSummary)),
        refetchInterval: POLL_MS,
    });
}

export function useAllPackAddresses() {
    return useQuery({ queryKey: ['all-packs'], queryFn: getAllPackAddresses, refetchInterval: POLL_MS * 2 });
}

export function useMyPacks(user?: Address) {
    return useQuery({
        queryKey: ['my-packs', user],
        queryFn: async () => Promise.all((await getMyPackAddresses(user as Address)).map(getPackSummary)),
        enabled: !!user,
        refetchInterval: POLL_MS,
    });
}

export function usePackSummary(address?: Address) {
    return useQuery({
        queryKey: ['pack', address],
        queryFn: () => getPackSummary(address as Address),
        enabled: !!address,
        refetchInterval: POLL_MS,
        retry: 1,
    });
}

export function useProposals(address?: Address, count?: bigint) {
    return useQuery({
        queryKey: ['proposals', address, count?.toString()],
        queryFn: () => getProposals(address as Address),
        enabled: !!address && count !== undefined,
        refetchInterval: POLL_MS,
    });
}

export function useViewerState(pack?: Address, viewer?: Address, proposalIds: bigint[] = []) {
    return useQuery({
        queryKey: ['viewer', pack, viewer, proposalIds.length],
        queryFn: () => getViewerState(pack as Address, viewer as Address, proposalIds),
        enabled: !!pack && !!viewer,
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
