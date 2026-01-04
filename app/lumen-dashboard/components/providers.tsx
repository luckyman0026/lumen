"use client";

import { FilterProvider } from "@/lib/filter-context";
import { RoutePricesProvider } from "@/lib/route-prices-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            refetchInterval: 60 * 1000, // 1 minute
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <RoutePricesProvider>{children}</RoutePricesProvider>
      </FilterProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
