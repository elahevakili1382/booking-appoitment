import { getSessionUser } from '../../utils/auth'
import { DEMO_USER_ID } from '../../utils/demo'

export default defineEventHandler((event) => {
  const user = getSessionUser(event)
  if (!user) return { ok: true, user: null }
  return {
    ok: true,
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
    demo: user.id === DEMO_USER_ID,
  }
})
