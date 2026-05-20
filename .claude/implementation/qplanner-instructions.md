# Q-Planner — Claude Code Build Instructions

> Personal quarterly goal tracker for a software engineer at a marketplace company.
> Built with React + Vite, Tailwind CSS, shadcn/ui, Supabase (auth + DB), and Claude AI via Supabase Edge Functions.

---

## Project context

This app helps a software engineer log daily work tasks and automatically map them to quarterly performance goals using Claude AI. At the end of each quarter, the app generates a formatted report that can be pasted directly into a performance review document.

The engineer works on a marketplace platform with the following portals:
- Admin Portal
- Vendor Portal
- Store Management Portal
- Buyer Portal / Procurement
- Storefront
- Onboarding Portal
- Signup Portal

---

## Starting point

We are building on top of an existing project template that already has:
- React + Vite setup
- Tailwind CSS configured
- shadcn/ui installed and configured
- Supabase client file at `src/lib/supabase.js` (keys need to be added)
- Basic authentication scaffolding

Do not reinstall or reconfigure any of the above. Build on top of what exists.

---

## Phase 1 — Foundation & Core Loop

This is the first and most critical phase. Complete all steps in order.

---

### Step 1 — Supabase client configuration

In `src/lib/supabase.js`, ensure the client is configured correctly:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Create a `.env` file at the project root (if not already present):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### Step 2 — Authentication (Supabase Auth)

Use Supabase email/password authentication. This is a personal app — no social login needed.

#### Auth pages required

**`src/pages/auth/LoginPage.jsx`**
- Email + password fields
- Submit button: "Sign in"
- Link to register page
- On success: redirect to `/`
- On error: show inline error message using shadcn `Alert`

**`src/pages/auth/RegisterPage.jsx`**
- Full name, email, password, confirm password fields
- On success: redirect to `/` or show "Check your email" message depending on Supabase email confirmation settings
- On error: show inline error message

**`src/pages/auth/ForgotPasswordPage.jsx`**
- Email field only
- Sends Supabase password reset email
- Show success message after submit

#### Auth logic

Create `src/hooks/useAuth.js`:

```js
// Exposes:
// - user (from supabase session)
// - loading (boolean)
// - signIn(email, password)
// - signUp(email, password, fullName)
// - signOut()
// - resetPassword(email)
```

Create `src/context/AuthContext.jsx`:
- Wraps the app with auth state
- Listens to `supabase.auth.onAuthStateChange`
- Provides `user`, `session`, `loading` to the entire tree

Create `src/components/auth/ProtectedRoute.jsx`:
- Wraps all authenticated routes
- Redirects to `/login` if no active session
- Shows a loading spinner while session is being checked

#### Routing structure

```jsx
// src/main.jsx or src/App.jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route element={<ProtectedRoute />}>
    <Route element={<AppShell />}>
      <Route path="/" element={<DailyLog />} />
      <Route path="/goals" element={<GoalsView />} />
      <Route path="/portals" element={<PortalView />} />
      <Route path="/report" element={<ReportView />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </Route>
</Routes>
```

---

### Step 3 — Database schema

Run this SQL in the Supabase SQL editor. Execute in order.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now(),
  unique(user_id)
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── portals ─────────────────────────────────────────────────────────────────
create table portals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  color_token text not null default 'gray',
  order_index integer default 0,
  created_at timestamptz default now()
);

-- ─── goals ───────────────────────────────────────────────────────────────────
create table goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quarter text not null,          -- e.g. "2026-Q4"
  title text not null,
  description text,
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── tasks ───────────────────────────────────────────────────────────────────
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_input text not null,
  summary text not null,
  portal_id uuid references portals(id) on delete set null,
  task_type text check (task_type in ('bugfix','feature','review','support','process','learning','other')),
  effort_hours numeric(4,1),
  jira_ref text,
  quarter text not null,          -- e.g. "2026-Q4"
  logged_date date not null default current_date,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── task_goals (many-to-many junction) ──────────────────────────────────────
