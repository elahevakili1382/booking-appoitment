/**
 * SMS adapter.
 * mock فقط در محیط توسعه مجاز است. در production اگر ارائه‌دهنده‌ی واقعی پیاده‌سازی نشده باشد:
 * - پیام‌های ضروری (مثل OTP) خطای کنترل‌شده 503 می‌دهند؛
 * - پیام‌های اطلاع‌رسانی ارسال نمی‌شوند و عملیات اصلی نمی‌شکند.
 * متن پیام (که ممکن است کد OTP باشد) هرگز در لاگ production نوشته نمی‌شود.
 */
export function isMockAllowed() {
  const config = useRuntimeConfig()
  return import.meta.dev && config.public.otpMock === true
}

export async function sendSms(phone: string, message: string, opts: { required?: boolean } = {}) {
  if (isMockAllowed()) {
    console.info(`[sms:mock] to=${phone} msg=${message}`)
    return { ok: true, provider: 'mock' }
  }

  // ارائه‌دهنده‌ی واقعی هنوز پیاده‌سازی نشده است.
  console.warn('[sms] real provider not configured; message not sent')
  if (opts.required) {
    throw createError({ statusCode: 503, statusMessage: 'SMS service unavailable' })
  }
  return { ok: false, provider: 'none' }
}
