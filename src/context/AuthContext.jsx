import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import {
  getAccounts,
  getActiveId,
  setActiveId,
  upsertAccount,
  dropAccount,
  getAccount,
} from '@/lib/accountStore'

const AuthContext = createContext(null)

function toStoreEntry(session) {
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState([])
  const [activeAccountId, setActiveAccountId] = useState(null)

  function syncState() {
    setAccounts([...getAccounts()])
    setActiveAccountId(getActiveId())
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession) {
        upsertAccount(newSession.user.id, toStoreEntry(newSession))
        setActiveId(newSession.user.id)
        syncState()
      }
    })

    // Restore the active account's session from localStorage
    const activeId = getActiveId()
    const stored = activeId ? getAccount(activeId) : null
    const restore = stored?.access_token && stored?.refresh_token
      ? supabase.auth.setSession({ access_token: stored.access_token, refresh_token: stored.refresh_token })
      : supabase.auth.getSession().then(({ data }) => ({ data: { session: data.session }, error: null }))

    restore.then(({ data, error }) => {
      const s = data?.session
      if (!error && s) {
        upsertAccount(s.user.id, toStoreEntry(s))
        setActiveId(s.user.id)
        setSession(s)
        setUser(s.user)
      }
      syncState()
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Add a new account without signing out of the current one.
  // Saves the current session first so it can be switched back to later.
  async function addAccount(email, password) {
    const { data: current } = await supabase.auth.getSession()
    if (current.session) {
      upsertAccount(current.session.user.id, toStoreEntry(current.session))
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // onAuthStateChange fires and updates everything
  }

  // Switch the active Supabase session to a stored account.
  async function switchAccount(id) {
    if (id === getActiveId()) return
    const { data: current } = await supabase.auth.getSession()
    if (current.session) {
      upsertAccount(current.session.user.id, toStoreEntry(current.session))
    }
    const account = getAccount(id)
    if (!account) throw new Error('Account not found')
    const { error } = await supabase.auth.setSession({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    })
    if (error) throw error
    setActiveId(id)
    syncState()
    queryClient.clear()
  }

  // Remove an account from the list. If it was active, switch to the next one.
  async function removeAccount(id) {
    const isActive = id === getActiveId()
    dropAccount(id)
    if (isActive) {
      const remaining = getAccounts()
      if (remaining.length > 0) {
        await supabase.auth.signOut({ scope: 'local' })
        setActiveId(remaining[0].id)
        await supabase.auth.setSession({
          access_token: remaining[0].access_token,
          refresh_token: remaining[0].refresh_token,
        })
      } else {
        await supabase.auth.signOut()
        setActiveId(null)
        setSession(null)
        setUser(null)
      }
    }
    syncState()
  }

  // Sign out of the active account. Switches to the next if others exist.
  async function signOut() {
    const currentId = getActiveId()
    dropAccount(currentId)
    queryClient.clear()
    await supabase.auth.signOut({ scope: 'local' })
    const remaining = getAccounts()
    if (remaining.length > 0) {
      setActiveId(remaining[0].id)
      await supabase.auth.setSession({
        access_token: remaining[0].access_token,
        refresh_token: remaining[0].refresh_token,
      })
    } else {
      setActiveId(null)
      setSession(null)
      setUser(null)
    }
    syncState()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      accounts,
      activeAccountId,
      addAccount,
      switchAccount,
      removeAccount,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
