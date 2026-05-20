export const TASK_STATUSES = [
  { value: 'todo',        label: 'Todo',         dot: 'bg-slate-400',  badge: 'bg-slate-100  text-slate-600  dark:bg-slate-800  dark:text-slate-300'  },
  { value: 'in_progress', label: 'In Progress',  dot: 'bg-blue-500',   badge: 'bg-blue-100   text-blue-700   dark:bg-blue-950   dark:text-blue-300'   },
  { value: 'completed',   label: 'Completed',    dot: 'bg-green-500',  badge: 'bg-green-100  text-green-700  dark:bg-green-950  dark:text-green-300'  },
  { value: 'pending',     label: 'Pending',      dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
  { value: 'blocked',     label: 'Blocked',      dot: 'bg-red-500',    badge: 'bg-red-100    text-red-700    dark:bg-red-950    dark:text-red-300'    },
]

export const TASK_STATUS_MAP = Object.fromEntries(TASK_STATUSES.map((s) => [s.value, s]))
