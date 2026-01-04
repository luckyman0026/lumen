"use client";

import { Separator, Skeleton } from "@/components/ui";
import { useOverview } from "@/hooks/use-api";
import { formatCompactNumber } from "@/lib/format-utils";
import React from "react";
import { StatCard } from "./stat-card";

function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function OverviewStats() {
  const { data, isLoading, error } = useOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid grid-cols-3 gap-8">
        <StatCard label="Total Requests" value="--" />
        <StatCard label="AI Requests" value="--" />
        <StatCard label="Human Requests" value="--" />
      </div>
    );
  }

  const humanRequests = data.total_requests - data.ai_requests;
  const aiPercentage = (data.ai_share * 100).toFixed(0);
  const humanPercentage = ((1 - data.ai_share) * 100).toFixed(0);
  const revenue = data.estimated_revenue;

  const formatRevenue = (value: number) =>
    value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-8">
        <StatCard
          label="Total Requests"
          value={formatCompactNumber(data.total_requests)}
          active
        />
        <StatCard
          label="AI Requests"
          value={formatCompactNumber(data.ai_requests)}
          dateRange={`${aiPercentage}% of traffic`}
        />
        <StatCard
          label="Human Requests"
          value={formatCompactNumber(humanRequests)}
          dateRange={`${humanPercentage}% of traffic`}
        />
      </div>

      {revenue && (
        <React.Fragment>
          <Separator />
          <div className="grid grid-cols-3 gap-8">
            <StatCard
              label="Est. Revenue (Low)"
              value={formatRevenue(revenue.low)}
            />
            <StatCard
              label="Est. Revenue (Mid)"
              value={formatRevenue(revenue.mid)}
            />
            <StatCard
              label="Est. Revenue (High)"
              value={formatRevenue(revenue.high)}
            />
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
