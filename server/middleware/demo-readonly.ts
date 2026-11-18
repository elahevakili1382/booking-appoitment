/**
 * حساب نمایشی فقط‌خواندنی است: هر درخواست تغییردهندهٔ /api برای او با ۴۰۳ رد می‌شود.
 * این بررسی به پرچم NUXT_PUBLIC_DEMO وابسته نیست؛ فقط به شناسهٔ کاربر نشست.
 * استثنا: خروج از حساب، و گرفتن دوبارهٔ نشست نمایشی.
 */
import { getSessionUser } from '../utils/auth'
import { DEMO_USER_ID } from '../utils/demo'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const ALLOWED_WRITES = ['/api/auth/logout', '/api/auth/demo']

export default defineEventHandler((event) => {
  if (SAFE_METHODS.has(event.method)) return
  if (!event.path.startsWith('/api/')) return
  const path = event.path.split('?')[0] ?? event.path
  if (ALLOWED_WRITES.includes(path)) return
  if (!getCookie(event, 'lumina_session')) return

  const user = getSessionUser(event)
  if (user && user.id === DEMO_USER_ID) {
    throw createError({ statusCode: 403, statusMessage: 'Demo is read-only' })
  }
})
