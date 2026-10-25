import { keccak256, toHex, type Hex } from 'viem';

/**
 * Off-chain pack metadata. Its keccak256 hash is committed on-chain as `metadataHash`,
 * so any copy (local cache, share link, later Supabase) can be verified against the chain.
 */
export interface PackMetadata {
    v: 1;
    name: string;
    emoji: string;
    story?: string;
}

/** Canonical JSON: fixed key order, trimmed strings, no undefined keys. */
export function canonicalMetadata(m: PackMetadata): string {
    const ordered: Record<string, unknown> = { v: 1, name: m.name.trim(), emoji: m.emoji };
    if (m.story?.trim()) ordered.story = m.story.trim();
    return JSON.stringify(ordered);
}

export const hashMetadata = (m: PackMetadata): Hex => keccak256(toHex(canonicalMetadata(m)));

const KEY = (address: string) => `pack:meta:${address.toLowerCase()}`;

export function cacheMetadata(address: string, m: PackMetadata) {
    try {
        localStorage.setItem(KEY(address), canonicalMetadata(m));
    } catch {
        /* storage unavailable — non-critical */
    }
}

/** Encode metadata for a share link (?m=...) so a fresh browser can show the name. */
export const encodeMetadataParam = (m: PackMetadata) => btoa(unescape(encodeURIComponent(canonicalMetadata(m))));

export function decodeMetadataParam(param: string | null): PackMetadata | null {
    if (!param) return null;
    try {
        return JSON.parse(decodeURIComponent(escape(atob(param)))) as PackMetadata;
    } catch {
        return null;
    }
}

/** Returns metadata only if it hashes to the on-chain commitment. */
export function resolveMetadata(address: string, onchainHash: Hex, candidate?: PackMetadata | null): PackMetadata | null {
    const tryOne = (m: PackMetadata | null | undefined) =>
        m && typeof m.name === 'string' && hashMetadata(m).toLowerCase() === onchainHash.toLowerCase() ? m : null;
    const fromParam = tryOne(candidate);
    if (fromParam) {
        cacheMetadata(address, fromParam);
        return fromParam;
    }
    try {
        const raw = localStorage.getItem(KEY(address));
        return tryOne(raw ? (JSON.parse(raw) as PackMetadata) : null);
    } catch {
        return null;
    }
}

/** Fallback label when no verified metadata is available yet. */
export const fallbackName = (address: string) => `Pack ${address.slice(2, 6).toUpperCase()}`;
