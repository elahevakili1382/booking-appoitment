# Lumina Clinic

سایت و داشبورد مدیریت یک کلینیک پوست و زیبایی، فارسی (راست‌چین) و انگلیسی، با رزرو آنلاین نوبت.

A bilingual (FA/EN, RTL-first) website and admin dashboard for a skin & beauty clinic, with online appointment booking. Built as a portfolio project.

## Features

**Public site**
- Home, services, doctors, gallery, blog, FAQ, contact
- Online booking flow with a Jalali (Persian) date picker
- Mobile-number login with one-time code, and a customer account page

**Admin dashboard** (`/dashboard`, roles: admin / receptionist / staff)
- **Overview** – KPI cards, 7-day appointments chart, today's doctors, appointments table, month calendar, recent activity, CSV export
- **Calendar** – FullCalendar resource day/week/month views, drag-and-drop rescheduling, Persian 24h time labels
- **Clients** – search, tag filter, appointment history per client
- **Services** – category tabs and search
- **Revenue** – daily revenue chart, breakdown by service and doctor, recent bookings
- Glass-style chrome, white canvas, mobile bottom navigation, FA/EN switch

## Stack

Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS v4 · SQLite (`better-sqlite3`) · FullCalendar · Chart.js (`vue-chartjs`) · dayjs + jalaliday · `@nuxt/image`

## Getting started

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build
npm run preview
```

### Development login

There is no password. Sign in at `/login` with a phone number and a one-time code.
In development the SMS provider is mocked and the code is shown on the login page (and logged by the dev server).

Seeded demo accounts (development only):

| Role | Phone |
|---|---|
| Admin | `09120000000` |
| Receptionist | `09121111111` |

### Configuration

Runtime values live in `nuxt.config.ts` and can be overridden with Nuxt environment variables:

- `NUXT_SESSION_SECRET` – **change this in any non-local environment** (a development default is used otherwise)
- `NUXT_DB_PATH` – path of the SQLite file (default `data/lumina.sqlite`, git-ignored)
- `NUXT_PUBLIC_OTP_MOCK` – mock SMS/OTP (enabled outside production)

## Known limitations

- No real SMS provider is implemented, so one-time-code login works only with the development mock.
- Payments use a test merchant configuration.
- Data is stored in a local SQLite file, which is not suitable for serverless hosting such as Vercel; use a hosted database or a Node server with a persistent disk.
- API smoke-test scripts are in `scripts/`; there is no CI or unit-test suite yet.
- Service and doctor names inside bookings are stored in Persian and are not translated in the English UI.
