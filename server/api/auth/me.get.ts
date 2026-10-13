import { getSessionUser } from '../../utils/auth'

export default defineEventHandler((event) => {
  const user = getSessionUser(event)
  if (!user) return { ok: true, user: null }
  return {
    ok: true,
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
  }
})
