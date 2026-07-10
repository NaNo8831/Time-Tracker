"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as settingsData from "@/lib/data/settings";
import type { LeaveType } from "@/lib/types";

const POSTGRES_UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION
  );
}

function redirectWithError(message: string): never {
  redirect(`/settings?error=${encodeURIComponent(message)}`);
}

export async function addWeeklyTarget(formData: FormData) {
  const hours = Number(formData.get("hours"));
  const effectiveDate = String(formData.get("effectiveDate"));
  try {
    await settingsData.addWeeklyTargetSetting(hours, effectiveDate);
  } catch (error) {
    if (isUniqueViolation(error)) {
      redirectWithError(`A weekly target entry already exists for ${effectiveDate}.`);
    }
    throw error;
  }
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/history");
}

export async function addBreakDuration(formData: FormData) {
  const minutes = Number(formData.get("minutes"));
  const effectiveDate = String(formData.get("effectiveDate"));
  try {
    await settingsData.addBreakDurationSetting(minutes, effectiveDate);
  } catch (error) {
    if (isUniqueViolation(error)) {
      redirectWithError(`A break duration entry already exists for ${effectiveDate}.`);
    }
    throw error;
  }
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/history");
}

export async function addStandardWorkdayHours(formData: FormData) {
  const hours = Number(formData.get("hours"));
  const effectiveDate = String(formData.get("effectiveDate"));
  try {
    await settingsData.addStandardWorkdayHoursSetting(hours, effectiveDate);
  } catch (error) {
    if (isUniqueViolation(error)) {
      redirectWithError(`A standard workday hours entry already exists for ${effectiveDate}.`);
    }
    throw error;
  }
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/history");
}

export async function addLeaveBank(formData: FormData) {
  const leaveType = String(formData.get("leaveType")) as LeaveType;
  const totalHours = Number(formData.get("totalHours"));
  const effectiveDate = String(formData.get("effectiveDate"));
  const note = formData.get("note") ? String(formData.get("note")) : null;
  try {
    await settingsData.addLeaveBankEntry(leaveType, totalHours, effectiveDate, note);
  } catch (error) {
    if (isUniqueViolation(error)) {
      redirectWithError(`A ${leaveType} leave bank entry already exists for ${effectiveDate}.`);
    }
    throw error;
  }
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/history");
}

export async function addHoliday(formData: FormData) {
  const date = String(formData.get("date"));
  const label = String(formData.get("label"));
  try {
    await settingsData.addHoliday(date, label);
  } catch (error) {
    if (isUniqueViolation(error)) {
      redirectWithError(`${date} is already in the holiday list.`);
    }
    throw error;
  }
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/history");
}

export async function deleteHoliday(formData: FormData) {
  const id = String(formData.get("id"));
  await settingsData.removeHoliday(id);
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/history");
}

export async function addPhysicalYear(formData: FormData) {
  const startDate = String(formData.get("startDate"));
  const endDate = String(formData.get("endDate"));
  const note = formData.get("note") ? String(formData.get("note")) : null;
  await settingsData.addPhysicalYear(startDate, endDate, note);
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function deletePhysicalYear(formData: FormData) {
  const id = String(formData.get("id"));
  await settingsData.removePhysicalYear(id);
  revalidatePath("/settings");
  revalidatePath("/");
}
