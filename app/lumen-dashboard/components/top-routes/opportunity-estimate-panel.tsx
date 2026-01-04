"use client";

import { Badge, Button, Input, Separator } from "@/components/ui";
import { useOpportunityEstimate } from "@/hooks/use-api";
import { useRoutePrices } from "@/lib/route-prices-context";
import { cn } from "@/lib/utils";
import {
  ArrowRight01Icon,
  Cancel01Icon,
  Delete02Icon,
  Dollar01Icon,
  Loading01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode, useMemo, useState } from "react";
import { EstimateCard } from "./estimate-card";

interface OpportunityEstimateLayoutProps {
  children: ReactNode;
}

export function OpportunityEstimateLayout({
  children,
}: OpportunityEstimateLayoutProps) {
  const {
    prices,
    removePrice,
    clearPrices,
    hasAnyPrices,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useRoutePrices();

  const { data: estimate, isLoading, error } = useOpportunityEstimate(prices);
  const [routeFilter, setRouteFilter] = useState("");

  const filteredBreakdown = useMemo(() => {
    const breakdown = estimate?.route_breakdown ?? [];
    if (!routeFilter.trim()) return breakdown;
    const query = routeFilter.toLowerCase();
    return breakdown.filter((item) => item.route.toLowerCase().includes(query));
  }, [estimate?.route_breakdown, routeFilter]);

  const routeCount = Object.keys(prices).length;
  const showSidebar = hasAnyPrices || estimate;

  const handleClear = () => {
    clearPrices();
  };

  return (
    <div className="flex min-h-full">
      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out bg-background",
          {
            "mr-[500px]": isSidebarOpen && showSidebar,
            "mr-0": !(isSidebarOpen && showSidebar),
          }
        )}
      >
        {children}
      </div>

      {showSidebar && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "fixed top-1/2 -translate-y-1/2 z-40 flex items-center gap-1 py-3 px-2 rounded-l-lg shadow-lg transition-all duration-300 rounded-r-none border-r-0",
              {
                "right-[500px]": isSidebarOpen,
                "right-0": !isSidebarOpen,
              }
            )}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className={cn("size-4 transition-transform", {
                "rotate-0": isSidebarOpen,
                "rotate-180": !isSidebarOpen,
              })}
            />
            {!isSidebarOpen && (
              <span className="text-sm font-medium flex items-center gap-1">
                <HugeiconsIcon icon={Dollar01Icon} className="size-4" />
                {routeCount}
              </span>
            )}
          </Button>

          <div
            className={cn(
              "fixed top-0 right-0 h-full w-[500px] bg-background border-l shadow-lg transition-transform duration-300 ease-in-out z-30 flex flex-col",
              {
                "translate-x-0": isSidebarOpen,
                "translate-x-full": !isSidebarOpen,
              }
            )}
          >
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <div>
                <h2 className="font-medium">Revenue Estimate</h2>
                <p className="text-sm text-muted-foreground">
                  {routeCount > 0
                    ? `${routeCount} route${
                        routeCount > 1 ? "s" : ""
                      } with pricing`
                    : "Set prices on routes to estimate revenue"}
                </p>
              </div>
              {hasAnyPrices && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={handleClear}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                  <HugeiconsIcon
                    icon={Loading01Icon}
                    className="size-4 animate-spin"
                  />
                  Calculating estimate...
                </div>
              )}

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
                  {error.message}
                </div>
              )}

              {estimate && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-3 gap-3">
                    <EstimateCard
                      label="Low"
                      value={estimate.estimated_revenue.low}
                      variant="muted"
                    />
                    <EstimateCard
                      label="Mid"
                      value={estimate.estimated_revenue.mid}
                      variant="muted"
                    />
                    <EstimateCard
                      label="High"
                      value={estimate.estimated_revenue.high}
                      variant="muted"
                    />
                  </div>

                  {estimate.route_breakdown?.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-end justify-between text-sm font-medium">
                        <div className="flex flex-col gap-2">
                          <span>Route Breakdown</span>
                          <Badge variant="outline" className="font-mono">
                            Requests {estimate.ai_requests.toLocaleString()} /
                            Chargeable{" "}
                            {estimate.chargeable_requests.toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-normal pr-3">
                          <span className="w-14 text-right">Price</span>
                          <span className="w-16 text-right">Revenue</span>
                        </div>
                      </div>

                      <div className="relative">
                        <HugeiconsIcon
                          icon={Search01Icon}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                        />
                        <Input
                          placeholder="Filter routes..."
                          value={routeFilter}
                          onChange={(e) => setRouteFilter(e.target.value)}
                          className="pl-8 h-8 text-sm"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-1">
                        {filteredBreakdown.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            No matching routes
                          </div>
                        ) : (
                          filteredBreakdown.map((item) => (
                            <div
                              key={item.route}
                              className="flex items-center gap-10 justify-between relative text-sm py-2 px-3 bg-white border border-border rounded group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="font-mono text-xs truncate">
                                  {item.route}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {item.ai_requests.toLocaleString()} requests
                                </div>
                              </div>
                              <div className="flex items-center gap-4 shrink-0">
                                <span className="text-xs text-muted-foreground w-14 text-right tabular-nums">
                                  ${prices[item.route]?.toFixed(2) ?? "—"}/1k
                                </span>
                                <span className="text-green-600 dark:text-green-500 font-medium text-sm w-16 text-right tabular-nums">
                                  ${item.revenue.toFixed(2)}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePrice(item.route)}
                                  className="text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                >
                                  <HugeiconsIcon
                                    icon={Cancel01Icon}
                                    className="h-3.5 w-3.5"
                                  />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function OpportunityEstimatePanel() {
  return null;
}
