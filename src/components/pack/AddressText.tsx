import { ArrowUpRight } from 'lucide-react';
import { explorerAddress } from '@/lib/config';
import { shortAddress } from '@/lib/pack';
import { cn } from '@/lib/utils';

interface AddressTextProps {
    address: string;
    link?: boolean;
    className?: string;
}

/** Truncated, mono address with an optional explorer link. Full address in the title. */
export function AddressText({ address, link = false, className }: AddressTextProps) {
    const body = <span className={cn('font-mono text-[0.92em]', className)} title={address}>{shortAddress(address)}</span>;
    if (!link) return body;
    return (
        <a
            href={explorerAddress(address)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-stamp"
        >
            {body}
            <ArrowUpRight className="h-3 w-3" aria-hidden />
            <span className="sr-only">View on explorer</span>
        </a>
    );
}
