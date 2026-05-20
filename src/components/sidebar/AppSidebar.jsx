import { NavLink } from 'react-router-dom'
import { BookOpen, Target, Layers, FileText, Settings, LogOut, ChevronsUpDown, Server } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentQuarter } from '@/lib/quarter'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { label: 'Daily Log',        to: '/',        icon: BookOpen },
  { label: 'Goals',            to: '/goals',   icon: Target   },
  { label: 'Portals',          to: '/portals',    icon: Layers   },
  { label: 'Instances',        to: '/instances',  icon: Server   },
  { label: 'Quarterly Report', to: '/report',     icon: FileText },
  { label: 'Settings',         to: '/settings',icon: Settings },
]

export function AppSidebar() {
  const { user, signOut } = useAuth()

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'
  const email = user?.email || ''
  const quarter = getCurrentQuarter()
  const initials = fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Sidebar collapsible="icon" style={{ '--sidebar-background': 'white' }}>
      {/* Header — app identity */}
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="cursor-default">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
                  R
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">rono</span>
                  <span className="text-xs text-muted-foreground">{quarter}</span>
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
              {navItems.map(({ label, to, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      className={({ isActive }) =>
                        cn(isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium')
                      }
                    >
                      <Icon />
                      <span>{label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator />

      {/* Footer — user account */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip="Account">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-sm font-medium truncate">{fullName}</span>
                    <span className="text-xs text-muted-foreground truncate">{email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{fullName}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive focus:text-destructive gap-2"
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
  )
}
