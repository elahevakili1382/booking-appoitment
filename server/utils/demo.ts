/**
 * نشست نمایشی فقط‌خواندنی (stateless).
 *
 * - با h3 useSession ساخته می‌شود (کوکی رمزنگاری‌شده و امضاشده با iron؛ بدون کد رمزنگاری دست‌ساز).
 * - کوکی جدا: lumina_demo. هرگز lumina_session (نشست واقعی) را نمی‌سازد و کاربری در دیتابیس ایجاد نمی‌کند.
 * - کلید فقط از runtimeConfig خصوصی سمت سرور می‌آید (NUXT_DEMO_SESSION_SECRET، حداقل ۳۲ نویسه). مقدار پیش‌فرض ندارد.
 * - اجازهٔ ورود را سرور مستقل با NUXT_DEMO_ENABLED=true می‌دهد. NUXT_PUBLIC_DEMO فقط نمایش دکمه است.
 * - هر درخواست: امضا/رمزگشایی، انقضا (هم TTL سیل iron، هم exp داخل payload) و purpose=demo بررسی می‌شود.
 * - payload فقط { purpose, exp } است؛ داده‌ی کاربر یا کسب‌وکار داخلش نیست.
 * - اعتبار نشست به دیتابیس یا /tmp وابسته نیست.
 *
 * محدودیت: نشست stateless را نمی‌شود تک‌به‌تک باطل کرد. خاموش‌کردن NUXT_DEMO_ENABLED یا عوض‌کردن کلید،
 * همهٔ کوکی‌های دمو را فوراً بی‌اثر می‌کند؛ بیشینهٔ عمر هر کوکی DEMO_SESSION_HOURS است.
 *
 * هشدار: فقط روی استقراری فعال کنید که دادهٔ ساختگی دارد، چون هر بازدیدکننده دادهٔ داشبورد را می‌بیند.
 */
import { deleteCookie, getCookie, unsealSession, useSession } from 'h3'
import type { H3Event } from 'h3'

export const DEMO_USER_ID = 'demo-viewer'
export const DEMO_COOKIE = 'lumina_demo'
export const DEMO_SESSION_HOURS = 8
const DEMO_PURPOSE = 'demo'
const MIN_SECRET_LENGTH = 32

function demoSettings() {
  const c = useRuntimeConfig()
  return {
    enabled: String(c.demoEnabled) === 'true',
    secret: String(c.demoSessionSecret || ''),
  }
}

/** سرور فقط وقتی اجازهٔ دمو می‌دهد که هم فعال شده باشد و هم کلید قوی داشته باشد. */
export function isDemoEnabled() {
  const s = demoSettings()
  return s.enabled && s.secret.length >= MIN_SECRET_LENGTH
}

function sessionConfig() {
  return {
    password: demoSettings().secret,
    name: DEMO_COOKIE,
    maxAge: DEMO_SESSION_HOURS * 3600,
    sessionHeader: false as const, // فقط کوکی؛ نه هدر x-*-session
    cookie: {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax' as const,
      path: '/',
    },
  }
}

/** ساخت نشست دمو (فقط کوکی را می‌گذارد؛ به دیتابیس دست نمی‌زند). */
export async function startDemoSession(event: H3Event) {
  if (!isDemoEnabled()) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const session = await useSession(event, sessionConfig())
  await session.update({
    purpose: DEMO_PURPOSE,
    exp: Math.floor(Date.now() / 1000) + DEMO_SESSION_HOURS * 3600,
  })
}

/** خروج دمو: فقط کوکی دمو پاک می‌شود. */
export function endDemoSession(event: H3Event) {
  deleteCookie(event, DEMO_COOKIE, {
    path: '/',
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
  })
}

/** true فقط اگر کوکی دمو معتبر، منقضی‌نشده و purpose=demo باشد و دمو روشن باشد. هر خطایی یعنی بی‌اثر. */
export async function hasValidDemoSession(event: H3Event) {
  if (!isDemoEnabled()) return false
  const raw = getCookie(event, DEMO_COOKIE)
  if (!raw) return false
  try {
    const session = await unsealSession(event, sessionConfig(), raw)
    const data = session.data as { purpose?: unknown; exp?: unknown } | undefined
    return data?.purpose === DEMO_PURPOSE && typeof data.exp === 'number' && data.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

/** کاربر ساختگی دمو: نقش receptionist برای خواندن، بدون شماره، بدون ردیف دیتابیس. */
export function demoUser(): Record<string, unknown> {
  return { id: DEMO_USER_ID, name: 'Demo', role: 'receptionist' }
}