create table task_goals (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks(id) on delete cascade,
  goal_id uuid not null references goals(id) on delete cascade,
  confidence numeric(3,2) default 1.0,  -- AI confidence score 0.0 to 1.0
  unique(task_id, goal_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table profiles    enable row level security;
alter table portals     enable row level security;
alter table goals       enable row level security;
alter table tasks       enable row level security;
alter table task_goals  enable row level security;

-- profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);

-- portals
create policy "Users can manage own portals" on portals for all using (auth.uid() = user_id);

-- goals
create policy "Users can manage own goals" on goals for all using (auth.uid() = user_id);

-- tasks
create policy "Users can manage own tasks" on tasks for all using (auth.uid() = user_id);

-- task_goals: allow access if the task belongs to the user
create policy "Users can manage own task_goals" on task_goals for all
  using (
    exists (
      select 1 from tasks where tasks.id = task_goals.task_id and tasks.user_id = auth.uid()
    )
  );
```

---

### Step 4 — Seed default portals and goals after first login

After the user registers and is redirected into the app, check if they have any portals. If not, seed the defaults automatically.

**Default portals to seed** (in `src/lib/seedDefaults.js`):

```js
export const DEFAULT_PORTALS = [
  { label: 'Admin Portal',           color_token: 'violet' },
  { label: 'Vendor Portal',          color_token: 'blue'   },
  { label: 'Store Management',       color_token: 'cyan'   },
  { label: 'Buyer / Procurement',    color_token: 'emerald'},
  { label: 'Storefront',             color_token: 'amber'  },
  { label: 'Onboarding Portal',      color_token: 'orange' },
  { label: 'Signup Portal',          color_token: 'rose'   },
  { label: 'General / Cross-portal', color_token: 'gray'   },
]
```

**Default goals to seed** (2026-Q4 objectives — these are the real goals):

```js
export const DEFAULT_GOALS = [
  {
    quarter: '2026-Q4',
    order_index: 1,
    title: 'Extended Support, Capability Building & Process Discipline',
    description: 'Provide extended support when needed, continuously enhance technical skills, follow disciplined engineering practices, support releases and critical issues.',
  },
  {
    quarter: '2026-Q4',
    order_index: 2,
    title: 'Contribution Through Enhancements & Innovation',
    description: 'Go beyond assigned tasks by driving meaningful improvements such as enhancements, refactoring, and optimizations that boost code quality, performance, productivity, and maintainability.',
  },
  {
    quarter: '2026-Q4',
    order_index: 3,
    title: 'Timely & Quality Completion of Deliverables',
    description: 'Complete assigned tasks on time with high quality and minimal defects, follow development and review processes, participate in sprint ceremonies, use Jira properly.',
  },
]
```

Call the seed function in `src/hooks/useBootstrap.js` — run it once on first login (guard with a check for existing portals).

---

### Step 5 — Supabase Edge Function: classify-task

Create the Edge Function at `supabase/functions/classify-task/index.ts`.

This function receives the user's raw task input plus their goals and portals, calls the Anthropic API, and returns structured JSON classification.

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

serve(async (req) => {
  const { raw_input, goals, portals } = await req.json()

  const goalsText = goals.map((g: any, i: number) =>
    `Goal ${i + 1} [id: ${g.id}]: ${g.title} — ${g.description}`
  ).join('\n')

  const portalsText = portals.map((p: any) =>
    `[id: ${p.id}] ${p.label}`
  ).join(', ')

  const systemPrompt = `You are a task classifier for a software engineer at a marketplace company.

The engineer works across these portals: ${portalsText}

Their quarterly goals are:
${goalsText}

Analyse the user's task input and return ONLY valid JSON with no markdown fences, no explanation, no preamble. Return exactly this shape:

{
  "summary": "concise 1-line description of what was done (max 120 chars)",
  "goal_ids": ["goal-uuid"],
  "confidence": [0.9],
  "portal_id": "portal-uuid-or-null",
  "task_type": "bugfix | feature | review | support | process | learning | other",
  "effort_hours": 1.5,
  "jira_ref": "MP-1234 or null"
}

Rules:
- goal_ids and confidence are parallel arrays. One task can map to 1 or 2 goals maximum.
- confidence is a float between 0.0 and 1.0
- effort_hours: estimate from the description. Default to 1.0 if unclear.
- jira_ref: extract ticket number if mentioned (e.g. MP-123, MKTPL-456), otherwise null.
- portal_id: match to the most relevant portal. Use null only if truly cross-portal or unclear.
- task_type: pick the single most fitting type.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: raw_input }],
    }),
  })

  const data = await response.json()
  const text = data.content[0].text.trim()

  return new Response(text, {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

Deploy with:
```bash
supabase functions deploy classify-task
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key
```

---

### Step 6 — React Query hooks

Install if not already present:
```bash
npm install @tanstack/react-query
```

Wrap the app in `QueryClientProvider` in `main.jsx`.

#### `src/hooks/useGoals.js`
```js
// useGoals() — returns:
// - goals: Goal[]         filtered by current quarter
// - isLoading
// - createGoal(data)
// - updateGoal(id, data)
// - deleteGoal(id)
```

#### `src/hooks/usePortals.js`
```js
// usePortals() — returns:
// - portals: Portal[]
// - isLoading
// - createPortal(data)
// - updatePortal(id, data)
// - deletePortal(id)
```

#### `src/hooks/useTasks.js`
```js
// useTasks(filters?) — returns:
// - tasks: TaskWithRelations[]   (joined with portal label + goal titles)
// - isLoading
// - createTask(data)             (inserts task + task_goals in a transaction)
// - updateTask(id, data)
// - deleteTask(id)               (soft delete: sets is_deleted = true)
```

#### `src/services/classifyTask.js`
```js
// classifyTask(rawInput, goals, portals) -> ClassificationResult
// Calls the classify-task edge function
// Returns parsed JSON or throws a typed error
```

---

### Step 7 — App layout (AppShell)

**`src/components/layout/AppShell.jsx`**

A two-column layout:
- Left: fixed sidebar (240px wide)
- Right: `<Outlet />` (main content area, scrollable)

Sidebar navigation links (using shadcn `Button` variant="ghost"):
- Daily Log → `/`
- Goals View → `/goals`
- Portal View → `/portals`
- Quarterly Report → `/report`
- Settings → `/settings`
- Sign out button at the bottom (calls `signOut()` from `useAuth`)

Show the logged-in user's full name (from profile) at the top of the sidebar.

Show the current active quarter as a small muted badge in the sidebar (e.g. "2026-Q4").

---

### Step 8 — Task input bar

**`src/components/tasks/TaskInputBar.jsx`**

This is the core interaction component. It should be pinned at the top of every main view (Daily Log, Goals View, Portal View).

#### Behaviour
- Single text input, full width, with placeholder: `"What did you work on? (e.g. Fixed vendor portal login bug, ~2hrs, MP-456)"`
- Mic button on the right side of the input — uses Web Speech API (`window.SpeechRecognition`)
  - On click: starts recording, button turns active/red
  - On speech end: fills the input with transcribed text
  - If browser does not support speech: hide the mic button silently
- On submit (Enter or send button):
  1. Show a loading state on the input
  2. Call `classifyTask(rawInput, goals, portals)`
  3. Show `<TaskPreviewCard />` with the AI result
  4. User can confirm or cancel

**`src/components/tasks/TaskPreviewCard.jsx`**

Shown as a shadcn `Dialog` or an inline slide-down panel after AI classification.

Displays:
- AI-generated summary (editable text field)
- Mapped goals (shown as badges, user can remove/change)
- Portal tag (dropdown to change)
- Task type badge (selectable)
- Effort hours (number input, pre-filled by AI)
- Jira ref (text input, pre-filled if detected)
- Logged date (date picker, defaults to today)

Two buttons: **"Log task"** (confirms and saves) and **"Cancel"** (dismisses).

---

### Step 9 — Pages

#### `src/pages/DailyLog.jsx`
- `TaskInputBar` at top
- Tasks in reverse chronological order (newest first)
- Group by date with a date heading (e.g. "Today", "Yesterday", "March 20")
- Each task rendered as `<TaskCard />`
- Filter bar: date range picker, portal filter, goal filter, task type filter (all using shadcn Select/Popover)

#### `src/components/tasks/TaskCard.jsx`
Displays a single logged task:
- Summary text (primary)
- Row of tags: portal badge, task type badge, goal badge(s), effort chip, Jira ref link (if present)
- Logged date in muted text
- Three-dot menu (shadcn `DropdownMenu`): Edit, Delete
- Edit opens `<TaskEditDialog />`
- Delete shows a shadcn `AlertDialog` confirmation, then soft-deletes

#### `src/components/tasks/TaskEditDialog.jsx`
- shadcn `Dialog`
- Same fields as `TaskPreviewCard`
- Pre-filled with existing task data
- On save: calls `updateTask(id, data)`

#### `src/pages/GoalsView.jsx`
- `TaskInputBar` at top
- Quarter selector at top right (e.g. "2026-Q4" dropdown)
- Each goal rendered as an expandable card section:
  - Goal title + description
  - Total task count + total effort hours for that goal
  - Expandable list of `<TaskCard />` components mapped to that goal
  - Sorted by logged date descending

#### `src/pages/PortalView.jsx`
- `TaskInputBar` at top
- Same expandable pattern as Goals View but grouped by portal
- Show task count per portal

#### `src/pages/ReportView.jsx`
- Quarter selector at top
- "Copy report" button (copies formatted text to clipboard using `navigator.clipboard`)
- Report rendered in a readable format:

```
QUARTERLY PERFORMANCE REPORT — 2026 Q4
Generated: [date]

─────────────────────────────────────────
GOAL 1: Extended Support, Capability Building & Process Discipline
─────────────────────────────────────────
Total tasks: 12  |  Total effort: 24.5 hrs

• [2026-03-01] Fixed critical login issue on Admin Portal — MP-456 (2hrs, bugfix)
• [2026-03-03] Code review for vendor onboarding PR (1.5hrs, review)
...

─────────────────────────────────────────
GOAL 2: Contribution Through Enhancements & Innovation
─────────────────────────────────────────
...
```

- Button copies this exact plain-text format to clipboard
- Below the copy button, render the same content visually formatted with shadcn components for on-screen reading

#### `src/pages/SettingsPage.jsx`
Two sections:

**Manage goals**
- List current goals with edit/delete per goal
- "Add goal" button — opens a form with quarter, title, description fields
- Quarter is a text input (e.g. "2026-Q4") — no fancy date picker

**Manage portals**
- List current portals with label, color picker, delete
- "Add portal" button

---

## Phase 2 — Polish & enhancements (after Phase 1 is working)

These are not part of the initial build. Add only after Phase 1 is fully functional.

- Search bar in Daily Log (client-side filter on summary text)
- Dashboard home page with: tasks logged this week, effort this week, goal coverage chart (recharts bar chart), most active portal
- Keyboard shortcut: `/` focuses the task input bar from anywhere
- Task streaks / activity heatmap (like GitHub contributions)
- Export report as `.txt` file download (in addition to copy)

---

## Component and style conventions

- Use shadcn/ui components for all UI: `Button`, `Input`, `Dialog`, `AlertDialog`, `DropdownMenu`, `Select`, `Badge`, `Card`, `Separator`, `Popover`, `Calendar`
- Use Tailwind utility classes for layout and spacing only — do not write custom CSS
- All data fetching via React Query — no raw `useEffect` + `useState` for server data
- Supabase calls only in hooks (`src/hooks/`) — never call supabase directly from a component
- All Anthropic API calls go through the Edge Function — never call the Anthropic API from the frontend
- Use `date-fns` for all date formatting and manipulation
- Soft delete only — never hard delete tasks (set `is_deleted = true`, filter it out in queries)
- RLS enforces data isolation — every query automatically scopes to the logged-in user

---

## Environment variables summary

```
# .env (frontend)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Supabase Edge Function secret (set via CLI)
ANTHROPIC_API_KEY=
```

---

## Build order checklist

Complete in this exact order:

- [ ] 1. Add Supabase keys to `.env` and verify `supabase.js`
- [ ] 2. Run SQL migration in Supabase SQL editor
- [ ] 3. Build `AuthContext`, `useAuth`, `ProtectedRoute`
- [ ] 4. Build Login, Register, Forgot Password pages
- [ ] 5. Build `AppShell` + `Sidebar` with routing
- [ ] 6. Build `useBootstrap` — seed portals and goals on first login
- [ ] 7. Build `useGoals`, `usePortals`, `useTasks` hooks
- [ ] 8. Deploy `classify-task` Edge Function + set `ANTHROPIC_API_KEY` secret
- [ ] 9. Build `classifyTask` service
- [ ] 10. Build `TaskInputBar` + `TaskPreviewCard`
- [ ] 11. Build `TaskCard` + `TaskEditDialog`
- [ ] 12. Build `DailyLog` page — full task log with filters
- [ ] 13. Build `GoalsView` page
- [ ] 14. Build `PortalView` page
- [ ] 15. Build `ReportView` page with copy-to-clipboard
- [ ] 16. Build `SettingsPage` — manage goals and portals
- [ ] 17. Test full flow end to end: register → seed → log task → classify → confirm → view in Goals → generate report