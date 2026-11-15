import { getDb, newBookingCode, newId, toUtcIso } from '../../db'
import { buildDurationSlots, hasConflict } from '../../utils/bookingEngine'
import { doctorToStaffId } from '../../utils/bookingHelpers'
import { tehranToday } from '../../utils/dates'
import { sendSms } from '../../utils/sms'
import { clientIp, rateLimit } from '../../utils/rateLimit'

/**
 * POST /api/bookings — ایجاد نوبت با قفل تداخل (409). عمداً عمومی است (رزرو مهمان).
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, `book-ip:${clientIp(event)}`, 30, 10 * 60_000)

  const body = await readBody<{
    branch?: string
    service?: string
    serviceId?: string
    doctor?: string
    staffId?: string | 'any'
    visitType?: string
    when?: string
    date?: string
    time?: string
    startsAt?: string
    name: string
    phone: string
    notes?: string
    total?: number
    deposit?: number
  }>(event)

  if (!body?.name || !body?.phone) {
    throw createError({ statusCode: 400, statusMessage: 'Missing name/phone' })
  }

  // اعتبارسنجی ورودی (تبدیل ارقام فارسی/عربی به لاتین، فرمت موبایل ایران، طول متن‌ها)
  const toLatin = (s: string) =>
    s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  body.phone = toLatin(String(body.phone)).replace(/\D/g, '')
  body.name = String(body.name).trim()
  body.notes = body.notes ? String(body.notes).slice(0, 500) : ''
  if (!/^09\d{9}$/.test(body.phone)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mobile' })
  }
  if (body.name.length < 2 || body.name.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid name' })
  }
  rateLimit(event, `book-phone:${body.phone}`, 5, 60 * 60_000)

  const db = getDb()
  const date = body.date || tehranToday()

  let serviceId = body.serviceId
  if (!serviceId && body.service) {
    const s = db
      .prepare(`SELECT id FROM services WHERE title_fa = ? OR title_en = ? OR id = ?`)
      .get(body.service, body.service, body.service) as { id: string } | undefined
    serviceId = s?.id
  }
  if (!serviceId) throw createError({ statusCode: 400, statusMessage: 'Unknown service' })

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId) as {
    id: string
    duration: number
    price: number
    title_fa: string
  }

  let staffId = body.staffId && body.staffId !== 'any' ? String(body.staffId) : undefined
  // نام پزشک فقط وقتی استفاده می‌شود که staffId اصلاً ارسال نشده باشد؛ 'any' یعنی «بدون ترجیح»
  if (!staffId && !body.staffId && body.doctor) {
    // پزشک بدون نگاشت معتبر هرگز به پزشک دیگری نسبت داده نمی‌شود
    staffId = doctorToStaffId(body.doctor) ?? undefined
    if (!staffId) throw createError({ statusCode: 400, statusMessage: 'Unknown doctor' })
  }
  if (staffId) {
    const staffRow = db.prepare('SELECT id FROM staff WHERE id = ? AND active = 1').get(staffId)
    if (!staffRow) throw createError({ statusCode: 400, statusMessage: 'Unknown doctor' })
  }

  let startsAt = body.startsAt
  let endsAt: string | undefined
  let time = body.time

  if (!startsAt && time) {
    const [hh, mm] = time.split(':').map(Number)
    startsAt = toUtcIso(date, hh, mm)
    endsAt = toUtcIso(date, hh, mm, service.duration)
  }

  if (!startsAt) {
    throw createError({ statusCode: 400, statusMessage: 'Missing time' })
  }

  if (!endsAt) {
    const startMs = new Date(startsAt).getTime()
    endsAt = new Date(startMs + service.duration * 60_000).toISOString()
  }

  if (!time) {
    const slots = buildDurationSlots({ date, serviceId, staffId: staffId || 'any' })
    const match = slots.find((s) => s.startsAt === startsAt)
    time = match?.time
    if (match) staffId = match.staffId
  }

  if (!staffId) {
    const slots = buildDurationSlots({ date, serviceId, staffId: 'any' })
    const match = slots.find((s) => !s.taken && (s.time === time || s.startsAt === startsAt))
    if (!match) throw createError({ statusCode: 409, statusMessage: 'No staff available' })
    staffId = match.staffId
    startsAt = match.startsAt
    endsAt = match.endsAt
  }

  if (hasConflict(staffId, startsAt, endsAt)) {
    throw createError({ statusCode: 409, statusMessage: 'Time slot conflict' })
  }

  // جلوگیری از رزرو زمان گذشته
  if (new Date(startsAt).getTime() < Date.now() - 60_000) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot book a past time' })
  }

  // مبلغ از قیمت خدمت در سرور می‌آید (نه از کلاینت)؛ بیعانه بین صفر و مبلغ محدود می‌شود
  const total = service.price
  const deposit = Math.min(Math.max(Number(body.deposit) || 0, 0), total)

  // جلوگیری از ثبت تکراری و احتکار زمان‌ها
  const duplicate = db
    .prepare(
      `SELECT id FROM bookings WHERE phone = ? AND service_id = ? AND starts_at = ?
       AND status NOT IN ('cancelled','no_show')`,
    )
    .get(body.phone, serviceId, startsAt)
  if (duplicate) throw createError({ statusCode: 409, statusMessage: 'Duplicate booking' })

  const active = db
    .prepare(
      `SELECT COUNT(*) AS c FROM bookings WHERE phone = ? AND status IN ('confirmed','pending') AND starts_at > ?`,
    )
    .get(body.phone, new Date().toISOString()) as { c: number }
  if (active.c >= 5) {
    throw createError({ statusCode: 429, statusMessage: 'Too many active bookings' })
  }

  const code = newBookingCode()
  const id = newId()
  const createdAt = new Date().toISOString()

  let customer = db.prepare('SELECT id FROM customers WHERE phone = ?').get(body.phone) as { id: string } | undefined
  if (!customer) {
    const cid = newId()
    db.prepare(
      `INSERT INTO customers (id, name, phone, file_no, last_visit, tag, notes, allergy, created_at)
       VALUES (?, ?, ?, ?, ?, '', '', ?, ?)`,
    ).run(cid, body.name, body.phone, code, date, body.notes || '', createdAt)
    customer = { id: cid }
  }
  // مشتری موجود: نام و اطلاعات پروفایل با داده‌ی ارسالی مهمان تغییر نمی‌کند.
  // این رزرو فقط با شماره به رکورد مشتری وصل می‌شود؛ حساب کاربری فقط با تأیید OTP متصل می‌شود.

  try {
    db.prepare(
      `INSERT INTO bookings (
        id, code, customer_id, staff_id, service_id, branch, visit_type,
        starts_at, ends_at, status, name, phone, notes, total, deposit, payment_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, ?, 'unpaid', ?)`,
    ).run(
      id,
      code,
      customer.id,
      staffId,
      serviceId,
      body.branch || '',
      body.visitType || 'clinic',
      startsAt,
      endsAt,
      body.name,
      body.phone,
      body.notes || '',
      total,
      deposit,
      createdAt,
    )
  } catch {
    throw createError({ statusCode: 409, statusMessage: 'Time slot conflict' })
  }

  // double-check after insert
  const overlaps = db
    .prepare(
      `SELECT id FROM bookings WHERE staff_id = ? AND id != ? AND status NOT IN ('cancelled','no_show')
       AND starts_at < ? AND ends_at > ?`,
    )
    .all(staffId, id, endsAt, startsAt) as Array<{ id: string }>
  if (overlaps.length) {
    db.prepare(`DELETE FROM bookings WHERE id = ?`).run(id)
    throw createError({ statusCode: 409, statusMessage: 'Time slot conflict' })
  }

  await sendSms(body.phone, `نوبت شما در لومینا ثبت شد. کد: ${code}`)

  return {
    ok: true,
    data: {
      id,
      code,
      staffId,
      serviceId,
      startsAt,
      endsAt,
      date,
      time,
      name: body.name,
      phone: body.phone,
      total,
      status: 'confirmed',
      createdAt,
    },
  }
})
