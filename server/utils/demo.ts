/**
 * ورود نمایشی (فقط‌خواندنی).
 * فقط وقتی NUXT_PUBLIC_DEMO=true باشد (مثلاً روی Vercel) endpoint ورود نمایشی فعال است.
 * حساب نمایشی هرگز نمی‌تواند چیزی را تغییر دهد: middleware/demo-readonly.ts هر درخواست غیر GET را رد می‌کند،
 * و این بررسی به فعال‌بودن پرچم وابسته نیست (نشست‌های قبلی هم فقط‌خواندنی می‌مانند).
 * هشدار: فقط روی استقراری فعال کنید که دادهٔ نمایشی دارد، چون هر بازدیدکننده دادهٔ داشبورد را می‌بیند.
 */
export const DEMO_USER_ID = 'demo-viewer'
export const DEMO_PHONE = '09000000000'
export const DEMO_SESSION_HOURS = 8

export function isDemoEnabled() {
  return useRuntimeConfig().public.demo === true
}
