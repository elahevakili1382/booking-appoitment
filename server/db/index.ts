import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import Database from 'better-sqlite3'
import { SCHEMA_SQL } from './schema'
import { tehranToday } from '../utils/dates'

let _db: Database.Database | null = null

interface SeedService {
  id: string
  titleFa: string
  titleEn: string
  category?: string
  duration: number
  price: number
  location: string
  color: string
  active: boolean
  descriptionFa?: string
  descriptionEn?: string
}

interface SeedDoctor {
  id: string
  nameFa: string
  nameEn: string
  roleFa: string
  roleEn: string
  image?: string
  active: boolean
}

interface SeedCustomer {
  id: string
  name: string
  phone: string
  fileNo: string
  lastVisit: string
  tag?: string
}

interface SeedBooking {
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
}

interface SeedCalendarSlot {
  id: string
  date?: string
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
}

interface SeedData {
  services?: SeedService[]
  doctors?: SeedDoctor[]
  customers?: SeedCustomer[]
  bookings?: SeedBooking[]
  calendarSlots?: SeedCalendarSlot[]
  availability?: {
    days: Array<{
      ranges: Array<{
        start: string
        end: string
      }>
    }>
  }
  stats?: Record<string, number>
}

interface DemoService {
  id: string
  category: string
  titleFa: string
  titleEn: string
  descriptionFa: string
  descriptionEn: string
  duration: number
  price: number
}

const CATEGORY_MAP: Record<string, string> = {
  hifu: 'skin',
  profhilo: 'injectables',
  filler: 'injectables',
  consult: 'skin',
  bridal: 'packages',
}

// قیمت‌ها و زمان‌های این فهرست صرفاً برای دموی نمونه‌کار هستند.
const DEMO_SERVICES: DemoService[] = [
  {
    id: 'skin-consultation',
    category: 'skin',
    titleFa: 'مشاوره تخصصی پوست',
    titleEn: 'Skin Consultation',
    descriptionFa:
      'جلسه ارزیابی وضعیت پوست و گفت‌وگو درباره گزینه‌های مراقبتی و درمانی.',
    descriptionEn:
      'An assessment of your skin and a discussion of care options.',
    duration: 30,
    price: 0,
  },
  {
    id: 'facial-care',
    category: 'skin',
    titleFa: 'پاکسازی و مراقبت پوست',
    titleEn: 'Facial Care',
    descriptionFa:
      'بررسی نیاز پوست و انتخاب مراحل پاکسازی و مراقبت متناسب با آن.',
    descriptionEn:
      'A tailored cleansing and skin care session.',
    duration: 60,
    price: 850000,
  },
  {
    id: 'microneedling',
    category: 'skin',
    titleFa: 'میکرونیدلینگ',
    titleEn: 'Microneedling',
    descriptionFa:
      'جلسه مشاوره و بررسی مناسب‌بودن میکرونیدلینگ برای دغدغه‌های پوستی شما.',
    descriptionEn:
      'Assessment and consultation for microneedling.',
    duration: 60,
    price: 1800000,
  },
  {
    id: 'chemical-peel',
    category: 'skin',
    titleFa: 'پیلینگ شیمیایی',
    titleEn: 'Chemical Peel',
    descriptionFa:
      'انتخاب نوع و شدت لایه‌برداری پس از ارزیابی پوست توسط پزشک.',
    descriptionEn:
      'A peel selected following a professional skin assessment.',
    duration: 45,
    price: 1200000,
  },
  {
    id: 'acne-consultation',
    category: 'skin',
    titleFa: 'مشاوره آکنه و جای جوش',
    titleEn: 'Acne & Acne Scar Consultation',
    descriptionFa:
      'بررسی آکنه و جای جوش و تنظیم برنامه درمانی متناسب با شرایط فرد.',
    descriptionEn:
      'An assessment of acne and acne scars to discuss a care plan.',
    duration: 30,
    price: 0,
  },
  {
    id: 'pigmentation-consultation',
    category: 'skin',
    titleFa: 'مشاوره لک و تیرگی پوست',
    titleEn: 'Pigmentation Consultation',
    descriptionFa:
      'ارزیابی لک‌های پوستی و بررسی گزینه‌های مناسب مراقبت و درمان.',
    descriptionEn:
      'An assessment of pigmentation concerns and care options.',
    duration: 30,
    price: 0,
  },
  {
    id: 'botulinum-consultation',
    category: 'injectables',
    titleFa: 'مشاوره تزریق بوتاکس',
    titleEn: 'Botulinum Toxin Consultation',
    descriptionFa:
      'بررسی شرایط فرد، نواحی موردنظر و مناسب‌بودن تزریق پیش از اقدام.',
    descriptionEn:
      'A consultation to assess suitability and discuss treatment areas.',
    duration: 30,
    price: 0,
  },
  {
    id: 'lip-filler-consultation',
    category: 'injectables',
    titleFa: 'مشاوره فیلر لب',
    titleEn: 'Lip Filler Consultation',
    descriptionFa:
      'بررسی فرم لب، انتظارات و گزینه‌های تزریق در جلسه مشاوره.',
    descriptionEn:
      'A consultation about lip shape, expectations and filler options.',
    duration: 30,
    price: 0,
  },
  {
    id: 'facial-filler-consultation',
    category: 'injectables',
    titleFa: 'مشاوره فیلر صورت',
    titleEn: 'Facial Filler Consultation',
    descriptionFa:
      'ارزیابی نواحی موردنظر صورت و توضیح محدودیت‌ها و گزینه‌های موجود.',
    descriptionEn:
      'An assessment of facial areas and a discussion of available options.',
    duration: 30,
    price: 0,
  },
  {
    id: 'laser-hair-reduction',
    category: 'laser',
    titleFa: 'لیزر موهای زائد',
    titleEn: 'Laser Hair Reduction',
    descriptionFa:
      'بررسی پوست، مو و ناحیه موردنظر پیش از تعیین برنامه جلسات لیزر.',
    descriptionEn:
      'Assessment of skin, hair and treatment areas before planning sessions.',
    duration: 45,
    price: 950000,
  },
  {
    id: 'laser-skin-consultation',
    category: 'laser',
    titleFa: 'مشاوره لیزر پوست',
    titleEn: 'Skin Laser Consultation',
    descriptionFa:
      'بررسی دغدغه‌های پوستی و مناسب‌بودن روش‌های لیزری موجود در کلینیک.',
    descriptionEn:
      'A consultation about skin concerns and available laser options.',
    duration: 30,
    price: 0,
  },
  {
    id: 'hair-loss-consultation',
    category: 'hair',
    titleFa: 'مشاوره ریزش مو',
    titleEn: 'Hair Loss Consultation',
    descriptionFa:
      'بررسی وضعیت پوست سر و الگوی ریزش مو برای تعیین مسیر ارزیابی و درمان.',
    descriptionEn:
      'An assessment of the scalp and hair loss pattern.',
    duration: 30,
    price: 0,
  },
]

