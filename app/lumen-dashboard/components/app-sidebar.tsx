"use client";

import { NavOrg } from "@/components/nav-org";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui";
import {
  ChartColumnIcon,
  ChatBotIcon,
  DashboardCircleAddIcon,
  MenuTwoLineIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Overview",
    url: "/",
    icon: DashboardCircleAddIcon,
  },
  {
    title: "Time Series",
    url: "/time-series",
    icon: ChartColumnIcon,
  },
  {
    title: "Top Routes",
    url: "/top-routes",
    icon: MenuTwoLineIcon,
  },
  {
    title: "Top Bots",
    url: "/top-bots",
    icon: ChatBotIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-sidebar-border h-16 flex border-b w-full justify-center">
        <NavOrg />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
