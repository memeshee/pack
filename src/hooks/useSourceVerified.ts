import { useQuery } from '@tanstack/react-query';
import { explorerApi } from '@/lib/config';

export type SourceStatus = 'verified' | 'unverified' | 'unknown';

/** Asks the Blockscout explorer whether a contract's source is verified. Never guesses: failures are "unknown". */
export function useSourceVerified(address: string) {
    return useQuery<SourceStatus>({
        queryKey: ['source-verified', address],
        queryFn: async () => {
            const res = await fetch(explorerApi(`/smart-contracts/${address}`));
            if (res.status === 404) return 'unverified';
            if (!res.ok) return 'unknown';
            const body = (await res.json()) as { is_verified?: boolean; is_fully_verified?: boolean };
            return body.is_verified || body.is_fully_verified ? 'verified' : 'unverified';
        },
        staleTime: 5 * 60_000,
        retry: 1,
    });
}
