"use client";

import { LiveIndicator } from "@/components/live-indicator";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui";
import { queryKeys, useAvailableRoutes, useOpportunityEstimate, useTopRoutes } from "@/hooks/use-api";
import { type TimeRange, useFilters } from "@/lib/filter-context";
import { useRoutePrices } from "@/lib/route-prices-context";
import { cn } from "@/lib/utils";
import { ArrowUpDownIcon, Cancel01Icon, Dollar01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export function FilterBar() {
  const { route, timeRange, setRoute, setTimeRange, clearFilters } = useFilters();
  const { data: routes, isLoading: routesLoading } = useAvailableRoutes();
  const { data: topRoutesData } = useTopRoutes(10000);
  const { prices, setBulkPrices } = useRoutePrices();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [bulkPriceInput, setBulkPriceInput] = useState<string | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Routes for bulk pricing (same as top-routes page)
  const topRoutes = useMemo(
    () => topRoutesData?.map((r) => r.route) ?? [],
    [topRoutesData]
  );

  // Call estimate endpoint to save prices and trigger overview refresh
  const { isSuccess: estimateSuccess } = useOpportunityEstimate(prices);

  // Refetch overview when estimate completes (prices were saved)
  useEffect(() => {
    if (estimateSuccess) {
      queryClient.invalidateQueries({ queryKey: queryKeys.overview(timeRange, route) });
    }
  }, [estimateSuccess, queryClient, timeRange, route]);

  const hasActiveFilters = route !== null || timeRange !== "today";
  const routeCount = topRoutes.length;

  const { uniformPrice, pricedCount } = useMemo(() => {
    if (topRoutes.length === 0) return { uniformPrice: null, pricedCount: 0 };
    const pricesSet = topRoutes
      .map((r) => prices[r])
      .filter((p): p is number => p !== undefined);
    if (pricesSet.length === 0) return { uniformPrice: null, pricedCount: 0 };
    const firstPrice = pricesSet[0];
    const isUniform = pricesSet.every((p) => p === firstPrice);
    return {
      uniformPrice: isUniform ? firstPrice : null,
      pricedCount: pricesSet.length,
    };
  }, [topRoutes, prices]);

  const displayedPrice =
    bulkPriceInput !== null
      ? bulkPriceInput
      : uniformPrice?.toFixed(2) ?? "";

  const handleBulkSave = () => {
    const value = Number.parseFloat(displayedPrice);
    if (!Number.isNaN(value) && value > 0 && topRoutes.length > 0) {
      setBulkPrices(topRoutes, value);
      setIsBulkOpen(false);
      setBulkPriceInput(null);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-medium">Overview</h1>
          <LiveIndicator />
        </div>
        <span className="text-sm text-muted-foreground">
          AI Traffic Overview
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Popover
          open={isBulkOpen}
          onOpenChange={(isOpen) => {
            setIsBulkOpen(isOpen);
            if (!isOpen) setBulkPriceInput(null);
          }}
        >
          <PopoverTrigger asChild>
            {uniformPrice !== null ? (
              <Button variant="outline" className="h-10 gap-1.5">
                <HugeiconsIcon icon={Dollar01Icon} className="size-4" />
                <span className="text-green-600 dark:text-green-500 font-medium">
                  ${uniformPrice.toFixed(2)}/1k
                </span>
                <span className="text-xs text-muted-foreground">
                  ({pricedCount} routes)
                </span>
              </Button>
            ) : pricedCount > 0 ? (
              <Button variant="outline" className="h-10 gap-1.5">
                <HugeiconsIcon icon={Dollar01Icon} className="size-4" />
                <span>Mixed prices</span>
                <span className="text-xs text-muted-foreground">
                  ({pricedCount} routes)
                </span>
              </Button>
            ) : (
              <Button variant="outline" className="h-10 gap-1.5">
                <HugeiconsIcon icon={Dollar01Icon} className="size-4" />
                <span>Set price</span>
                <span className="text-xs text-muted-foreground">
                  ({routeCount} routes)
                </span>
              </Button>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium">Set price for all routes</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Applies to {routeCount} route{routeCount !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={displayedPrice}
                    onChange={(e) => setBulkPriceInput(e.target.value)}
                    className="pl-5 h-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleBulkSave();
                    }}
                  />
                </div>
                <Button size="sm" className="h-8" onClick={handleBulkSave}>
                  Apply
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Price per 1,000 requests
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              aria-expanded={open}
              className="w-[200px] justify-between text-sm font-normal"
            >
              {route || "All routes"}
              <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search routes..." />
              <CommandList>
                <CommandEmpty>No route found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      setRoute(null);
                      setOpen(false);
                    }}
                  >
                    <HugeiconsIcon
                      icon={Tick01Icon}
                      className={cn("size-4", {
                        "opacity-100": route === null,
                        "opacity-0": route !== null,
                      })}
                    />
                    All routes
                  </CommandItem>
                  {routesLoading ? (
                    <CommandItem disabled>Loading...</CommandItem>
                  ) : (
                    routes?.map((r) => (
                      <CommandItem
                        key={r}
                        value={r}
                        onSelect={() => {
                          setRoute(r);
                          setOpen(false);
                        }}
                      >
                        <HugeiconsIcon
                          icon={Tick01Icon}
                          className={cn("size-4", {
                            "opacity-100": route === r,
                            "opacity-0": route !== r,
                          })}
                        />
                        {r}
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => {
              if (value) setTimeRange(value as TimeRange);
            }}
          >
            <ToggleGroupItem
              value="last_hour"
              aria-label="Last Hour"
              className="text-xs px-3"
            >
              Last Hour
            </ToggleGroupItem>
            <ToggleGroupItem
              value="today"
              aria-label="Today"
              className="text-xs px-3"
            >
              Today
            </ToggleGroupItem>
          </ToggleGroup>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="px-2 text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
