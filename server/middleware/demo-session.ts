/**
 * نشست نمایشی: تأیید کوکی دمو و اعمال محدودیت فقط‌خواندنی در سرور.
 *
 * - فقط روی /api/* کار می‌کند و فقط وقتی کوکی lumina_demo معتبر باشد (امضا، انقضا، purpose=demo، دمو روشن).
 *   در غیر این صورت کوکی بی‌اثر است و درخواست مثل قبل پردازش می‌شود.
 * - اگر کاربر واقعی هم با lumina_session وارد شده باشد، کاربر واقعی برنده است و هیچ محدودیت دمویی اعمال نمی‌شود.
 * - برای نشست دمو:
 *   • هر درخواست غیر GET/HEAD/OPTIONS رد می‌شود (رزرو، تغییر وضعیت، حذف، تنظیمات، آپلود، پیامک، پرداخت، مدیریت)،
 *     به‌جز ورود و خروج دمو که فقط کوکی را تنظیم/پاک می‌کنند.
 *   • GET فقط برای مسیرهای فهرست‌شده مجاز است. هر GET دیگر (مثل /api/payments/verify که در دیتابیس می‌نویسد)
 *     رد می‌شود. این یک allow-list است، نه deny-list.
 */
import { getCookie } from 'h3'
import { getSessionUser } from '../utils/auth'
import { DEMO_COOKIE, DEMO_USER_ID, demoUser, hasValidDemoSession } from '../utils/demo'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const ALLOWED_WRITES = ['/api/auth/demo', '/api/auth/logout']
const ALLOWED_READS = [
  '/api/auth/me',
  '/api/dashboard',
  '/api/customers',
  '/api/bookings',
  '/api/reports/revenue',
  '/api/services',
  '/api/doctors',
  '/api/availability',
  '/api/blog',
  '/api/_nuxt_icon', // آیکون‌های رابط
]

const matches = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(`${p}/`))

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0] ?? event.path
  if (!path.startsWith('/api/')) return
  if (!getCookie(event, DEMO_COOKIE)) return
  if (!(await hasValidDemoSession(event))) return

  event.context.demoUser = demoUser()

  // کاربر واقعی همیشه برنده است؛ محدودیت فقط وقتی اعمال می‌شود که درخواست در نقش دمو انجام شود.
  const acting = getSessionUser(event)
  if (!acting || acting.id !== DEMO_USER_ID) return

  if (SAFE_METHODS.has(event.method)) {
    if (!matches(path, ALLOWED_READS)) {
      throw createError({ statusCode: 403, statusMessage: 'Not available in the demo' })
    }
    return
  }
  if (matches(path, ALLOWED_WRITES)) return
  throw createError({ statusCode: 403, statusMessage: 'Demo is read-only' })
})
