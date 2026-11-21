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

### On the hosted demo (one click, read-only)

The dashboard is protected by a one-time-code login and no real SMS provider is connected. So the hosted demo has a **demo mode**: open `/login` and press **مشاهدهٔ نمایشی داشبورد** (*View the dashboard, demo*). You are signed in without a phone number or code, as a **read-only** user. A banner says so, every write button is hidden or disabled, and the server rejects any change with `403`. The data is fake sample data.

Demo mode is **off by default** and needs three environment variables (for example in Vercel → Settings → Environment Variables), then a redeploy:

| Variable | Value | Purpose |
|---|---|---|
| `NUXT_DEMO_ENABLED` | `true` | Server-side switch. The server decides on its own whether demo sign-in is allowed. |
| `NUXT_DEMO_SESSION_SECRET` | a random string of **at least 32 characters** (mark it *Sensitive*) | Key that seals the demo cookie. There is no default: without it, demo sign-in stays closed. |
| `NUXT_PUBLIC_DEMO` | `true` | Only shows the demo button in the UI. It does not grant access by itself. |

Create the secret locally and paste it into Vercel (do not commit it):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

How it works and its limits:

- The demo session is a separate sealed, `HttpOnly` cookie (`lumina_demo`, 8 hours, purpose `demo`) created with h3's session helpers. It never creates a real session or a database user, and its validity does not depend on the database.
- The server rejects every write for a demo session (bookings, status, settings, SMS, payments, admin tools), and allows only a short list of read endpoints.
- A stateless session cannot be revoked one by one. To end all demo sessions at once, turn `NUXT_DEMO_ENABLED` off or change the secret.
- Only enable it on a deployment that holds demo data, because every visitor can read the dashboard.

To re-run the security tests locally (stop `npm run dev` first):

```bash
npm run build
node scripts/run-demo-tests.mjs
```

The tests run on local servers only; they do not prove how a deployment behaves behind a CDN or across serverless instances.

### Run it locally (admin, can edit)

To use the dashboard with full admin rights, run it locally (about two minutes):

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

**نسخهٔ آنلاین:** در صفحهٔ `/login` دکمهٔ «مشاهدهٔ نمایشی داشبورد» را بزنید. بدون شماره و کد، فقط برای مشاهده وارد می‌شوید؛ دادهٔ ساختگی است و هیچ‌چیز را نمی‌شود تغییر داد (سرور هر تغییر را با ۴۰۳ رد می‌کند). این حالت به‌صورت پیش‌فرض خاموش است و فقط با سه متغیر `NUXT_DEMO_ENABLED=true`، `NUXT_DEMO_SESSION_SECRET` (حداقل ۳۲ نویسه) و `NUXT_PUBLIC_DEMO=true` روشن می‌شود؛ بدون secret ورود دمو بسته می‌ماند.

**اجرای لوکال با دسترسی کامل:** Node.js نسخهٔ ۲۲ یا بالاتر را نصب کنید، `npm install` و `npm run dev` را بزنید و صفحهٔ `/login` را باز کنید. شمارهٔ `09120000000` را وارد کنید، «دریافت کد» را بزنید؛ کد آزمایشی روی همان صفحه نمایش داده می‌شود. بعد از ورود به `/dashboard` می‌روید. درآمد تا وقتی حداقل یک نوبت را از روی تقویم «تسویه» نکنید صفر می‌ماند.

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
- `NUXT_DEMO_ENABLED` – set to `true` to allow the read-only demo sign-in (server-side, default off)
- `NUXT_DEMO_SESSION_SECRET` – secret of at least 32 characters that seals the demo cookie (no default; demo stays closed without it)
- `NUXT_PUBLIC_DEMO` – set to `true` to show the demo button in the UI only (access is decided by the two variables above)

## Known limitations

- No real SMS provider is implemented, so one-time-code login works only with the development mock (the hosted demo uses the read-only demo login instead; see *Viewing the dashboard*).
- Payments use a test merchant configuration.
- Data is stored in a local SQLite file, which is not suitable for serverless hosting such as Vercel; use a hosted database or a Node server with a persistent disk.
- API smoke-test scripts are in `scripts/`; there is no CI or unit-test suite yet.
- Service and doctor names inside bookings are stored in Persian and are not translated in the English UI.
