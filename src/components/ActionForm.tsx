"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";

/**
 * Wraps a server action form so that, once the action completes, the
 * current page's Server Component data is forced to refetch via
 * router.refresh() — the documented Next.js API for this. Plain
 * `<form action={serverAction}>` plus revalidatePath() inside the action
 * was not reliably refreshing the current page in every browser (observed
 * on mobile): revalidatePath only guarantees the NEXT visit to a path is
 * fresh, not that an already-mounted page re-fetches its data. This
 * sidesteps that gap entirely instead of relying on cache-invalidation
 * heuristics.
 */
export default function ActionForm({
  action,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isFirstRender = useRef(true);

  const [completedAt, formAction] = useFormState(async (_prevState: number, formData: FormData) => {
    await action(formData);
    return Date.now();
  }, 0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    router.refresh();
  }, [completedAt, router]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
