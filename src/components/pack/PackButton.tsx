import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** Pressable, print-like buttons. Offset ink shadow collapses on press. */
export const packButtonVariants = cva(
    'inline-flex min-h-11 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md border-[1.5px] border-ink px-5 font-sans text-[15px] font-semibold tracking-tight transition-[transform,box-shadow,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-doge text-ink shadow-press hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_hsl(var(--ink))] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
                ink: 'bg-ink text-paper-light shadow-press hover:bg-ink/90 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
                secondary: 'bg-paper-light text-ink hover:bg-paper-deep',
                ghost: 'border-transparent bg-transparent text-ink hover:bg-ink/5',
                danger: 'bg-stamp text-paper-light shadow-press active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
            },
            size: {
                sm: 'min-h-9 px-3 text-sm',
                md: '',
                lg: 'min-h-14 px-7 text-base',
            },
        },
        defaultVariants: { variant: 'primary', size: 'md' },
    },
);

export interface PackButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof packButtonVariants> {
    asChild?: boolean;
}

export const PackButton = forwardRef<HTMLButtonElement, PackButtonProps>(
    ({ className, variant, size, asChild, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return <Comp ref={ref} className={cn(packButtonVariants({ variant, size }), className)} {...props} />;
    },
);
PackButton.displayName = 'PackButton';
