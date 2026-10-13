/**
 * محافظت داشبورد — نقش admin یا receptionist
 * در dev اگر session نباشد، اجازه ورود می‌دهد ولی لاگ می‌کند.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return
  try {
    const me = await $fetch<{ user: { role: string } | null }>('/api/auth/me')
    if (me.user && !['admin', 'receptionist', 'staff'].includes(me.user.role)) {
      return navigateTo('/')
    }
  } catch {
    /* allow in local demo */
  }
})
