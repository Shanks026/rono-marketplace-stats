import { ShieldCheck, Store, Package, UserPlus, UserCheck, Globe, ShoppingBasket } from 'lucide-react'

export const PORTAL_NAMES = [
  'Admin Portal',
  'Store Management Portal',
  'Vendor Portal',
  'Onboarding Portal',
  'Signup Portal',
  'Storefront',
  'Buyer/Procurement',
]

const STYLES = {
  'Admin Portal':            { icon: ShieldCheck,    bg: 'bg-pink-100 dark:bg-pink-950',     text: 'text-pink-700 dark:text-pink-300'     },
  'Store Management Portal': { icon: Store,          bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300' },
  'Vendor Portal':           { icon: Package,        bg: 'bg-blue-100 dark:bg-blue-950',     text: 'text-blue-700 dark:text-blue-300'     },
  'Onboarding Portal':       { icon: UserPlus,       bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300' },
  'Signup Portal':           { icon: UserCheck,      bg: 'bg-rose-100 dark:bg-rose-950',     text: 'text-rose-700 dark:text-rose-300'     },
  'Storefront':              { icon: Globe,          bg: 'bg-amber-100 dark:bg-amber-950',   text: 'text-amber-700 dark:text-amber-300'   },
  'Buyer/Procurement':       { icon: ShoppingBasket, bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300' },
}

export function getPortalStyle(name) {
  if (!name) return null
  const key = Object.keys(STYLES).find(k => name.toLowerCase().includes(k.toLowerCase()))
  return key ? STYLES[key] : null
}

export function PortalIcon({ name, size = 'md' }) {
  const style = getPortalStyle(name)
  if (!style) return null
  const Icon = style.icon
  return (
    <span className={`inline-flex items-center justify-center shrink-0 rounded-lg ${
      size === 'sm' ? 'size-5' : size === 'lg' ? 'size-9' : 'size-7'
    } ${style.bg} ${style.text}`}>
      <Icon className={size === 'sm' ? 'size-3' : size === 'lg' ? 'size-4' : 'size-3.5'} />
    </span>
  )
}
