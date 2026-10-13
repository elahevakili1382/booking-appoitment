import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { SCHEMA_SQL } from './schema'
import { tehranToday } from '../utils/dates'

let _db: Database.Database | null = null

function dbPath() {
  const config = useRuntimeConfig()
  if (config.dbPath) return String(config.dbPath)
  const dir = join(process.cwd(), 'data')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'lumina.sqlite')
}

export function getDb() {
  if (_db) return _db
  const path = dbPath()
  const isNew = !existsSync(path)
  _db = new Database(path)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  _db.exec(SCHEMA_SQL)
  if (isNew || needsSeed(_db)) {
    seedFromJson(_db)
  }
  return _db
}

function needsSeed(db: Database.Database) {
  const row = db.prepare('SELECT COUNT(*) AS c FROM staff').get() as { c: number }
  return row.c === 0
}

function nowIso() {
  return new Date().toISOString()
}

function seedFromJson(db: Database.Database) {
  const seedPath = join(process.cwd(), 'data', 'store.json')
  if (!existsSync(seedPath)) return
  const raw = JSON.parse(readFileSync(seedPath, 'utf-8')) as {
    services: Array<{
      id: string
      titleFa: string
      titleEn: string
      duration: number
      price: number
      location: string
      color: string
      active: boolean
    }>
    doctors: Array<{
      id: string
      nameFa: string
      nameEn: string
      roleFa: string
      roleEn: string
      active: boolean
    }>
    customers: Array<{
      id: string
      name: string
      phone: string
      fileNo: string
      lastVisit: string
      tag?: string
    }>
    bookings: Array<{
      id: string
      code: string
      branch: string
      service: string
      doctor: string
      visitType: string
      date?: string
      time?: string
      when: string
      name: string
      phone: string
      notes?: string
      total: number
      status: string
      createdAt: string
    }>
    calendarSlots?: Array<{
      id: string
      date: string
      staffId: string
      startHour: number
      startMin: number
      durationMin: number
      patientFa: string
      serviceFa: string
      status: string
      price?: number
      fileNo?: string
      allergyFa?: string
      meet?: boolean
    }>
    availability?: {
      days: Array<{ ranges: Array<{ start: string; end: string }> }>
    }
    stats?: Record<string, number>
  }

  const insertStaff = db.prepare(`
    INSERT OR IGNORE INTO staff (id, name_fa, name_en, role_fa, role_en, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const insertService = db.prepare(`
    INSERT OR IGNORE INTO services (id, title_fa, title_en, category, duration, price, location, color, active, description_fa, description_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertStaffService = db.prepare(`
    INSERT OR IGNORE INTO staff_services (staff_id, service_id) VALUES (?, ?)
  `)
  const insertShift = db.prepare(`
    INSERT OR IGNORE INTO shifts (id, staff_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?, ?)
  `)
  const insertCustomer = db.prepare(`
    INSERT OR IGNORE INTO customers (id, name, phone, file_no, last_visit, tag, notes, allergy, created_at)
    VALUES (?, ?, ?, ?, ?, ?, '', '', ?)
  `)
  const insertBooking = db.prepare(`
    INSERT OR IGNORE INTO bookings (
      id, code, customer_id, staff_id, service_id, branch, visit_type,
      starts_at, ends_at, status, name, phone, notes, total, deposit, payment_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'unpaid', ?)
  `)
  const insertSetting = db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`)
  const insertPost = db.prepare(`
    INSERT OR IGNORE INTO blog_posts (id, slug, title_fa, title_en, excerpt_fa, excerpt_en, body_fa, body_en, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, phone, name, role, created_at) VALUES (?, ?, ?, ?, ?)
  `)

  const categoryMap: Record<string, string> = {
    hifu: 'skin',
    profhilo: 'injectables',
    filler: 'injectables',
    consult: 'skin',
    bridal: 'packages',
  }

  const tx = db.transaction(() => {
    insertUser.run('admin-1', '09120000000', 'مدیر لومینا', 'admin', nowIso())
    insertUser.run('reception-1', '09121111111', 'منشی', 'receptionist', nowIso())

    for (const d of raw.doctors || []) {
      insertStaff.run(d.id, d.nameFa, d.nameEn, d.roleFa, d.roleEn, d.active ? 1 : 0, nowIso())
    }

    for (const s of raw.services || []) {
      insertService.run(
        s.id,
        s.titleFa,
        s.titleEn,
        categoryMap[s.id] || 'skin',
        s.duration,
        s.price,
        s.location,
        s.color,
        s.active ? 1 : 0,
        s.titleFa,
        s.titleEn,
      )
      for (const d of raw.doctors || []) {
        insertStaffService.run(d.id, s.id)
      }
    }

    const days = raw.availability?.days || []
    for (const d of raw.doctors || []) {
      for (let weekday = 0; weekday < 7; weekday++) {
        const ranges = days[weekday]?.ranges || []
        ranges.forEach((r, idx) => {
          insertShift.run(`${d.id}-${weekday}-${idx}`, d.id, weekday, r.start, r.end)
        })
      }
    }

    for (const c of raw.customers || []) {
      insertCustomer.run(c.id, c.name, c.phone, c.fileNo, c.lastVisit, c.tag || '', nowIso())
    }

    for (const b of raw.bookings || []) {
      const staffId = doctorToStaffId(b.doctor)
      const serviceId = (raw.services || []).find((s) => s.titleFa === b.service || s.titleEn === b.service)?.id || 'consult'
      const service = (raw.services || []).find((s) => s.id === serviceId)
      const duration = service?.duration || 45
      const date = b.date || tehranToday()
      const timeMatch = (b.time || b.when || '').match(/(\d{1,2}):(\d{2})/)
      const hh = timeMatch ? Number(timeMatch[1]) : 10
      const mm = timeMatch ? Number(timeMatch[2]) : 0
      const startsAt = toUtcIso(date, hh, mm)
      const endsAt = toUtcIso(date, hh, mm, duration)
      const customer = (raw.customers || []).find((c) => c.phone === b.phone)
      insertBooking.run(
        b.id,
        b.code,
        customer?.id || null,
        staffId,
        serviceId,
        b.branch,
        b.visitType,
        startsAt,
        endsAt,
        mapStatus(b.status),
        b.name,
        b.phone,
        b.notes || '',
        b.total,
        b.createdAt,
      )
    }

    // seed calendar demo slots as bookings for today
    const today = tehranToday()
    for (const slot of raw.calendarSlots || []) {
      if (slot.status === 'buffer') continue
      const date = slot.date || today
      const startsAt = toUtcIso(date, slot.startHour, slot.startMin)
      const endsAt = toUtcIso(date, slot.startHour, slot.startMin, slot.durationMin)
      const serviceId =
        (raw.services || []).find((s) => s.titleFa === slot.serviceFa)?.id || 'consult'
      insertBooking.run(
        slot.id,
        slot.fileNo || `LM-${slot.id}`,
        null,
        slot.staffId,
        serviceId,
        'شعبه زعفرانیه',
        slot.meet ? 'online' : 'clinic',
        startsAt,
        endsAt,
        mapSlotStatus(slot.status),
        slot.patientFa || 'مراجع',
        '09000000000',
        slot.allergyFa || '',
        slot.price || 0,
        nowIso(),
      )
      if (slot.allergyFa && slot.patientFa) {
        db.prepare(
          `UPDATE customers SET allergy = ? WHERE name = ?`,
        ).run(slot.allergyFa, slot.patientFa)
      }
    }

    insertSetting.run('cancelBeforeHours', '24')
    insertSetting.run('timezone', 'Asia/Tehran')
    insertSetting.run('clinicName', 'Lumina Clinic')
    insertSetting.run('activeRooms', String(raw.stats?.activeRooms ?? 4))
    insertSetting.run('smsProvider', 'mock')
    insertSetting.run('paymentProvider', 'zarinpal-sandbox')

    insertPost.run(
      'post-1',
      'hifu-aftercare',
      'مراقبت بعد از هایفوتراپی',
      'HIFU aftercare tips',
      'راهنمای مراقبت ۷ روزه پس از هایفو',
      '7-day aftercare guide after HIFU',
      'پس از هایفوتراپی از گرمای شدید و اسکراب خودداری کنید...',
      'Avoid heat and scrubbing after HIFU...',
      nowIso(),
    )
    insertPost.run(
      'post-2',
      'filler-myths',
      'باورهای غلط درباره فیلر',
      'Filler myths debunked',
      'آنچه باید قبل از تزریق بدانید',
      'What to know before fillers',
      'فیلر طبیعی وقتی توسط پزشک مجرب تزریق شود ایمن است...',
      'Natural fillers are safe with an experienced doctor...',
      nowIso(),
    )
  })

  tx()
}

function doctorToStaffId(doctor: string) {
  const d = doctor.toLowerCase()
  if (d.includes('rostami') || d.includes('رستمی')) return 'rostami'
  if (d.includes('bahrami') || d.includes('بهرامی')) return 'bahrami'
  if (d.includes('kaviani') || d.includes('کاویانی')) return 'kaviani'
  return 'rostami'
}

function mapStatus(s: string) {
  if (['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].includes(s)) return s
  return 'confirmed'
}

function mapSlotStatus(s: string) {
  if (s === 'completed' || s === 'paid') return 'completed'
  if (s === 'progress' || s === 'next') return 'confirmed'
  if (s === 'confirmed') return 'confirmed'
  return 'confirmed'
}

/** ساخت ISO UTC از تاریخ تهران YYYY-MM-DD و ساعت محلی */
export function toUtcIso(date: string, hour: number, min: number, addMinutes = 0) {
  // ذخیره به‌صورت offset تهران (+03:30) بدون DST پیچیده برای ایران
  const total = hour * 60 + min + addMinutes
  const h = Math.floor(total / 60)
  const m = total % 60
  const local = `${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+03:30`
  return new Date(local).toISOString()
}

export function getSetting(key: string, fallback = '') {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
  return row?.value ?? fallback
}

export function setSetting(key: string, value: string) {
  getDb().prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}

export function newId() {
  return crypto.randomUUID()
}

export function newBookingCode() {
  return `LM-${Math.floor(100000 + Math.random() * 900000)}`
}
