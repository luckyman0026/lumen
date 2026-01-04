"use client";

import { cn } from "@/lib/utils";
import { useIsFetching } from "@tanstack/react-query";

export function LiveIndicator() {
  const isFetching = useIsFetching();

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className={cn("relative flex h-2 w-2", {
          "animate-pulse": isFetching > 0,
        })}
      >
        <span
          className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", {
            "animate-ping bg-amber-400": isFetching > 0,
            "bg-emerald-400": isFetching === 0,
          })}
        />
        <span
          className={cn("relative inline-flex rounded-full h-2 w-2", {
            "bg-amber-500": isFetching > 0,
            "bg-emerald-500": isFetching === 0,
          })}
        />
      </span>
      <span>Live</span>
    </div>
  );
}
