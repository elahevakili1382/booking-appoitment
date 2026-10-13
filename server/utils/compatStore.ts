import { getDb, getSetting } from '../db'
import { tehranToday } from './dates'
import { buildDurationSlots } from './bookingEngine'
import type {
  StoreData,
  BookingRecord,
  ServiceRecord,
  DoctorRecord,
  CustomerRecord,
  CalendarSlotRecord,
  DaySchedule,
} from './compatTypes'

export { newBookingCode } from '../db'
export { tehranToday } from './dates'
export { doctorToStaffId } from './bookingHelpers'

function tehranParts(iso: string) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(fmt.formatToParts(new Date(iso)).map((p) => [p.type, p.value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  }
}

function mapBooking(row: Record<string, unknown>): BookingRecord {
  const starts = String(row.starts_at)
  const p = tehranParts(starts)
  const staff = getDb().prepare('SELECT name_fa FROM staff WHERE id = ?').get(row.staff_id) as { name_fa: string } | undefined
  const service = getDb().prepare('SELECT title_fa FROM services WHERE id = ?').get(row.service_id) as
    | { title_fa: string }
    | undefined
  const time = `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`
  return {
    id: String(row.id),
    code: String(row.code),
    branch: String(row.branch || ''),
    service: service?.title_fa || String(row.service_id),
    doctor: staff?.name_fa || String(row.staff_id),
    visitType: String(row.visit_type),
    when: `${p.date} — ${time}`,
    date: p.date,
    time,
    name: String(row.name),
    phone: String(row.phone),
    notes: String(row.notes || ''),
    total: Number(row.total || 0),
    status: row.status as BookingRecord['status'],
    createdAt: String(row.created_at),
  }
}

export function readStore(): StoreData {
  const db = getDb()
  const services = (
    db.prepare('SELECT * FROM services').all() as Array<Record<string, unknown>>
  ).map((s) => ({
    id: String(s.id),
    titleFa: String(s.title_fa),
    titleEn: String(s.title_en),
    duration: Number(s.duration),
    price: Number(s.price),
    location: s.location as 'clinic' | 'online',
    color: String(s.color),
    active: Boolean(s.active),
    category: String(s.category),
  })) as ServiceRecord[]

  const doctors = (
    db.prepare('SELECT * FROM staff').all() as Array<Record<string, unknown>>
  ).map((d) => ({
    id: String(d.id),
    nameFa: String(d.name_fa),
    nameEn: String(d.name_en),
    roleFa: String(d.role_fa),
    roleEn: String(d.role_en),
    active: Boolean(d.active),
  })) as DoctorRecord[]

  const customers = (
    db.prepare('SELECT * FROM customers').all() as Array<Record<string, unknown>>
  ).map((c) => ({
    id: String(c.id),
    name: String(c.name),
    phone: String(c.phone),
    fileNo: String(c.file_no || ''),
    lastVisit: String(c.last_visit || ''),
    tag: String(c.tag || ''),
    notes: String(c.notes || ''),
    allergy: String(c.allergy || ''),
  })) as CustomerRecord[]

  const bookings = (db.prepare('SELECT * FROM bookings ORDER BY starts_at DESC').all() as Array<Record<string, unknown>>).map(
    mapBooking,
  )

  const today = tehranToday()
  const calendarSlots = getCalendarForDate(today)

  const days: DaySchedule[] = Array.from({ length: 7 }, (_, weekday) => {
    const ranges = db
      .prepare(
        `SELECT start_time AS start, end_time AS end FROM shifts WHERE weekday = ? GROUP BY start_time, end_time`,
      )
      .all(weekday) as Array<{ start: string; end: string }>
    // fallback: take rostami shifts
    if (!ranges.length) {
      return {
        ranges: (
          db
            .prepare(`SELECT start_time AS start, end_time AS end FROM shifts WHERE staff_id = 'rostami' AND weekday = ?`)
            .all(weekday) as Array<{ start: string; end: string }>
        ),
      }
    }
    return { ranges }
  })

  const dayStart = `${today}T00:00:00.000Z`
  const dayEnd = `${today}T23:59:59.999Z`
  // approximate with Tehran day via bookings.date mapped
  const appointmentsToday = bookings.filter((b) => b.date === today && b.status !== 'cancelled').length
  const revenueToday = bookings
    .filter((b) => b.date === today && b.status !== 'cancelled')
    .reduce((s, b) => s + b.total, 0)

  return {
    bookings,
    services,
    doctors,
    customers,
    calendarSlots,
    availability: {
      timezone: getSetting('timezone', 'Asia/Tehran'),
      name: 'Working hours',
      nameFa: 'ساعات کاری',
      days,
      overrides: [],
    },
    stats: {
      revenueToday,
      appointmentsToday,
      activeRooms: Number(getSetting('activeRooms', '4')),
      weekAppointments: bookings.filter((b) => b.status !== 'cancelled').length,
    },
  }
}

export function writeStore(_data: StoreData) {
  // no-op: SQLite is source of truth
}

export function updateStore(mutator: (draft: StoreData) => void): StoreData {
  const data = readStore()
  mutator(data)
  return data
}

export function buildSlotsForDate(dateStr: string, _intervalMin = 15) {
  // default service consult for legacy callers
  return buildDurationSlots({ date: dateStr, serviceId: 'consult', staffId: 'any' }).map((s) => ({
    time: s.time,
    taken: s.taken,
  }))
}

export function liveSlotStatus(
  slot: CalendarSlotRecord,
  dateStr: string,
): CalendarSlotRecord['status'] {
  if (slot.status === 'buffer') return 'buffer'
  const today = tehranToday()
  if (dateStr < today) return 'completed'
  if (dateStr > today) return slot.status === 'completed' ? 'confirmed' : slot.status
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const nowM =
    Number(parts.find((p) => p.type === 'hour')?.value) * 60 +
    Number(parts.find((p) => p.type === 'minute')?.value)
  const start = slot.startHour * 60 + slot.startMin
  const end = start + slot.durationMin
  if (nowM >= end) return 'completed'
  if (nowM >= start && nowM < end) return 'progress'
  if (nowM >= start - 45 && nowM < start) return 'next'
  return 'confirmed'
}

export function getCalendarForDate(dateStr: string): CalendarSlotRecord[] {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT b.*, s.title_fa, s.title_en, s.duration, st.name_fa AS staff_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN staff st ON st.id = b.staff_id
       WHERE b.status NOT IN ('cancelled')
       ORDER BY b.starts_at`,
    )
    .all() as Array<Record<string, unknown>>

  return rows
    .map((row) => {
      const p = tehranParts(String(row.starts_at))
      if (p.date !== dateStr) return null
      const duration = Number(row.duration)
      const base: CalendarSlotRecord = {
        id: String(row.id),
        date: p.date,
        staffId: String(row.staff_id),
        startHour: p.hour,
        startMin: p.minute,
        durationMin: duration,
        patientFa: String(row.name),
        patientEn: String(row.name),
        serviceFa: String(row.title_fa),
        serviceEn: String(row.title_en),
        status: 'confirmed',
        price: Number(row.total || 0),
        fileNo: String(row.code),
        meet: row.visit_type === 'online',
        allergyFa: String(row.notes || ''),
      }
      return { ...base, status: liveSlotStatus(base, dateStr) }
    })
    .filter((x): x is CalendarSlotRecord => x != null)
}

export function ensureCalendarDates(_dateStr?: string) {
  getDb()
  return readStore()
}

export { mapBooking }
