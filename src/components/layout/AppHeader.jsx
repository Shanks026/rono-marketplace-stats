import { useLocation } from 'react-router-dom'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ModeToggle } from '@/components/misc/mode-toggle'
import { Separator } from '@/components/ui/separator'

const PAGE_TITLES = {
  '/':         'Daily Log',
  '/goals':    'Goals',
  '/portals':  'Portals',
  '/report':   'Quarterly Report',
  '/settings': 'Settings',
}

export function AppHeader() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'rono'

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <h1 className="text-sm font-medium">{title}</h1>
      <div className="ml-auto">
        <ModeToggle />
      </div>
    </header>
  )
}
