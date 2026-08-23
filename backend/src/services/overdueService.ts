import { prisma } from "../config/prisma.js";
import { ENV } from "../config/env.js";

const OVERDUE_SETTING_KEY = "OVERDUE_THRESHOLD_DAYS";

export async function getOverdueThresholdDays(): Promise<number> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: OVERDUE_SETTING_KEY },
    });
    if (setting && setting.value) {
      const parsed = parseInt(setting.value, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading overdue setting:", err);
  }
  return ENV.DEFAULT_OVERDUE_DAYS;
}

export async function setOverdueThresholdDays(days: number): Promise<number> {
  await prisma.setting.upsert({
    where: { key: OVERDUE_SETTING_KEY },
    update: { value: days.toString() },
    create: {
      key: OVERDUE_SETTING_KEY,
      value: days.toString(),
      description: "Number of days before an unresolved complaint is marked overdue",
    },
  });
  return days;
}

export function computeOverdue(
  complaint: { status: string; createdAt: Date },
  thresholdDays: number
): { isOverdue: boolean; daysOpen: number } {
  const now = new Date();
  const created = new Date(complaint.createdAt);
  const diffMs = now.getTime() - created.getTime();
  const daysOpen = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isOverdue =
    complaint.status !== "RESOLVED" && daysOpen >= thresholdDays;

  return { isOverdue, daysOpen };
}

export function enrichComplaintWithOverdue<T extends { status: string; createdAt: Date }>(
  complaint: T,
  thresholdDays: number
): T & { isOverdue: boolean; daysOpen: number; thresholdDays: number } {
  const { isOverdue, daysOpen } = computeOverdue(complaint, thresholdDays);
  return {
    ...complaint,
    isOverdue,
    daysOpen,
    thresholdDays,
  };
}
