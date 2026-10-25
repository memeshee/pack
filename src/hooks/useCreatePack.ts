import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseEventLogs, type Address } from 'viem';
import { PACK_FACTORY_ADDRESS } from '@/contracts/address';
import { PACK_FACTORY_ABI } from '@/lib/pack';
import { deadlineUnix, parseDoge, validateCreate, type CreateForm } from '@/lib/validate';
import { usePackTx } from './usePackTx';

const isoDay = (offsetDays: number) => {
    const d = new Date(Date.now() + offsetDays * 86400_000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const DEFAULT_FORM: CreateForm = { name: '', emoji: '🍜', story: '', goal: '300', deadline: isoDay(7), threshold: 2, maxMembers: 6 };

/** Form state + validation + the createPack transaction, then redirect to the new pack. */
export function useCreatePack() {
    const [form, setForm] = useState<CreateForm>(DEFAULT_FORM);
    const [touched, setTouched] = useState(false);
    const tx = usePackTx();
    const navigate = useNavigate();
    const errors = validateCreate(form);
    const valid = Object.keys(errors).length === 0;

    const update = <K extends keyof CreateForm>(key: K, value: CreateForm[K]) =>
        setForm((f) => {
            const next = { ...f, [key]: value };
            if (key === 'maxMembers' && next.threshold > next.maxMembers) next.threshold = next.maxMembers;
            return next;
        });

    const submit = async () => {
        setTouched(true);
        if (!valid) return;
        const receipt = await tx.run(
            {
                address: PACK_FACTORY_ADDRESS,
                abi: PACK_FACTORY_ABI,
                functionName: 'createPack',
                args: [form.name.trim(), form.emoji, form.story.trim(), parseDoge(form.goal), BigInt(deadlineUnix(form.deadline)), form.threshold, form.maxMembers],
            },
            'The pack is live.',
        );
        if (!receipt) return;
        const [created] = parseEventLogs({ abi: PACK_FACTORY_ABI, logs: receipt.logs, eventName: 'PackCreated' }) as unknown as { args: { pack: Address } }[];
        if (created?.args.pack) navigate(`/pack/${created.args.pack}?new=1`);
    };

    return { form, update, errors: touched ? errors : {}, valid, submit, tx };
}
