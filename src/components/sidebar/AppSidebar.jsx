import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Server, ChevronsUpDown, LogOut, UserPlus, Check, X, Layers, Settings } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { useProfile, useAllProfiles } from '@/hooks/useProfile'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { AddAccountDialog } from '@/components/auth/AddAccountDialog'

const navItems = [
  { label: 'Instances', to: '/instances', icon: Server  },
  { label: 'Portals',   to: '/portals',   icon: Layers  },
  { label: 'Settings',  to: '/settings',  icon: Settings },
]

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export function AppSidebar() {
  const { user, accounts, activeAccountId, switchAccount, removeAccount, signOut } = useAuthContext()
  const { profile } = useProfile()
  const allProfiles = useAllProfiles()
  const { pathname } = useLocation()
  const [addOpen, setAddOpen] = useState(false)

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User'
  const email    = user?.email ?? ''
  const avatarUrl = profile?.avatar_url ?? null

  return (
    <>
      <Sidebar collapsible="icon">
        {/* Header */}
        <SidebarHeader className="h-14 justify-center">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="cursor-default">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    TH
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">THMP</span>
                    <span className="text-xs text-muted-foreground">Team Hub</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <Separator />

        {/* Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ label, to, icon: Icon }) => {
                  const isActive = pathname === to || pathname.startsWith(to + '/')
                  return (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild tooltip={label} isActive={isActive}>
                        <NavLink to={to}>
                          <Icon />
                          <span>{label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <Separator />

        {/* Footer — account switcher */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" tooltip="Account">
                    <Avatar className="size-8 rounded-lg shrink-0">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                      <AvatarFallback className="rounded-lg text-xs bg-primary text-primary-foreground">
                        {getInitials(fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="text-sm font-medium truncate">{fullName}</span>
                      <span className="text-xs text-muted-foreground truncate">{email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="top" align="start" className="w-64">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-3 py-2">
                    Signed-in accounts
                  </DropdownMenuLabel>

                  {accounts.map(account => (
                    <DropdownMenuItem
                      key={account.id}
                      className="flex items-center gap-2 cursor-pointer pr-2"
                      onSelect={() => switchAccount(account.id)}
                    >
                      <Avatar className="size-7 rounded-md shrink-0">
                        {allProfiles[account.id]?.avatar_url && (
                          <AvatarImage src={allProfiles[account.id].avatar_url} alt={account.name} className="object-cover" />
                        )}
                        <AvatarFallback className="rounded-md text-xs">
                          {getInitials(account.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col leading-tight min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">{account.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{account.email}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {account.id === activeAccountId && (
                          <Check className="size-3.5 text-primary" />
                        )}
                        {accounts.length > 1 && (
                          <button
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            onClick={e => { e.stopPropagation(); removeAccount(account.id) }}
                            title="Remove account"
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="gap-2 cursor-pointer" onSelect={() => setAddOpen(true)}>
                    <UserPlus className="size-4" />
                    Add account
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={signOut}
                    className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  )
}
