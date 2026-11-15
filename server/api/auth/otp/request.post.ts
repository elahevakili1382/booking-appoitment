import { randomInt } from 'node:crypto'
import { getDb } from '../../../db'
import { sendSms, isMockAllowed } from '../../../utils/sms'
import { clientIp, rateLimit } from '../../../utils/rateLimit'
import { hashOtp } from '../../../utils/otp'

const OTP_TTL_MS = 5 * 60_000

/**
 * POST /api/auth/otp/request
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone: string }>(event)
  const phone = String(body?.phone || '').replace(/\D/g, '')
  if (!/^09\d{9}$/.test(phone)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mobile' })
  }

  rateLimit(event, `otp-req-ip:${clientIp(event)}`, 10, 10 * 60_000)
  rateLimit(event, `otp-req-phone:${phone}`, 1, 60_000)

  const code = String(randomInt(100000, 1000000))
  const expires = new Date(Date.now() + OTP_TTL_MS).toISOString()
  const db = getDb()

  // اول ارسال؛ اگر پیامک ممکن نیست، کدی ذخیره نمی‌شود
  await sendSms(phone, `کد ورود لومینا: ${code}`, { required: true })

  // کد به‌صورت هش ذخیره می‌شود (نه متن ساده)
  db.prepare(
    `INSERT INTO otp_codes (phone, code, expires_at, attempts) VALUES (?, ?, ?, 0)
     ON CONFLICT(phone) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at, attempts = 0`,
  ).run(phone, hashOtp(phone, code), expires)

  return {
    ok: true,
    message: 'OTP sent',
    // فقط در توسعه
    ...(isMockAllowed() ? { mockCode: code } : {}),
  }
})
