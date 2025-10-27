'use client';

import { checkinBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/action-state';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-1 text-xs font-semibold text-swin-charcoal transition hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory disabled:cursor-not-allowed disabled:border-swin-charcoal/10 disabled:text-swin-charcoal/40"
    >
      {pending ? 'Returning…' : 'Return'}
    </button>
  );
}

export default function QuickCheckInButton({ loanId }: { loanId: string }) {
  const action = checkinBookAction.bind(null, initialActionState) as unknown as (
    formData: FormData,
  ) => Promise<void>;

  return (
    <form action={action} className="flex justify-end">
      <input type="hidden" name="loanId" value={loanId} />
      <SubmitButton />
    </form>
  );
}
