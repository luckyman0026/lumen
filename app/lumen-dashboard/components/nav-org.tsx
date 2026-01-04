"use client";

import { Building03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui";

export function NavOrg() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full justify-start flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-foreground">
                Lumen
              </span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Building03Icon} />
                Lumen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <HugeiconsIcon icon={Building03Icon} />
                Microsoft Inc
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <HugeiconsIcon icon={Building03Icon} />
                Alphabet Inc
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
