import { Loader2 } from 'lucide-react';
import { PackButton } from '@/components/pack/PackButton';
import { useWalletControls } from '@/hooks/useWalletControls';
import { toast } from '@/hooks/use-toast';
import { ensureTargetChain, isUserRejection } from '@/lib/wagmi';
import { WalletMenu } from './WalletMenu';

/** Header wallet control: sign in → (wrong chain) switch → account menu. */
export function ConnectButton() {
    const w = useWalletControls();

    if (w.isConnected && w.address && w.wrongChain) {
        return (
            <PackButton
                variant="danger"
                size="sm"
                onClick={() =>
                    ensureTargetChain().catch((e) =>
                        toast({ title: isUserRejection(e) ? 'No worries — nothing changed.' : 'Pick DogeOS Testnet in your wallet.' }),
                    )
                }
            >
                Switch to DogeOS
            </PackButton>
        );
    }

    if (w.isConnected && w.address) return <WalletMenu address={w.address} onDisconnect={w.disconnect} />;

    return (
        <div className="flex items-center gap-2">
            {w.provider === 'dogeos' && (
                <button type="button" onClick={w.openBrowser} disabled={w.isConnecting} className="hidden text-[13px] font-semibold underline underline-offset-4 disabled:opacity-50 md:inline">
                    Use a browser wallet
                </button>
            )}
            <PackButton size="sm" onClick={w.open} disabled={w.isConnecting} aria-label="Sign in to Pack">
                {w.isConnecting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {w.isConnecting ? 'Signing in…' : w.provider === 'dogeos' ? 'Sign in' : 'Use a browser wallet'}
            </PackButton>
        </div>
    );
}
