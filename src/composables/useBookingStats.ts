

export interface BookingLite {
  id: string
  code?: string
  date?: string
  time?: string
  status: string
  total: number
  service?: string
  doctor?: string
  phone?: string
  /** unpaid | deposit_paid | paid */
  paymentStatus?: string
  createdAt?: string
}

export type StatusGroup = 'completed' | 'confirmed' | 'pending' | 'missed'

export const STATUS_GROUPS: StatusGroup[] = ['completed', 'confirmed', 'pending', 'missed']

/** درآمد فقط از نوبت‌هایی حساب می‌شود که لغو یا غیبت نشده‌اند. */
export function isCounted(status: string) {
  return status !== 'cancelled' && status !== 'no_show'
}

/** درآمد فقط از نوبت‌های تسویه‌شده (پول دریافت شده) و لغو/غیبت‌نشده حساب می‌شود. */
export function isRevenue(b: Pick<BookingLite, 'status' | 'paymentStatus'>) {
  return b.paymentStatus === 'paid' && isCounted(b.status)
}

export function groupOf(status: string): StatusGroup {
  if (status === 'completed') return 'completed'
  if (status === 'pending') return 'pending'
  if (status === 'cancelled' || status === 'no_show') return 'missed'
  return 'confirmed'
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** n روز تقویمی متوالی که به endIso ختم می‌شود (قدیمی ← جدید). */
export function lastNDays(endIso: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(endIso, i - (n - 1)))
}

export function revenueByDay(bookings: BookingLite[], days: string[]): number[] {
  const sums = new Map(days.map((d) => [d, 0]))
  for (const b of bookings) {
    if (b.date && sums.has(b.date) && isRevenue(b)) sums.set(b.date, sums.get(b.date)! + (b.total || 0))
  }
  return days.map((d) => sums.get(d) ?? 0)
}

export function statusCountsByDay(bookings: BookingLite[], days: string[]): Record<StatusGroup, number[]> {
  const index = new Map(days.map((d, i) => [d, i]))
  const out = Object.fromEntries(STATUS_GROUPS.map((g) => [g, days.map(() => 0)])) as Record<StatusGroup, number[]>
  for (const b of bookings) {
    const i = b.date ? index.get(b.date) : undefined
    if (i !== undefined) out[groupOf(b.status)]![i]!++
  }
  return out
}

export function periodDelta(bookings: BookingLite[], endIso: string, span = 7): number | null {
  const days = lastNDays(endIso, span * 2)
  const rev = revenueByDay(bookings, days)
  const prev = rev.slice(0, span).reduce((a, b) => a + b, 0)
  const curr = rev.slice(span).reduce((a, b) => a + b, 0)
  return prev > 0 ? (curr - prev) / prev : null
}

export function appointmentsDelta(bookings: BookingLite[], endIso: string, span = 7): number | null{
  const days = lastNDays(endIso, span * 2)
  const grouped  = statusCountsByDay(bookings, days) 
  const counts = days.map((_,i) => 
       (grouped.completed[i] ?? 0) 
     + (grouped.confirmed[i] ?? 0) 
     + (grouped.pending[i] ?? 0)
  )
 const prev = counts.slice(0, span).reduce((a, b) => a + b, 0)
  const curr = counts.slice(span).reduce((a, b) => a + b, 0)
    return prev > 0 ? (curr - prev) / prev : null

}




/** سلول CSV امن: گیومه‌گذاری و جلوگیری از اجرای فرمول در Excel (CSV injection). */
export function csvCell(value: unknown): string {
  let s = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

/** CSV نوبت‌ها بدون نام و شمارهٔ تلفن مراجع. */
export function bookingsToCsv(rows: BookingLite[]): string {
  const header = ['code', 'date', 'time', 'service', 'doctor', 'status', 'total']
  const lines = rows.map((b) => [b.code, b.date, b.time, b.service, b.doctor, b.status, b.total].map(csvCell).join(','))
  return '﻿' + [header.join(','), ...lines].join('\r\n')
}

export interface OverviewDoctor {
  id: string
  name: string
  role: string
  photo: string
  active: boolean
}

export interface OverviewSlot {
  staffId: string
  startHour: number
  startMin: number
}

export interface CustomerLite {
  id: string
  name: string
  phone: string
  fileNo: string
  lastVisit: string
  tag?: string
  notes?: string
  allergy?: string
}

export interface ServiceLite {
  id: string
  titleFa: string
  titleEn: string
  category?: string
  duration: number
  price: number
  location?: string
  active?: boolean
}
