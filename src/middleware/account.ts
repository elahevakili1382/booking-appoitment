export default defineNuxtRouteMiddleware(async () => {
  try {
    const me = await $fetch<{ user: unknown | null }>('/api/auth/me')
    if (!me.user) return navigateTo('/login')
  } catch {
    return navigateTo('/login')
  }
})
