import { isToday, isYesterday } from "date-fns";
import { formatPickerDay } from "@/components/common/date-picker/quick-date-labels";

export function getDayLabelKey(day: Date): string | null {
  if (isToday(day)) return "workspace:completedTasks.today";
  if (isYesterday(day)) return "workspace:completedTasks.yesterday";
  return null;
}

export function formatDay(day: Date, t: (key: string) => string): string {
  const key = getDayLabelKey(day);
  return key ? t(key) : formatPickerDay(day);
}
