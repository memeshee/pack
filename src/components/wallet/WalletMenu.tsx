import { Copy, ExternalLink, LogOut } from 'lucide-react';
import { useBalance } from 'wagmi';
import type { Address } from 'viem';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { FAUCET_URL, TARGET_CHAIN, explorerAddress } from '@/lib/config';
import { formatDoge, shortAddress } from '@/lib/pack';

const itemClass = 'cursor-pointer gap-2 rounded-sm px-2 py-2 text-sm focus:bg-doge/40 focus:text-ink';

/** Connected state: a dog-tag chip with balance, opening copy / explorer / faucet / disconnect. */
export function WalletMenu({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
    const { data: bal } = useBalance({ address: address as Address, chainId: TARGET_CHAIN.id, query: { refetchInterval: 15_000 } });

    const copy = async () => {
        await navigator.clipboard.writeText(address);
        toast({ title: 'Address copied' });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex min-h-9 items-center gap-2 rounded-md border-[1.5px] border-ink bg-paper-light py-1 pl-1.5 pr-3 shadow-press-sm transition-transform duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp">
                <span className="grid h-6 w-6 place-items-center rounded-[5px] bg-doge font-mono text-[10px] font-bold uppercase" aria-hidden>
                    {address.slice(2, 4)}
                </span>
                <span className="font-mono text-xs">{shortAddress(address)}</span>
                {bal && <span className="hidden font-mono text-xs text-ink-soft sm:inline">· {formatDoge(bal.value, 1)} DOGE</span>}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-md border-[1.5px] border-ink bg-paper-light p-1 text-ink shadow-press">
                <DropdownMenuLabel className="font-mono text-[11px] font-normal uppercase tracking-[0.12em] text-ink-soft">
                    DogeOS Testnet · {bal ? `${formatDoge(bal.value)} DOGE` : '…'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-ink/15" />
                <DropdownMenuItem className={itemClass} onSelect={copy}>
                    <Copy className="h-4 w-4" aria-hidden /> Copy address
                </DropdownMenuItem>
                <DropdownMenuItem className={itemClass} asChild>
                    <a href={explorerAddress(address)} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" aria-hidden /> View on explorer
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem className={itemClass} asChild>
                    <a href={FAUCET_URL} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" aria-hidden /> Get test DOGE
                    </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-ink/15" />
                <DropdownMenuItem className={`${itemClass} text-stamp focus:text-stamp`} onSelect={onDisconnect}>
                    <LogOut className="h-4 w-4" aria-hidden /> Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
