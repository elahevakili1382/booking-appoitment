/**
 * محافظت CSRF برای درخواست‌های تغییردهنده‌ی /api (POST/PUT/PATCH/DELETE) که با کوکی نشست کار می‌کنند.
 * علاوه بر SameSite=Lax:
 * - Sec-Fetch-Site باید same-origin یا none باشد (cross-site و same-site رد می‌شوند)
 * - اگر Origin ارسال شده باشد، میزبانش باید با میزبان درخواست یکی باشد
 * کلاینت‌های غیرمرورگری (بدون این هدرها) رد نمی‌شوند؛ آن‌ها کوکی مرورگر ندارند.
 * پشت proxy، میزبان فقط با LUMINA_TRUST_PROXY=1 از X-Forwarded-Host خوانده می‌شود.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler((event) => {
  if (SAFE_METHODS.has(event.method)) return
  if (!event.path.startsWith('/api/')) return

  const site = getRequestHeader(event, 'sec-fetch-site')
  if (site && site !== 'same-origin' && site !== 'none') {
    throw createError({ statusCode: 403, statusMessage: 'Cross-site request blocked' })
  }

  const origin = getRequestHeader(event, 'origin')
  if (origin) {
    const trustProxy = process.env.LUMINA_TRUST_PROXY === '1'
    const host = getRequestHost(event, { xForwardedHost: trustProxy })
    let originHost = ''
    try {
      originHost = new URL(origin).host
    } catch {
      /* Origin نامعتبر */
    }
    if (!originHost || originHost !== host) {
      throw createError({ statusCode: 403, statusMessage: 'Cross-site request blocked' })
    }
  }
})
