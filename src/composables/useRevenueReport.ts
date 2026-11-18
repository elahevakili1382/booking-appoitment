import {
  isRevenue,
  lastNDays,
  revenueByDay,
  type BookingLite,
} from './useBookingStats'

export interface RevenuePoint { d: string; value: number }
export interface RevenueRow { name: string; revenue: number; count: number; share: number }

export function recentBookings(bookings: BookingLite[], limit =  8): BookingLite[]{
    const copy = [...bookings]
    return copy.sort((a, b) =>  {
        const keyA = `${a.date ?? ''} ${a.time ?? ''} `
        const keyB = `${b.date ?? ''} ${b.time ?? ''} `
        return keyB.localeCompare(keyA)
    }).slice(0, limit) 
}

/** نوبت‌های تسویه‌شده (درآمدزا) در `period` روز تقویمی منتهی به `endIso`. */
function countedInRange(bookings: BookingLite[], endIso: string, period: number): BookingLite[] {
  const days = new Set(lastNDays(endIso, period))
  return bookings.filter((b) => b.date !== undefined && days.has(b.date) && isRevenue(b))
}

/** درآمد هر روز برای نمودار؛ روزهای بدون نوبت هم با صفر می‌آیند. */
export function revenuePoints(bookings: BookingLite[], endIso: string, period: number): RevenuePoint[] {
  const days = lastNDays(endIso, period)
  const values = revenueByDay(bookings, days)
  return days.map((d, i) => ({ d, value: values[i] ?? 0 }))
}

/** میانگین مبلغ هر نوبت در بازه؛ اگر نوبتی نباشد undefined (UI «—» نشان می‌دهد). */
export function averageTicket(bookings: BookingLite[], endIso: string, period: number): number | undefined {
  const rows = countedInRange(bookings, endIso, period)
  if (rows.length === 0) return undefined
  return rows.reduce((sum, b) => sum + (b.total || 0), 0) / rows.length
}

/** درآمد به تفکیک خدمت یا پزشک، نزولی؛ share کسری از کل بازه است (۰ تا ۱). */
export function breakdownBy(
  bookings: BookingLite[], endIso: string, period: number, key: 'service' | 'doctor',
): RevenueRow[] {
  const rows = countedInRange(bookings, endIso, period)
  const total = rows.reduce((sum, b) => sum + (b.total || 0), 0)
  const groups = new Map<string, { revenue: number; count: number }>()
  for (const b of rows) {
    const name = (b[key] ?? '').trim() || '—'
    const g = groups.get(name) ?? { revenue: 0, count: 0 }
    g.revenue += b.total || 0
    g.count += 1
    groups.set(name, g)
  }
  return [...groups.entries()]
    .map(([name, g]) => ({ name, revenue: g.revenue, count: g.count, share: total > 0 ? g.revenue / total : 0 }))
    .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
}
