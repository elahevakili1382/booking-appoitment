import { getDb, newId } from '../../../db'
import { clientIp, rateLimit } from '../../../utils/rateLimit'
import { otpMatches } from '../../../utils/otp'

/**
 * POST /api/auth/otp/verify
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone: string; code: string; name?: string }>(event)
  const phone = String(body?.phone || '').replace(/\D/g, '')
  const code = String(body?.code || '')
  const db = getDb()

  rateLimit(event, `otp-verify-ip:${clientIp(event)}`, 30, 10 * 60_000)

  const otp = db.prepare('SELECT * FROM otp_codes WHERE phone = ?').get(phone) as
    | { code: string; expires_at: string; attempts: number }
    | undefined
  if (!otp) throw createError({ statusCode: 400, statusMessage: 'OTP not found' })
  if (otp.attempts >= 5) {
    // بعد از ۵ تلاش اشتباه کد باطل می‌شود و باید کد جدید گرفت
    db.prepare('DELETE FROM otp_codes WHERE phone = ?').run(phone)
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts' })
  }
  if (new Date(otp.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM otp_codes WHERE phone = ?').run(phone)
    throw createError({ statusCode: 400, statusMessage: 'OTP expired' })
  }
  if (!otpMatches(otp.code, phone, code)) {
    db.prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE phone = ?').run(phone)
    throw createError({ statusCode: 400, statusMessage: 'Invalid OTP' })
  }

  db.prepare('DELETE FROM otp_codes WHERE phone = ?').run(phone)

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as Record<string, unknown> | undefined
  if (!user) {
    const id = newId()
    db.prepare(`INSERT INTO users (id, phone, name, role, created_at) VALUES (?, ?, ?, 'customer', ?)`).run(
      id,
      phone,
      body.name || '',
      new Date().toISOString(),
    )
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown>
  } else if (body.name) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(body.name, user.id)
    user.name = body.name
  }

  // link customer
  const customer = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone) as { id: string } | undefined
  if (!customer) {
    db.prepare(
      `INSERT INTO customers (id, user_id, name, phone, file_no, last_visit, tag, notes, allergy, created_at)
       VALUES (?, ?, ?, ?, ?, ?, '', '', '', ?)`,
    ).run(newId(), user.id, user.name || body.name || 'مشتری', phone, `LM-U`, null, new Date().toISOString())
  } else {
    db.prepare('UPDATE customers SET user_id = ? WHERE id = ?').run(user.id, customer.id)
  }

  const token = newId()
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600_000).toISOString()
  db.prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`).run(token, user.id, expiresAt)

  setCookie(event, 'lumina_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: 7 * 24 * 3600,
  })

  return {
    ok: true,
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
  }
})
