"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Card
          role="button"
          tabIndex={0}
          className="cursor-pointer text-left transition-colors active:bg-muted/50"
        >
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p
                className={cn(
                  "truncate text-xl font-semibold tracking-tight",
                  tone === "positive" && "text-emerald-600 dark:text-emerald-400",
                  tone === "negative" && "text-red-600 dark:text-red-400"
                )}
              >
                {value}
              </p>
              {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
            </div>
            {icon && <div className="rounded-lg bg-muted p-2">{icon}</div>}
          </CardContent>
        </Card>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[80vw]">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "text-2xl font-semibold tracking-tight",
            tone === "positive" && "text-emerald-600 dark:text-emerald-400",
            tone === "negative" && "text-red-600 dark:text-red-400"
          )}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </PopoverContent>
    </Popover>
  );
}
