# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

No test runner is currently configured.

## Stack

- **React 19** SPA with **React Router 7**, built with **Vite**
- **Supabase** for auth and backend
- **shadcn/ui** (new-york style) + **Radix UI** primitives + **Tailwind CSS 4**
- **React Hook Form** + **Zod** for form validation
- **`@`** path alias resolves to `./src/`

## Architecture

### Auth Flow

`App.jsx` is the auth boundary. It holds session state via `supabase.auth.getSession()` on mount and `supabase.auth.onAuthStateChange()` for live updates. Unauthenticated users are redirected to `/login`; authenticated users render `AppShell`.

### Layout

```
main.jsx
  └── ThemeProvider + SidebarProvider + BrowserRouter
        └── App.jsx (auth state, routing)
              ├── /login, /signup → auth pages
              └── * → AppShell
                    ├── AppSidebar (nav + user/logout)
                    ├── AppHeader (greeting + theme toggle)
                    └── AppBody (<Outlet /> for page content)
```

### Key Conventions

- **Styling:** Use `cn()` from `src/lib/utils.js` (clsx + tailwind-merge) for conditional class merging.
- **Theme:** Dark/light mode via CSS custom properties on `<html>`. Use `useTheme()` hook; toggle with `ModeToggle`.
- **UI components:** Add new shadcn/ui components via `npx shadcn@latest add <component>`. Components land in `src/components/ui/`.
- **Colors** are defined in `src/index.css` using oklch values with CSS custom properties (`--color-*`).
- **Mobile detection:** `useIsMobile()` hook in `src/hooks/` checks against 768px breakpoint.
