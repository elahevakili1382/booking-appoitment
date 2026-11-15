/**
 * هدایت صفحه‌ی داشبورد — فقط admin / receptionist / staff.
 * محافظت اصلی داده‌ها سمت سرور است (requireUser در APIها)؛ این middleware فقط تجربه‌ی کاربر را درست می‌کند.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return

  const me = await $fetch<{ user: { role: string } | null }>('/api/auth/me').catch(() => ({ user: null }))

  if (!me.user) return navigateTo('/login')
  if (!['admin', 'receptionist', 'staff'].includes(me.user.role)) return navigateTo('/')
})
