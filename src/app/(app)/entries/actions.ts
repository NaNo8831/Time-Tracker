"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as entriesData from "@/lib/data/entries";
import { findOverlappingSession } from "@/lib/calculations/sessionOverlap";
import type { LeaveType } from "@/lib/types";

export async function goToDate(formData: FormData) {
  const date = String(formData.get("date"));
  redirect(`/entries/${date}`);
}

export async function setBreak(formData: FormData) {
  const date = String(formData.get("date"));
  const raw = formData.get("breakMinutesOverride");
  const minutes = raw === null || raw === "" ? null : Number(raw);
  await entriesData.setBreakOverride(date, minutes);
  revalidatePath(`/entries/${date}`);
  revalidatePath("/");
  revalidatePath("/history");
  redirect(`/entries/${date}`);
}

export async function addSession(formData: FormData) {
  const date = String(formData.get("date"));
  const checkInTime = String(formData.get("checkInTime"));
  const checkOutTime = String(formData.get("checkOutTime"));

  if (checkOutTime <= checkInTime) {
    redirect(
      `/entries/${date}?error=${encodeURIComponent("Check-out must be after check-in.")}`
    );
  }

  const checkIn = `${date}T${checkInTime}:00`;
  const checkOut = `${date}T${checkOutTime}:00`;

  const existing = await entriesData.getDayEntryDetail(date);
  const conflict = findOverlappingSession({ checkIn, checkOut }, existing.sessions);

  if (conflict) {
    redirect(
      `/entries/${date}?error=${encodeURIComponent(
        `That overlaps an existing session (${conflict.checkIn.slice(11, 16)}–${conflict.checkOut.slice(11, 16)}).`
      )}`
    );
  }

  await entriesData.addSession(date, checkIn, checkOut);
  revalidatePath(`/entries/${date}`);
  revalidatePath("/");
  revalidatePath("/history");
  redirect(`/entries/${date}`);
}

export async function removeSession(formData: FormData) {
  const id = String(formData.get("id"));
  const date = String(formData.get("date"));
  await entriesData.removeSession(id);
  revalidatePath(`/entries/${date}`);
  revalidatePath("/");
  revalidatePath("/history");
  redirect(`/entries/${date}`);
}

export async function addLeaveEntry(formData: FormData) {
  const date = String(formData.get("date"));
  const leaveType = String(formData.get("leaveType")) as LeaveType;
  const hours = Number(formData.get("hours"));
  await entriesData.addLeaveEntry(date, leaveType, hours);
  revalidatePath(`/entries/${date}`);
  revalidatePath("/");
  revalidatePath("/history");
  redirect(`/entries/${date}`);
}

export async function removeLeaveEntry(formData: FormData) {
  const id = String(formData.get("id"));
  const date = String(formData.get("date"));
  await entriesData.removeLeaveEntry(id);
  revalidatePath(`/entries/${date}`);
  revalidatePath("/");
  revalidatePath("/history");
  redirect(`/entries/${date}`);
}
