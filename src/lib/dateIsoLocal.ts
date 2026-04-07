/** Local-calendar YYYY-MM-DD (no UTC shift). */
export function todayIsoLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function addDaysIsoLocal(iso: string, days: number): string {
  const parts = iso.split("-").map(Number)
  const y = parts[0] ?? 0
  const mo = parts[1] ?? 1
  const da = parts[2] ?? 1
  const dt = new Date(y, mo - 1, da)
  dt.setDate(dt.getDate() + days)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  return `${yy}-${mm}-${dd}`
}
