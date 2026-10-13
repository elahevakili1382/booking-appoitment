import { getDb, newBookingCode, newId, toUtcIso } from '../../db'
import { buildDurationSlots, hasConflict } from '../../utils/bookingEngine'
import { doctorToStaffId } from '../../utils/bookingHelpers'
import { tehranToday } from '../../utils/dates'
import { sendSms } from '../../utils/sms'

/**
 * POST /api/bookings — ایجاد نوبت با قفل تداخل (409)
 */
export default defineEventHandler(async (event) => {
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

  let staffId = body.staffId && body.staffId !== 'any' ? body.staffId : undefined
  if (!staffId && body.doctor) staffId = doctorToStaffId(body.doctor)

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
  } else {
    db.prepare(`UPDATE customers SET name = ?, last_visit = ? WHERE id = ?`).run(body.name, date, customer.id)
  }

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
      body.total ?? service.price,
      body.deposit || 0,
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
      total: body.total ?? service.price,
      status: 'confirmed',
      createdAt,
    },
  }
})
