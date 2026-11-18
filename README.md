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
- **Revenue** – daily revenue chart, breakdown by service and doctor, recent bookings. Only **settled** bookings count as revenue (select an appointment on the calendar and press *Settle*)
- **Booking links** – one shareable `/book?service=<id>` link per active service
- **Operations tools** – send SMS reminders for the next 24 hours, back up the SQLite database
- Glass-style chrome, white canvas, mobile bottom navigation, FA/EN switch

## Viewing the dashboard

The dashboard is protected by a one-time-code login, and no real SMS provider is connected, so **sign-in does not work on the hosted (Vercel) demo**; the public pages do. To explore the dashboard, run it locally (about two minutes):

1. Install **Node.js 22 or newer** and Git.
2. Clone and start the app:

   ```bash
   git clone https://github.com/elahevakili1382/booking-appoitment.git
   cd booking-appoitment
   npm install
   npm run dev
   ```

3. Open <http://127.0.0.1:5173/login>, enter the admin phone `09120000000` and press **دریافت کد** (*Get code*).
4. In development the code is printed on the login page ("کد تست"). Type it and press **ورود** (*Sign in*); you land on `/dashboard`.

The first run creates `data/lumina.sqlite` from `data/store.json` (doctors, services, a few clients and one sample booking). What to try:

- **Calendar** – click an appointment, then *Done*, *Confirm*, *No-show*, *Cancel* or *Settle*.
- **Revenue** – shows `0` until at least one booking is **settled**; settle one on the calendar and watch the KPI cards and charts update.
- **New appointment** (top-left button) – add bookings to fill the charts.
- **Booking links** and **Operations tools** – copy a service link, or run a backup.
- Switch **FA / EN** at the top, and try a phone-sized window for the mobile bottom navigation.

The receptionist account `09121111111` has the same dashboard with fewer admin-only actions. Do not use real patient data; everything here is demo data.

### راهنمای فارسی

داشبورد با کد یک‌بارمصرف وارد می‌شود و پیامک واقعی وصل نیست، پس **روی نسخهٔ آنلاین (Vercel) ورود ممکن نیست**. برای دیدن داشبورد پروژه را روی رایانهٔ خود اجرا کنید: Node.js نسخهٔ ۲۲ یا بالاتر را نصب کنید، سپس `npm install` و `npm run dev` را بزنید و صفحهٔ `/login` را باز کنید. شمارهٔ `09120000000` را وارد کنید، «دریافت کد» را بزنید؛ کد آزمایشی روی همان صفحه نمایش داده می‌شود. بعد از ورود به `/dashboard` می‌روید. درآمد تا وقتی حداقل یک نوبت را از روی تقویم «تسویه» نکنید صفر می‌ماند.

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

- No real SMS provider is implemented, so one-time-code login works only with the development mock (the hosted demo cannot sign in; see *Viewing the dashboard*).
- Payments use a test merchant configuration.
- Data is stored in a local SQLite file, which is not suitable for serverless hosting such as Vercel; use a hosted database or a Node server with a persistent disk.
- API smoke-test scripts are in `scripts/`; there is no CI or unit-test suite yet.
- Service and doctor names inside bookings are stored in Persian and are not translated in the English UI.
