/**
 * محاسبه اسلات بر اساس مدت خدمت + شیفت + تداخل
 */
import { getDb, toUtcIso } from '../db'

export type Slot = {
  time: string
  startsAt: string
  endsAt: string
  staffId: string
  taken: boolean
}

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function fromMinutes(mins: number) {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd
}

export function hasConflict(staffId: string, startsAt: string, endsAt: string, excludeId?: string) {
  const db = getDb()
  const sql = excludeId
    ? `SELECT starts_at, ends_at FROM bookings WHERE staff_id = ? AND status NOT IN ('cancelled','no_show') AND id != ?`
    : `SELECT starts_at, ends_at FROM bookings WHERE staff_id = ? AND status NOT IN ('cancelled','no_show')`
  const rows = (
    excludeId ? db.prepare(sql).all(staffId, excludeId) : db.prepare(sql).all(staffId)
  ) as Array<{ starts_at: string; ends_at: string }>
  return rows.some((r) => rangesOverlap(startsAt, endsAt, r.starts_at, r.ends_at))
}

export function buildDurationSlots(opts: {
  date: string
  serviceId: string
  staffId?: string | 'any'
  intervalMin?: number
}): Slot[] {
  const db = getDb()
  const service = db.prepare('SELECT id, duration FROM services WHERE id = ? AND active = 1').get(opts.serviceId) as
    | { id: string; duration: number }
    | undefined
  if (!service) return []

  const duration = service.duration
  const interval = opts.intervalMin ?? 15
  const weekday = new Date(`${opts.date}T12:00:00`).getDay()

  let staffIds: string[]
  if (opts.staffId && opts.staffId !== 'any') {
    staffIds = [opts.staffId]
  } else {
    staffIds = (
      db
        .prepare(
          `SELECT s.id FROM staff s
           JOIN staff_services ss ON ss.staff_id = s.id
           WHERE s.active = 1 AND ss.service_id = ?`,
        )
        .all(opts.serviceId) as Array<{ id: string }>
    ).map((r) => r.id)
  }

  const byTime = new Map<string, Slot>()

  for (const staffId of staffIds) {
    const shifts = db
      .prepare('SELECT start_time, end_time FROM shifts WHERE staff_id = ? AND weekday = ?')
      .all(staffId, weekday) as Array<{ start_time: string; end_time: string }>

    const timeOff = db
      .prepare(`SELECT start_time, end_time FROM time_off WHERE date = ? AND (staff_id IS NULL OR staff_id = ?)`)
      .all(opts.date, staffId) as Array<{ start_time: string | null; end_time: string | null }>

    if (timeOff.some((t) => !t.start_time && !t.end_time)) continue

    for (const shift of shifts) {
      let cur = toMinutes(shift.start_time)
      const end = toMinutes(shift.end_time)
      while (cur + duration <= end) {
        const hh = Math.floor(cur / 60)
        const mm = cur % 60
        const time = fromMinutes(cur)
        const startsAt = toUtcIso(opts.date, hh, mm)
        const endsAt = toUtcIso(opts.date, hh, mm, duration)

        const blocked = timeOff.some((t) => {
          if (!t.start_time || !t.end_time) return false
          const [oh, om] = t.start_time.split(':').map(Number)
          const [eh, em] = t.end_time.split(':').map(Number)
          return rangesOverlap(startsAt, endsAt, toUtcIso(opts.date, oh, om), toUtcIso(opts.date, eh, em))
        })
        const taken = blocked || hasConflict(staffId, startsAt, endsAt)
        const slot: Slot = { time, startsAt, endsAt, staffId, taken }

        const existing = byTime.get(time)
        if (!existing) byTime.set(time, slot)
        else if (existing.taken && !taken) byTime.set(time, slot)

        cur += interval
      }
    }
  }

  return [...byTime.values()].sort((a, b) => a.time.localeCompare(b.time))
}

export function canCancelBooking(startsAt: string, cancelBeforeHours: number) {
  return Date.now() <= new Date(startsAt).getTime() - cancelBeforeHours * 3600_000
}

export function getCancelBeforeHours() {
  const row = getDb().prepare(`SELECT value FROM settings WHERE key = 'cancelBeforeHours'`).get() as
    | { value: string }
    | undefined
  return Number(row?.value || 24)
}
