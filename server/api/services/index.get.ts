import { getDb } from '../../db'

export default defineEventHandler(() => {
  const rows = getDb()
    .prepare('SELECT * FROM services WHERE active = 1 ORDER BY category, title_fa')
    .all()
  return {
    ok: true,
    data: (rows as Array<Record<string, unknown>>).map((s) => ({
      id: s.id,
      titleFa: s.title_fa,
      titleEn: s.title_en,
      category: s.category,
      duration: s.duration,
      price: s.price,
      location: s.location,
      color: s.color,
      active: Boolean(s.active),
      descriptionFa: s.description_fa,
      descriptionEn: s.description_en,
    })),
  }
})
