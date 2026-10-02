import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  subDays,
  format,
} from "date-fns";

export type RangeKey = "today" | "week" | "month" | "30d" | "90d";

export function getRange(key: RangeKey, now: Date) {
  const end = endOfDay(now);
  let start: Date;

  switch (key) {
    case "today":
      start = startOfDay(now);
      break;
    case "week":
      start = startOfWeek(now, { weekStartsOn: 1 });
      break;
    case "month":
      start = startOfMonth(now);
      break;
    case "30d":
      start = startOfDay(subDays(now, 29));
      break;
    case "90d":
      start = startOfDay(subDays(now, 89));
      break;
  }

  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
}
