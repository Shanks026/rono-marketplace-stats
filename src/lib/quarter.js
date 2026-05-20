/**
 * Returns the current quarter string, e.g. "2026-Q1"
 */
export function getCurrentQuarter(date = new Date()) {
  const year = date.getFullYear()
  const q = Math.ceil((date.getMonth() + 1) / 3)
  return `${year}-Q${q}`
}
