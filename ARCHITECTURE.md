# Lumina Clinic — Nuxt 3 + Nitro + SQLite

## Stack
| لایه | تکنولوژی |
|------|----------|
| UI | Vue 3 + Nuxt 3 (SPA) |
| استایل | Tailwind CSS |
| API | Nitro `server/api` |
| DB | SQLite (`data/lumina.sqlite`) via better-sqlite3 |
| تاریخ | میلادی UTC در DB — نمایش شمسی با dayjs + jalaliday |
| تقویم داشبورد | FullCalendar resource timeline |
| پرداخت | آداپتر زرین‌پال sandbox |
| پیامک | آداپتر mock / کاوه‌نگار |

## جریان داده
```
Browser → $fetch('/api/...') → Nitro handler → server/db (SQLite)
```

## قرارداد تاریخ
- ذخیره: `starts_at` / `ends_at` به صورت ISO UTC
- ورودی فرم‌ها: تاریخ میلادی `YYYY-MM-DD` (از date picker شمسی تبدیل شود)
- نمایش: `toJalali()` در کلاینت/سرور

## نقش‌ها
`admin` | `receptionist` | `staff` | `customer` — session cookie `lumina_session`

## موتور نوبت
`server/utils/bookingEngine.ts` — اسلات بر اساس مدت خدمت + شیفت؛ تداخل → HTTP 409

## Seed
اولین اجرا از `data/store.json` به SQLite seed می‌شود.
