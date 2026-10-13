import { getDb, newId } from '../../../db'
import { sendSms } from '../../../utils/sms'

const OTP_TTL_MS = 5 * 60_000
const RATE_WINDOW_MS = 60_000
const rateMap = new Map<string, number>()

/**
 * POST /api/auth/otp/request
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone: string }>(event)
  const phone = String(body?.phone || '').replace(/\D/g, '')
  if (!/^09\d{9}$/.test(phone)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mobile' })
  }

  const now = Date.now()
  const last = rateMap.get(phone) || 0
  if (now - last < RATE_WINDOW_MS) {
    throw createError({ statusCode: 429, statusMessage: 'Too many OTP requests' })
  }
  rateMap.set(phone, now)

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expires = new Date(now + OTP_TTL_MS).toISOString()
  const db = getDb()
  db.prepare(
    `INSERT INTO otp_codes (phone, code, expires_at, attempts) VALUES (?, ?, ?, 0)
     ON CONFLICT(phone) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at, attempts = 0`,
  ).run(phone, code, expires)

  // ensure user exists
  let user = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone) as { id: string } | undefined
  if (!user) {
    const id = newId()
    db.prepare(`INSERT INTO users (id, phone, name, role, created_at) VALUES (?, ?, ?, 'customer', ?)`).run(
      id,
      phone,
      '',
      new Date().toISOString(),
    )
    user = { id }
  }

  await sendSms(phone, `کد ورود لومینا: ${code}`)
  const config = useRuntimeConfig()
  return {
    ok: true,
    message: 'OTP sent',
    ...(config.public.otpMock ? { mockCode: code } : {}),
  }
})
