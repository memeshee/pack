import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Dog-tag mark with a paw — reads at 16px. */
export function LogoMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
            <path d="M5 4h17l6 6v18H5z" className="fill-doge stroke-ink" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="22" cy="10" r="1.8" className="fill-ink" />
            <ellipse cx="16" cy="20.5" rx="3.6" ry="3" className="fill-ink" />
            <circle cx="11.6" cy="16.2" r="1.45" className="fill-ink" />
            <circle cx="14.4" cy="14" r="1.45" className="fill-ink" />
            <circle cx="17.6" cy="14" r="1.45" className="fill-ink" />
            <circle cx="20.4" cy="16.2" r="1.45" className="fill-ink" />
        </svg>
    );
}

export function Logo() {
    return (
        <Link to="/" className="group inline-flex items-center gap-2 rounded-md" aria-label="Pack home">
            <LogoMark className="transition-transform duration-200 ease-press group-hover:-rotate-6" />
            <span className="font-sans text-[22px] font-extrabold uppercase leading-none tracking-[-0.04em]">Pack</span>
        </Link>
    );
}
