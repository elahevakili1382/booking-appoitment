import { createHmac, timingSafeEqual } from 'node:crypto'

const DEV_DEFAULT_SECRET = 'lumina-dev-secret-change-me'

/**
 * کلید HMAC برای هش OTP از runtimeConfig.sessionSecret (متغیر محیطی NUXT_SESSION_SECRET).
 * در production با کلید پیش‌فرض یا کوتاه (کمتر از ۳۲ نویسه) خطای کنترل‌شده می‌دهد.
 */
function otpSecret() {
  const secret = String(useRuntimeConfig().sessionSecret || '')
  if (!import.meta.dev && (secret === DEV_DEFAULT_SECRET || secret.length < 32)) {
    throw createError({ statusCode: 503, statusMessage: 'Server misconfigured' })
  }
  return secret
}

/** HMAC-SHA256(secret, "phone:code") — فقط هش در دیتابیس ذخیره می‌شود */
export function hashOtp(phone: string, code: string) {
  return createHmac('sha256', otpSecret()).update(`${phone}:${code}`).digest('hex')
}

export function otpMatches(storedHash: string, phone: string, code: string) {
  const a = Buffer.from(storedHash, 'hex')
  const b = Buffer.from(hashOtp(phone, code), 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}
