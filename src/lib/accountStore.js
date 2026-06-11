const ACCOUNTS_KEY = 'thmp_accounts'
const ACTIVE_KEY = 'thmp_active_account'

export function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function getActiveId() {
  return localStorage.getItem(ACTIVE_KEY) ?? null
}

export function setActiveId(id) {
  if (id) localStorage.setItem(ACTIVE_KEY, id)
  else localStorage.removeItem(ACTIVE_KEY)
}

export function upsertAccount(userId, data) {
  const accounts = getAccounts()
  const idx = accounts.findIndex(a => a.id === userId)
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], ...data }
  } else {
    accounts.push({ id: userId, ...data })
  }
  saveAccounts(accounts)
}

export function dropAccount(userId) {
  saveAccounts(getAccounts().filter(a => a.id !== userId))
}

export function getAccount(userId) {
  return getAccounts().find(a => a.id === userId) ?? null
}
