import {
  Home,
  Inbox,
  Calendar,
  Search,
  Settings,
  LogOut,
  ChevronsUpDown,
  User,
  Mail,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSidebar } from "@/components/ui/sidebar";

import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Separator } from "../ui/separator";

const navItems = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

export function AppSidebar({ user }) {
  const { state } = useSidebar();

  async function handleLogout() {
    await supabase.auth.signOut();
    // App.jsx listener handles redirect
  }

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const email = user?.email || "";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold shrink-0">
                CD
              </div>

              <div className="flex flex-col text-left min-w-0">
                <span className="text-sm font-bold truncate">Cadence</span>
                <span className="text-xs text-muted-foreground truncate">
                  Development
                </span>
              </div>

              <ExpandedOnly>
                <SidebarTrigger />
              </ExpandedOnly>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <CollapsedOnly>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Expand sidebar"
                className="justify-center"
              >
                <div className="mt-2">
                  <SidebarTrigger />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </CollapsedOnly>
        </SidebarMenu>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          {state === "expanded" && (
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      

      {/* Footer / User Menu */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip="Account">
                  <Avatar className="size-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm font-medium truncate">
                      {fullName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {email}
                    </span>
                  </div>

                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="start" className="w-56">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="size-9">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium">{fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Mail className="mr-2 size-4" />
                  Inbox
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Account
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ExpandedOnly({ children }) {
  const { state } = useSidebar();
  return state === "expanded" ? (
    <div className="ml-auto shrink-0">{children}</div>
  ) : null;
}

function CollapsedOnly({ children }) {
  const { state } = useSidebar();
  return state === "collapsed" ? children : null;
}
