import { redirect } from "next/navigation";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function EntriesIndexPage() {
  redirect(`/entries/${todayIso()}`);
}
