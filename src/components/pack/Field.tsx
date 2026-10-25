import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
    id: string;
    label: string;
    hint?: ReactNode;
    error?: string;
    children: ReactNode;
    className?: string;
}

/** Label + control + inline hint/error. Errors are announced and tied to the input via id. */
export function Field({ id, label, hint, error, children, className }: FieldProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <label htmlFor={id} className="block text-sm font-semibold tracking-tight">
                {label}
            </label>
            {children}
            {error ? (
                <p id={`${id}-error`} role="alert" className="text-[13px] font-medium text-stamp">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="text-[13px] text-ink-soft">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}
