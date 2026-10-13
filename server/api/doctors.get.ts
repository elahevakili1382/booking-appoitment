import { getDb } from '../db'

export default defineEventHandler(() => {
  const rows = getDb().prepare('SELECT * FROM staff WHERE active = 1').all()
  return {
    ok: true,
    data: (rows as Array<Record<string, unknown>>).map((d) => ({
      id: d.id,
      nameFa: d.name_fa,
      nameEn: d.name_en,
      roleFa: d.role_fa,
      roleEn: d.role_en,
      active: Boolean(d.active),
    })),
  }
})