function dbPath() {
  const config = useRuntimeConfig()

  const path = config.dbPath
    ? String(config.dbPath)
    : join(process.cwd(), 'data', 'lumina.sqlite')

  if (path !== ':memory:') {
    const dir = dirname(path)

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

  return path
}

function migrateDatabase(db: Database.Database) {
  const columns = db
    .prepare('PRAGMA table_info(staff)')
    .all() as Array<{ name: string }>

  if (!columns.some((column) => column.name === 'image_url')) {
    db.exec(`
      ALTER TABLE staff
      ADD COLUMN image_url TEXT DEFAULT ''
    `)
  }
}

function fillMissingStaffImages(db: Database.Database) {
  db.prepare(`
    UPDATE staff
    SET image_url = '/doctors/' || id || '.jpg'
    WHERE image_url IS NULL OR TRIM(image_url) = ''
  `).run()
}

export function getDb(): Database.Database {
  if (_db) return _db

  const path = dbPath()
  const isNew = path === ':memory:' || !existsSync(path)

  const db = new Database(path)

  try {
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    db.exec(SCHEMA_SQL)

    migrateDatabase(db)

    if (isNew || needsSeed(db)) {
      seedFromJson(db)
    }

    fillMissingStaffImages(db)

    // خدمات جدید برای دیتابیس‌های قبلی هم اضافه می‌شوند.
    addDemoServices(db)

    // فقط پس از تکمیل موفق راه‌اندازی، اتصال را نگه می‌داریم.
    _db = db

    return db
  }
  catch (error) {
    db.close()
    throw error
  }
}

function needsSeed(db: Database.Database) {
  const row = db
    .prepare('SELECT COUNT(*) AS c FROM staff')
    .get() as { c: number }

  return row.c === 0
}

function nowIso() {
  return new Date().toISOString()
}

function seedFromJson(db: Database.Database) {
  const seedPath = join(process.cwd(), 'data', 'store.json')

  if (!existsSync(seedPath)) return

  const raw = JSON.parse(
    readFileSync(seedPath, 'utf-8'),
  ) as SeedData

  const doctors = raw.doctors || []
  const services = raw.services || []
  const customers = raw.customers || []
  const bookings = raw.bookings || []
  const calendarSlots = raw.calendarSlots || []

  const insertStaff = db.prepare(`
    INSERT OR IGNORE INTO staff (
      id,
      name_fa,
      name_en,
      role_fa,
      role_en,
      image_url,
      active,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertService = db.prepare(`
    INSERT OR IGNORE INTO services (
      id,
      title_fa,
      title_en,
      category,
      duration,
      price,
      location,
      color,
      active,
      description_fa,
      description_en
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertStaffService = db.prepare(`
    INSERT OR IGNORE INTO staff_services (
      staff_id,
      service_id
    )
    VALUES (?, ?)
  `)

  const insertShift = db.prepare(`
    INSERT OR IGNORE INTO shifts (
      id,
      staff_id,
      weekday,
      start_time,
      end_time
    )
    VALUES (?, ?, ?, ?, ?)
  `)

  const insertCustomer = db.prepare(`
    INSERT OR IGNORE INTO customers (
      id,
      name,
      phone,
      file_no,
      last_visit,
      tag,
      notes,
      allergy,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, '', '', ?)
  `)

  const insertBooking = db.prepare(`
    INSERT OR IGNORE INTO bookings (
      id,
      code,
      customer_id,
      staff_id,
      service_id,
      branch,
      visit_type,
      starts_at,
      ends_at,
      status,
      name,
      phone,
      notes,
      total,
      deposit,
      payment_status,
      created_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      0, 'unpaid', ?
    )
  `)

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value)
    VALUES (?, ?)
  `)

  const insertPost = db.prepare(`
    INSERT OR IGNORE INTO blog_posts (
      id,
      slug,
      title_fa,
      title_en,
      excerpt_fa,
      excerpt_en,
      body_fa,
      body_en,
      published_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (
      id,
      phone,
      name,
      role,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
  `)

  const updateCustomerAllergy = db.prepare(`
    UPDATE customers
    SET allergy = ?
    WHERE name = ?
  `)

  const tx = db.transaction(() => {
    insertUser.run(
      'admin-1',
      '09120000000',
      'مدیر لومینا',
      'admin',
      nowIso(),
    )

    insertUser.run(
      'reception-1',
      '09121111111',
      'منشی',
      'receptionist',
      nowIso(),
    )

    for (const doctor of doctors) {
      insertStaff.run(
        doctor.id,
        doctor.nameFa,
        doctor.nameEn,
        doctor.roleFa,
        doctor.roleEn,
        doctor.image || `/doctors/${doctor.id}.jpg`,
        doctor.active ? 1 : 0,
        nowIso(),
      )
    }

    for (const service of services) {
      insertService.run(
        service.id,
        service.titleFa,
        service.titleEn,
        service.category || CATEGORY_MAP[service.id] || 'skin',
        service.duration,
        service.price,
        service.location,
        service.color,
        service.active ? 1 : 0,
        service.descriptionFa || service.titleFa,
        service.descriptionEn || service.titleEn,
      )

      // حفظ رفتار seed قبلی برای خدمات اولیه پروژه.
      // در نسخه واقعی، این رابطه باید بر اساس صلاحیت پزشک تنظیم شود.
      for (const doctor of doctors) {
        insertStaffService.run(doctor.id, service.id)
      }
    }

    const days = raw.availability?.days || []

    for (const doctor of doctors) {
      for (let weekday = 0; weekday < 7; weekday++) {
        const ranges = days[weekday]?.ranges || []

        ranges.forEach((range, index) => {
          insertShift.run(
            `${doctor.id}-${weekday}-${index}`,
            doctor.id,
            weekday,
            range.start,
            range.end,
          )
        })
      }
    }

    for (const customer of customers) {
      insertCustomer.run(
        customer.id,
        customer.name,
        customer.phone,
        customer.fileNo,
        customer.lastVisit,
        customer.tag || '',
        nowIso(),
      )
    }

    for (const booking of bookings) {
      const staffId = doctorToStaffId(booking.doctor)

      const serviceId =
        services.find(
          (service) =>
            service.titleFa === booking.service ||
            service.titleEn === booking.service,
        )?.id || 'consult'

      const service = services.find(
        (item) => item.id === serviceId,
      )

      const duration = service?.duration || 45
      const date = booking.date || tehranToday()

      const timeMatch = (
        booking.time || booking.when || ''
      ).match(/(\d{1,2}):(\d{2})/)

      const hour = timeMatch ? Number(timeMatch[1]) : 10
      const minute = timeMatch ? Number(timeMatch[2]) : 0

      const startsAt = toUtcIso(date, hour, minute)
      const endsAt = toUtcIso(date, hour, minute, duration)

      const customer = customers.find(
        (item) => item.phone === booking.phone,
      )

      insertBooking.run(
        booking.id,
        booking.code,
        customer?.id || null,
        staffId,
        serviceId,
        booking.branch,
        booking.visitType,
        startsAt,
        endsAt,
        mapStatus(booking.status),
        booking.name,
        booking.phone,
        booking.notes || '',
        booking.total,
        booking.createdAt,
      )
    }

    const today = tehranToday()

    for (const slot of calendarSlots) {
      if (slot.status === 'buffer') continue

      const date = slot.date || today

      const startsAt = toUtcIso(
        date,
        slot.startHour,
        slot.startMin,
      )

      const endsAt = toUtcIso(
        date,
        slot.startHour,
        slot.startMin,
        slot.durationMin,
      )

      const serviceId =
        services.find(
          (service) => service.titleFa === slot.serviceFa,
        )?.id || 'consult'

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
        updateCustomerAllergy.run(
          slot.allergyFa,
          slot.patientFa,
        )
      }
    }

    insertSetting.run('cancelBeforeHours', '24')
    insertSetting.run('timezone', 'Asia/Tehran')
    insertSetting.run('clinicName', 'Lumina Clinic')
    insertSetting.run(
      'activeRooms',
      String(raw.stats?.activeRooms ?? 4),
    )
    insertSetting.run('smsProvider', 'mock')
    insertSetting.run('paymentProvider', 'zarinpal-sandbox')

    insertPost.run(
      'post-1',
      'hifu-aftercare',
      'مراقبت بعد از هایفوتراپی',
      'HIFU aftercare tips',
      'راهنمای مراقبت پس از هایفو',
      'Aftercare following HIFU',
      'این متن نمونه است؛ محتوای مراقبتی باید توسط پزشک کلینیک تهیه و تأیید شود.',
      'Demo content. Aftercare instructions must be prepared and approved by the clinic physician.',
      nowIso(),
    )

    insertPost.run(
      'post-2',
      'filler-myths',
      'باورهای غلط درباره فیلر',
      'Filler myths',
      'پرسش‌هایی که پیش از تزریق باید مطرح کنید',
      'Questions to discuss before treatment',
      'این متن نمونه است؛ توضیحات مربوط به مزایا، خطرها و محدودیت‌ها باید توسط پزشک کلینیک تأیید شود.',
      'Demo content. Benefits, risks and limitations must be reviewed by the clinic physician.',
      nowIso(),
    )
  })

  tx()
}

function addDemoServices(db: Database.Database) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO services (
      id,
      title_fa,
      title_en,
      category,
      duration,
      price,
      location,
      color,
      active,
      description_fa,
      description_en
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const tx = db.transaction(() => {
    for (const service of DEMO_SERVICES) {
      insert.run(
        service.id,
        service.titleFa,
        service.titleEn,
        service.category,
        service.duration,
        service.price,
        'کلینیک لومینا',
        '#CBA47D',
        1,
        service.descriptionFa,
        service.descriptionEn,
      )
    }
  })

  tx()
}

function doctorToStaffId(doctor: string) {
  const value = doctor.toLowerCase()

  if (value.includes('rostami') || value.includes('رستمی')) {
    return 'rostami'
  }

  if (value.includes('bahrami') || value.includes('بهرامی')) {
    return 'bahrami'
  }

  if (value.includes('kaviani') || value.includes('کاویانی')) {
    return 'kaviani'
  }

  return 'rostami'
}

function mapStatus(status: string) {
  const allowed = [
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no_show',
  ]

  return allowed.includes(status) ? status : 'confirmed'
}

function mapSlotStatus(status: string) {
  if (status === 'completed' || status === 'paid') {
    return 'completed'
  }

  return 'confirmed'
}

/**
 * تبدیل تاریخ YYYY-MM-DD و ساعت محلی تهران به UTC.
 * offset ثابت +03:30 مطابق منطق فعلی پروژه حفظ شده است.
 */
export function toUtcIso(
  date: string,
  hour: number,
  minute: number,
  addMinutes = 0,
) {
  const midnight = new Date(
    `${date}T00:00:00+03:30`,
  )

  const totalMinutes = hour * 60 + minute + addMinutes

  return new Date(
    midnight.getTime() + totalMinutes * 60_000,
  ).toISOString()
}

export function getSetting(key: string, fallback = '') {
  const row = getDb()
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(key) as { value: string } | undefined

  return row?.value ?? fallback
}

export function setSetting(key: string, value: string) {
  getDb()
    .prepare(`
      INSERT OR REPLACE INTO settings (key, value)
      VALUES (?, ?)
    `)
    .run(key, value)
}

export function newId() {
  return crypto.randomUUID()
}

export function newBookingCode() {
  return `LM-${Math.floor(100000 + Math.random() * 900000)}`
}