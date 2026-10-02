"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { setActiveRange } from "@/app/actions/range";
import type { ActiveRangeValue } from "@/lib/active-range";
import type { RangeKey } from "@/lib/date-range";

const PRESETS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Hari ini" },
  { key: "week", label: "Pekan ini" },
  { key: "month", label: "Bulan ini" },
  { key: "30d", label: "30 hari" },
  { key: "90d", label: "90 hari" },
];

function toIso(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function DateRangeControl({
  currentValue,
  currentLabel,
}: {
  currentValue: ActiveRangeValue;
  currentLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"preset" | "custom">(
    currentValue.mode === "custom" ? "custom" : "preset"
  );
  const [dateMode, setDateMode] = useState<"single" | "range">("range");
  const [singleDate, setSingleDate] = useState<Date | undefined>(
    currentValue.mode === "custom" && currentValue.start === currentValue.end
      ? new Date(currentValue.start)
      : undefined
  );
  const [range, setRange] = useState<DateRange | undefined>(
    currentValue.mode === "custom" && currentValue.start !== currentValue.end
      ? { from: new Date(currentValue.start), to: new Date(currentValue.end) }
      : undefined
  );
  const [isPending, startTransition] = useTransition();

  function apply(value: ActiveRangeValue) {
    startTransition(async () => {
      await setActiveRange(value, pathname);
      router.refresh();
      setOpen(false);
    });
  }

  function applyCustom() {
    if (dateMode === "single" && singleDate) {
      const iso = toIso(singleDate);
      apply({ mode: "custom", start: iso, end: iso });
    } else if (dateMode === "range" && range?.from && range?.to) {
      apply({ mode: "custom", start: toIso(range.from), end: toIso(range.to) });
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CalendarIcon className="size-3.5" />
          )}
          {currentLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex border-b">
          <button
            onClick={() => setTab("preset")}
            className={cn(
              "flex-1 px-4 py-2 text-xs font-medium transition-colors",
              tab === "preset"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground"
            )}
          >
            Preset
          </button>
          <button
            onClick={() => setTab("custom")}
            className={cn(
              "flex-1 px-4 py-2 text-xs font-medium transition-colors",
              tab === "custom"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground"
            )}
          >
            Tanggal custom
          </button>
        </div>

        {tab === "preset" && (
          <div className="flex flex-col gap-1 p-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => apply({ mode: "preset", key: p.key })}
                className={cn(
                  "rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                  currentValue.mode === "preset" && currentValue.key === p.key
                    ? "bg-muted font-medium"
                    : ""
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {tab === "custom" && (
          <div className="p-3">
            <div className="mb-2 flex gap-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => setDateMode("single")}
                className={cn(
                  "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  dateMode === "single"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                Satu tanggal
              </button>
              <button
                onClick={() => setDateMode("range")}
                className={cn(
                  "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  dateMode === "range"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                Rentang
              </button>
            </div>

            {dateMode === "single" ? (
              <Calendar
                mode="single"
                selected={singleDate}
                onSelect={setSingleDate}
                autoFocus
              />
            ) : (
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={1}
                autoFocus
              />
            )}

            <Button
              size="sm"
              className="mt-2 w-full"
              disabled={
                isPending ||
                (dateMode === "single" ? !singleDate : !range?.from || !range?.to)
              }
              onClick={applyCustom}
            >
              Terapkan
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
