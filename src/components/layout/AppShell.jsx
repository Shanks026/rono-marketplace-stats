import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="min-h-screen">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
