import "server-only";
import { cookies } from "next/headers";
import { getRange, type RangeKey } from "./date-range";
import { formatDateId } from "./format";

export const RANGE_COOKIE = "biz_portal_range";

export type ActiveRangeValue =
  | { mode: "preset"; key: RangeKey }
  | { mode: "custom"; start: string; end: string };

const DEFAULT_RANGE: ActiveRangeValue = { mode: "preset", key: "month" };

export const PRESET_LABELS: Record<RangeKey, string> = {
  today: "Hari ini",
  week: "Pekan ini",
  month: "Bulan ini",
  "30d": "30 hari",
  "90d": "90 hari",
};

function parseActiveRange(raw: string | undefined): ActiveRangeValue {
  if (!raw) return DEFAULT_RANGE;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.mode === "preset" && typeof parsed.key === "string") {
      return { mode: "preset", key: parsed.key };
    }
    if (
      parsed?.mode === "custom" &&
      typeof parsed.start === "string" &&
      typeof parsed.end === "string"
    ) {
      return { mode: "custom", start: parsed.start, end: parsed.end };
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_RANGE;
}

export async function getActiveRangeValue(): Promise<ActiveRangeValue> {
  const store = await cookies();
  return parseActiveRange(store.get(RANGE_COOKIE)?.value);
}

export async function getActiveRange(): Promise<{ start: string; end: string }> {
  const value = await getActiveRangeValue();
  if (value.mode === "custom") return { start: value.start, end: value.end };
  return getRange(value.key, new Date());
}

export function formatActiveRangeLabel(value: ActiveRangeValue): string {
  if (value.mode === "preset") return PRESET_LABELS[value.key] ?? value.key;
  if (value.start === value.end) return formatDateId(value.start);
  return `${formatDateId(value.start)} – ${formatDateId(value.end)}`;
}
