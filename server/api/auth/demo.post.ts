import { clientIp, rateLimit } from '../../utils/rateLimit'
import { DEMO_USER_ID, startDemoSession } from '../../utils/demo'

/**
 * POST /api/auth/demo — ورود نمایشی فقط‌خواندنی.
 * فقط کوکی lumina_demo را می‌گذارد؛ به دیتابیس و داده‌ی کسب‌وکار دست نمی‌زند.
 * اگر NUXT_DEMO_ENABLED و NUXT_DEMO_SESSION_SECRET (حداقل ۳۲ نویسه) تنظیم نباشند، ۴۰۴ می‌دهد.
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, `demo-login-ip:${clientIp(event)}`, 30, 10 * 60_000)
  await startDemoSession(event)
  return { ok: true, user: { id: DEMO_USER_ID, name: 'Demo', role: 'receptionist', demo: true } }
})
