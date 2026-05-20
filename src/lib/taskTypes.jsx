import {
  Bug,
  Sparkles,
  ArrowUpCircle,
  GitPullRequest,
  HeadphonesIcon,
  CalendarClock,
  BookOpen,
  Lightbulb,
  FlaskConical,
  Circle,
} from 'lucide-react'

export const TASK_TYPES = [
  { value: 'bugfix',      label: 'Bugfix',      icon: Bug,            bg: 'bg-red-100    dark:bg-red-950',    text: 'text-red-700    dark:text-red-300'    },
  { value: 'feature',     label: 'Feature',     icon: Sparkles,       bg: 'bg-blue-100   dark:bg-blue-950',   text: 'text-blue-700   dark:text-blue-300'   },
  { value: 'enhancement', label: 'Enhancement', icon: ArrowUpCircle,  bg: 'bg-cyan-100   dark:bg-cyan-950',   text: 'text-cyan-700   dark:text-cyan-300'   },
  { value: 'review',      label: 'Review',      icon: GitPullRequest, bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300' },
  { value: 'support',     label: 'Support',     icon: HeadphonesIcon, bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300' },
  { value: 'process',     label: 'Process',     icon: CalendarClock,  bg: 'bg-yellow-100 dark:bg-yellow-950', text: 'text-yellow-700 dark:text-yellow-300' },
  { value: 'learning',    label: 'Learning',    icon: BookOpen,       bg: 'bg-green-100  dark:bg-green-950',  text: 'text-green-700  dark:text-green-300'  },
  { value: 'suggestion',  label: 'Suggestion',  icon: Lightbulb,      bg: 'bg-pink-100   dark:bg-pink-950',   text: 'text-pink-700   dark:text-pink-300'   },
  { value: 'testing',     label: 'Testing',     icon: FlaskConical,   bg: 'bg-teal-100   dark:bg-teal-950',   text: 'text-teal-700   dark:text-teal-300'   },
  { value: 'other',       label: 'Other',       icon: Circle,         bg: 'bg-gray-100   dark:bg-gray-800',   text: 'text-gray-700   dark:text-gray-300'   },
]

export const TASK_TYPE_MAP = Object.fromEntries(TASK_TYPES.map((t) => [t.value, t]))

export function TaskTypeBadge({ type }) {
  const def = TASK_TYPE_MAP[type]
  if (!def) return null
  const Icon = def.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${def.bg} ${def.text}`}>
      <Icon className="size-3" />
      {def.label}
    </span>
  )
}

export function TaskTypeSelectItem({ type }) {
  const def = TASK_TYPE_MAP[type]
  if (!def) return null
  const Icon = def.icon
  return (
    <span className="flex items-center gap-2">
      <Icon className={`size-3.5 ${def.text}`} />
      {def.label}
    </span>
  )
}
