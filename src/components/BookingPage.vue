<script setup lang="ts">
import { motion } from 'motion-v'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useLanguage } from '../i18n/useLanguage'
import { assets } from '../data/assets'

const { t, locale } = useLanguage()
const reduce = usePreferredReducedMotion()
const route = useRoute()

// ───────── State ─────────
const step = ref(1)
const branch = ref('')
const service = ref('')
const serviceId = ref('consult')
const servicePrice = ref(0)  // ✅ قیمت سرویس انتخابی
const doctor = ref('')
const staffId = ref<'any' | string>('any')
const visitType = ref<'clinic' | 'online'>('clinic')
const selectedDate = ref(0)
const weekOffset = ref(0)
const selectedTime = ref('')
const selectedStartsAt = ref('')
const showAllSlots = ref(false)
const addons = ref<string[]>(['gold'])
const name = ref('')
const phone = ref('')
const notes = ref('')
const confirmed = ref(false)
const bookingCode = ref('')
const bookingId = ref('')
const payUrl = ref('')
const showCalendar = ref(false)

function selectDateFromCalendar(iso: string) {
  const a = new Date(`${isoDateOffset(0)}T12:00:00`)
  const b = new Date(`${iso}T12:00:00`)
  const diffDays = Math.round((b.getTime() - a.getTime()) / 86_400_000)
  if (diffDays >= 0) {
    weekOffset.value = Math.floor(diffDays / 7)
    selectedDate.value = diffDays % 7
  }
  showCalendar.value = false
}

function onDatePick(day: any) {
  // در v-calendar نسخه ۳، ورودی یک آبجکت است که خاصیت .date دارد
  const pickedDate = day.date
  const today = new Date(isoDateOffset(0))

  // اختلاف روزها
  const diffDays = Math.floor((pickedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays >= 0) {
    weekOffset.value = Math.floor(diffDays / 7)
    selectedDate.value = diffDays % 7
  }
  showCalendar.value = false
}

// ───────── API Data ─────────
const { data: servicesApi } = useAsyncData('book-services', () =>
  $fetch<{ ok: boolean; data: Array<{ id: string; titleFa: string; titleEn: string; duration: number; price: number }> }>(
    '/api/services',
  ),
)

const { data: doctorsApi } = useAsyncData('book-doctors', () =>
  $fetch<{ ok: boolean; data: Array<{ id: string; nameFa: string; nameEn: string }> }>('/api/doctors'),
)

// ───────── Watchers ─────────
watch(
  () => t.value.branches,
  (branches) => {
    if (!branch.value) branch.value = (route.query.branch as string) || branches[0]
  },
  { immediate: true },
)

watch(
  servicesApi,
  (res) => {
    const list = res?.data || []
    if (!list.length) return
    const q = route.query.service as string | undefined
    const match = q
      ? list.find((s) => s.id === q || s.titleFa.includes(q) || s.titleEn.toLowerCase().includes(q.toLowerCase()))
      : list[0]
    if (match) {
      serviceId.value = match.id
      service.value = locale.value === 'fa' ? match.titleFa : match.titleEn
      servicePrice.value = match.price
    }
  },
  { immediate: true },
)

watch(
  doctorsApi,
  (res) => {
    const list = res?.data || []
    if (!doctor.value && list[0]) {
      doctor.value = locale.value === 'fa' ? list[0].nameFa : list[0].nameEn
      staffId.value = 'any'
    }
  },
  { immediate: true },
)

// ✅ تابع انتخاب سرویس (با ID و قیمت)
function selectService(id: string, title: string, price: number) {
  serviceId.value = id
  service.value = title
  servicePrice.value = price
}

// ───────── Dates & Time ─────────
function isoDateOffset(daysAhead: number) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + daysAhead)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dayNumLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  if (locale.value === 'fa') {
    return d.toLocaleDateString('fa-IR', { day: 'numeric' })
  }
  return String(d.getDate())
}

function tehranNowMinutes() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const hh = Number(parts.find((p) => p.type === 'hour')?.value || 0)
  const mm = Number(parts.find((p) => p.type === 'minute')?.value || 0)
  return hh * 60 + mm
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

const clockTick = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  tickTimer = setInterval(() => {
    clockTick.value = Date.now()
  }, 30_000)
})
onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer)
})

const dates = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const iso = isoDateOffset(weekOffset.value * 7 + i)
    const d = new Date(`${iso}T12:00:00`)
    const num = dayNumLabel(iso)
    let day: string
    if (weekOffset.value === 0 && i === 0) day = t.value.bookToday
    else if (weekOffset.value === 0 && i === 1) day = t.value.bookTomorrow
    else if (locale.value === 'fa') {
      const names = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
      day = names[d.getDay()] ?? ''
    } else {
      day = d.toLocaleDateString('en-US', { weekday: 'short' })
    }
    return { day, num, iso }
  }),
)

const monthLabel = computed(() => {
  const iso = dates.value[selectedDate.value]?.iso || dates.value[0]?.iso || isoDateOffset(0)
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
  })
})

function shiftWeek(delta: number) {
  weekOffset.value = Math.max(0, weekOffset.value + delta)
  selectedDate.value = 0
}

const selectedIso = computed(() => dates.value[selectedDate.value]?.iso ?? isoDateOffset(0))

// ✅ اصلاح: با clockTick همگام می‌شود
const isSelectedToday = computed(() => {
  void clockTick.value
  return selectedIso.value === isoDateOffset(0)
})

const { data: slotsRes, refresh: refreshSlots } = useAsyncData(
  () => `book-slots-${selectedIso.value}-${serviceId.value}-${staffId.value}`,
  () =>
    $fetch<{
      ok: boolean
      slots: { time: string; taken: boolean; startsAt?: string; staffId?: string }[]
    }>(`/api/availability?date=${selectedIso.value}&serviceId=${serviceId.value}&staffId=${staffId.value}`),
  { watch: [selectedIso, serviceId, staffId] },
)

const allSlots = computed(() => {
  void clockTick.value
  const raw = slotsRes.value?.slots ?? []
  if (!isSelectedToday.value) return raw
  const nowM = tehranNowMinutes()
  return raw.filter((s) => timeToMinutes(s.time) > nowM + 5)
})

const visibleSlots = computed(() => (showAllSlots.value ? allSlots.value : allSlots.value.slice(0, 12)))
const availableCount = computed(() => allSlots.value.filter((s) => !s.taken).length)

watch(
  allSlots,
  (slots) => {
    const hit = slots.find((s) => s.time === selectedTime.value && !s.taken)
    if (!hit) {
      const first = slots.find((s) => !s.taken)
      selectedTime.value = first?.time ?? ''
      selectedStartsAt.value = first?.startsAt ?? ''
    } else {
      selectedStartsAt.value = hit.startsAt ?? ''
    }
  },
  { immediate: true },
)

function pickSlot(slot: { time: string; taken: boolean; startsAt?: string }) {
  if (slot.taken) return
  if (isSelectedToday.value && timeToMinutes(slot.time) <= tehranNowMinutes() + 5) return
  selectedTime.value = slot.time
  selectedStartsAt.value = slot.startsAt ?? ''
}

watch(selectedDate, () => {
  showAllSlots.value = false
})

// ───────── Addons & Prices ─────────
const addonOptions = computed(() =>
  locale.value === 'fa'
    ? [
      { id: 'gold', title: 'ماسک طلا ۲۴ عیار و آبرسانی عمیق', desc: '۱۵ دقیقه زمان مازاد', price: 450000 },
      { id: 'numb', title: 'بیحسی موضعی لیدوکائین', desc: 'کاهش حساسیت حین درمان', price: 150000 },
      { id: 'serum', title: 'پک سرم هیالورونیک خانگی', desc: 'مراقبت تکمیلی پس از درمان', price: 380000 },
    ]
    : [
      { id: 'gold', title: '24K gold mask & deep hydration', desc: '+15 minutes', price: 450000 },
      { id: 'numb', title: 'Lidocaine topical numbing', desc: 'Max comfort during treatment', price: 150000 },
      { id: 'serum', title: 'Home HA serum pack', desc: 'Aftercare kit', price: 380000 },
    ],
)

const deposit = 500000
const addonTotal = computed(() =>
  addonOptions.value.filter((a) => addons.value.includes(a.id)).reduce((s, a) => s + a.price, 0),
)

// ✅ قیمت کل شامل سرویس + بیعانه + افزودنی‌ها
const total = computed(() => servicePrice.value + deposit + addonTotal.value)

function slotEnd(time: string) {
  const [h, m] = time.split(':').map(Number)
  const endM = (m || 0) + 15
  const eh = (h || 0) + Math.floor(endM / 60)
  const em = endM % 60
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`
}

const selectedDateLabel = computed(() => {
  const d = dates.value[selectedDate.value]
  if (!d || !selectedTime.value) return ''
  const pretty = new Date(`${d.iso}T12:00:00`).toLocaleDateString(
    locale.value === 'fa' ? 'fa-IR' : 'en-US',
    { weekday: 'long', month: 'short', day: 'numeric' },
  )
  return `${pretty} — ${selectedTime.value}`
})

const selectedBanner = computed(() => {
  const d = dates.value[selectedDate.value]
  if (!d || !selectedTime.value) return ''
  return `${selectedDateLabel.value} ${t.value.bookSlotEnd} ${slotEnd(selectedTime.value)}`
})

const canNext = computed(() => {
  if (step.value === 1) return Boolean(service.value && doctor.value)
  if (step.value === 2) return name.value.trim().length >= 2 && phone.value.trim().length >= 8
  if (step.value === 3) return Boolean(branch.value && visitType.value)
  if (step.value === 4) return Boolean(selectedTime.value)
  if (step.value === 5) return true
  return false
})

const canConfirm = computed(() => name.value.trim().length >= 2 && phone.value.trim().length >= 8)

function toggleAddon(id: string) {
  if (addons.value.includes(id)) addons.value = addons.value.filter((x) => x !== id)
  else addons.value = [...addons.value, id]
}

function formatPrice(n: number) {
  return n.toLocaleString(locale.value === 'fa' ? 'fa-IR' : 'en-US')
}

function next() {
  if (step.value < 5 && canNext.value) step.value += 1
  else if (step.value === 5) step.value = 6
}

function back() {
  if (step.value > 1) step.value -= 1
}

function goStep(n: number) {
  if (n < step.value) step.value = n
}

async function confirmBooking() {
  if (!canConfirm.value) return
  try {
    const res = await $fetch<{ ok: boolean; data: { code: string; id: string } }>('/api/bookings', {
      method: 'POST',
      body: {
        branch: branch.value,
        service: service.value,
        serviceId: serviceId.value,
        doctor: doctor.value,
        staffId: staffId.value,
        visitType: visitType.value,
        when: `${selectedIso.value}T${selectedTime.value}:00+03:30`, // ✅ ISO format
        date: selectedIso.value,
        time: selectedTime.value,
        startsAt: selectedStartsAt.value || undefined,
        name: name.value,
        phone: phone.value,
        notes: notes.value,
        total: total.value,
        deposit: deposit,
      },
    })
    bookingCode.value = res.data.code
    bookingId.value = res.data.id
    try {
      const pay = await $fetch<{ ok: boolean; redirectUrl: string }>('/api/payments/deposit', {
        method: 'POST',
        body: { bookingId: res.data.id, amount: deposit },
      })
      payUrl.value = pay.redirectUrl
    } catch {
      /* optional deposit */
    }
    localStorage.setItem(
      'lumina-last-booking',
      JSON.stringify({
        code: bookingCode.value,
        branch: branch.value,
        service: service.value,
        doctor: doctor.value,
        visitType: visitType.value,
        when: selectedDateLabel.value,
        date: selectedIso.value,
        time: selectedTime.value,
        name: name.value,
        phone: phone.value,
        notes: notes.value,
        total: total.value,
        at: new Date().toISOString(),
      }),
    )
    confirmed.value = true
    step.value = 6
  } catch (e: unknown) {
    const err = e as { statusCode?: number; data?: { statusMessage?: string } }
    if (err?.statusCode === 409) {
      window.alert(locale.value === 'fa' ? 'این ساعت قبلاً رزرو شده است.' : 'This slot was just taken.')
      await refreshSlots()
      return
    }
    throw e
  }
}

function goHome() {
  navigateTo('/')
}

function stepStatus(n: number): 'done' | 'active' | 'todo' {
  if (confirmed.value && n <= 6) return n === 6 ? 'active' : 'done'
  if (n < step.value) return 'done'
  if (n === step.value) 'active'
  return 'todo'
}
</script>

<template>
  <div class="relative min-h-dvh w-full overflow-x-clip px-3 py-4 sm:px-6 sm:py-8 lg:px-8 lg:py-10" style="
      background:
        radial-gradient(ellipse 80% 60% at 10% 20%, rgba(255, 177, 188, 0.35), transparent 55%),
        radial-gradient(ellipse 70% 50% at 90% 80%, rgba(253, 187, 197, 0.28), transparent 50%),
        linear-gradient(160deg, #fefae0 0%, #e9edc9 42%, #faedcd 100%);
    ">
    <div class="pointer-events-none absolute -inset-s-20 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
    <div
      class="pointer-events-none absolute -inset-e-16 bottom-20 h-72 w-72 rounded-full bg-secondary-fixed/40 blur-3xl" />

    <motion.div
      class="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-surface-container-lowest shadow-[0_30px_80px_-28px_rgba(138,72,83,0.35)] sm:rounded-4xl lg:min-h-144 lg:flex-row"
      :initial="reduce ? false : { opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.45 }">
      <!-- Sidebar stepper -->
      <aside
        class="relative flex w-full shrink-0 flex-col border-b border-outline-variant/20 lg:w-62 lg:border-b-0 lg:border-e"
        style="background: linear-gradient(180deg, #faedcd 0%, #e9edc9 55%, #e9edc9 100%)">
        <div class="flex items-center gap-2.5 px-5 pt-5 pb-4 sm:px-6">
          <NuxtImg :src="assets.logo" alt="" class="h-8 w-auto object-contain" format="webp" loading="lazy" />
          <div class="min-w-0">
            <p class="font-latin text-[15px] font-semibold leading-none text-primary">Lumina</p>
            <p class="mt-0.5 font-latin text-[9px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
              Clinic
            </p>
          </div>
        </div>

        <!-- Mobile horizontal steps -->
        <div class="flex gap-1 overflow-x-auto px-4 pb-4 scrollbar-none lg:hidden">
          <button v-for="(label, i) in t.bookSteps" :key="label" type="button"
            class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold"
            :class="{
              'bg-primary text-on-primary': stepStatus(i + 1) === 'active',
              'bg-white/80 text-primary': stepStatus(i + 1) === 'done',
              'bg-white/40 text-on-surface-variant': stepStatus(i + 1) === 'todo',
            }" @click="goStep(i + 1)">
            <Icon v-if="stepStatus(i + 1) === 'done'" name="ph:check" class="w-4 h-4" />
            <span v-else class="font-latin text-[10px]">{{ i + 1 }}</span>
            {{ label }}
          </button>
        </div>

        <!-- Desktop vertical steps -->
        <nav class="hidden flex-1 flex-col gap-1 px-4 pb-4 lg:flex" aria-label="Booking steps">
          <button v-for="(label, i) in t.bookSteps" :key="label" type="button"
            class="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-start transition-colors"
            :class="stepStatus(i + 1) === 'todo' ? 'opacity-55' : 'hover:bg-white/50'" @click="goStep(i + 1)">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold" :class="{
              'bg-primary text-on-primary shadow-sm': stepStatus(i + 1) === 'active',
              'bg-primary/15 text-primary': stepStatus(i + 1) === 'done',
              'bg-white/70 text-on-surface-variant': stepStatus(i + 1) === 'todo',
            }">
              <Icon v-if="stepStatus(i + 1) === 'done'" name="ph:check" class="w-4 h-4" />
              <span v-else class="font-latin text-[10px]">{{ i + 1 }}</span>
            </span>
            <span class="text-[13px]"
              :class="stepStatus(i + 1) === 'active' ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'">
              {{ label }}
            </span>
          </button>
        </nav>

        <div class="mt-auto hidden border-t border-outline-variant/20 px-5 py-4 lg:block">
          <p class="text-[11px] text-on-surface-variant">{{ t.bookNeedHelp }}</p>
          <a href="tel:+982122000000"
            class="mt-1 inline-flex cursor-pointer items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            {{ t.bookHelpLink }}
            <Icon name="ph:phone" />
          </a>
        </div>
      </aside>

      <!-- Main panel -->
      <div class="flex min-w-0 flex-1 flex-col bg-white">
        <!-- Success -->
        <div v-if="confirmed" class="flex flex-1 flex-col items-center justify-center p-6 text-center sm:p-10">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="ph:check-circle" />
          </div>
          <h2 class="text-[22px] font-bold text-on-surface sm:text-[26px]">{{ t.bookSuccessTitle }}</h2>
          <p class="mt-2 max-w-md text-[14px] text-on-surface-variant">{{ t.bookSuccessDesc }}</p>
          <p class="mt-4 font-latin text-[14px] font-bold tracking-wider text-primary">{{ bookingCode }}</p>
          <div
            class="mt-6 w-full max-w-md rounded-2xl bg-surface-container-low p-4 text-start text-[13px] text-on-surface-variant">
            <p><strong class="text-on-surface">{{ t.bookingService }}:</strong> {{ service }}</p>
            <p class="mt-1"><strong class="text-on-surface">{{ t.bookDoctorLabel }}:</strong> {{ doctor }}</p>
            <p class="mt-1"><strong class="text-on-surface">{{ t.bookWhen }}:</strong> {{ selectedDateLabel }}</p>
            <p class="mt-1"><strong class="text-on-surface">{{ t.bookDeposit }}:</strong> {{ formatPrice(total) }} {{
              t.toman }}</p>
          </div>
          <div class="mt-6 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <button type="button"
              class="min-h-12 flex-1 cursor-pointer rounded-full bg-primary text-[14px] font-bold text-on-primary"
              @click="goHome">
              {{ t.bookBackHome }}
            </button>
            <RouterLink to="/dashboard"
              class="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-full border border-outline-variant/40 text-[14px] font-semibold text-on-surface">
              {{ t.dashEntry }}
            </RouterLink>
          </div>
        </div>

        <template v-else>
          <div class="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">

            <div v-if="step === 1" class="flex flex-1 flex-col">
              <h2 class="text-[20px] font-bold text-on-surface sm:text-[24px]">{{ t.bookStepTitles[0] }}</h2>
              <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.bookServicePick }}</p>
              <div class="mt-5 grid flex-1 gap-2 sm:grid-cols-2">
                <!-- ✅ اصلاح: استفاده از srv به جای opt و selectService -->
                <button v-for="(srv, i) in servicesApi?.data || []" :key="srv.id" type="button"
                  class="overflow-hidden rounded-2xl border text-start transition-all cursor-pointer" :class="serviceId === srv.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                    : 'border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low'"
                  @click="selectService(srv.id, locale === 'fa' ? srv.titleFa : srv.titleEn, srv.price)">
                  <NuxtImg :src="assets.services[i % assets.services.length]" alt=""
                    class="aspect-ratio w-full object-cover object-center bg-surface-container-low" format="webp"
                    loading="lazy" />
                  <span class="block p-3 text-[13px] font-semibold text-on-surface">
                    {{ locale === 'fa' ? srv.titleFa : srv.titleEn }}
                  </span>
                </button>
              </div>
              <div class="mt-5">
                <label class="mb-2 block text-[12px] font-semibold text-on-surface">{{ t.bookDoctorLabel }}</label>
                <div class="grid gap-2">
                  <button v-for="d in doctorsApi?.data || []" :key="d.id" type="button"
                    class="min-h-12 cursor-pointer rounded-xl border px-3 py-3 text-start text-[13px] transition-colors"
                    :class="doctor === (locale === 'fa' ? d.nameFa : d.nameEn)
                      ? 'border-primary bg-primary/5 font-semibold text-primary'
                      : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'"
                    @click="doctor = locale === 'fa' ? d.nameFa : d.nameEn; staffId = d.id">
                    {{ locale === 'fa' ? d.nameFa : d.nameEn }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 2 · Personal -->
            <div v-else-if="step === 2" class="flex flex-1 flex-col">
              <h2 class="text-[20px] font-bold text-on-surface sm:text-[24px]">{{ t.bookStepTitles[1] }}</h2>
              <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.bookPersonalPick }}</p>
              <div class="mt-6 max-w-md space-y-4">
                <div>
                  <label class="mb-1.5 block text-[12px] font-semibold">{{ t.bookName }}</label>
                  <input v-model="name" type="text"
                    class="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/20"
                    :placeholder="t.bookNamePlaceholder" />
                </div>
                <div>
                  <label class="mb-1.5 block text-[12px] font-semibold">{{ t.bookPhone }}</label>
                  <input v-model="phone" type="tel" dir="ltr"
                    class="h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-start text-[14px] outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="09xxxxxxxxx" />
                </div>
                <div>
                  <label class="mb-1.5 block text-[12px] font-semibold">{{ t.bookNotes }}</label>
                  <textarea v-model="notes" rows="3"
                    class="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/20"
                    :placeholder="t.bookNotesPlaceholder" />
                </div>
              </div>
            </div>

            <!-- Step 3 · Location -->
            <div v-else-if="step === 3" class="flex flex-1 flex-col">
              <h2 class="text-[20px] font-bold text-on-surface sm:text-[24px]">{{ t.bookStepTitles[2] }}</h2>
              <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.bookLocationPick }}</p>

              <label class="mb-2 mt-6 block text-[12px] font-semibold">{{ t.bookVisitType }}</label>
              <div class="grid grid-cols-2 gap-2 rounded-2xl bg-surface-container-low p-1">
                <button type="button"
                  class="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all"
                  :class="visitType === 'clinic' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'"
                  @click="visitType = 'clinic'">
                  <Icon name="ph:buildings" />
                  {{ t.bookVisitClinic }}
                </button>
                <button type="button"
                  class="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all"
                  :class="visitType === 'online' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'"
                  @click="visitType = 'online'">
                  <Icon name="ph:video-camera" />
                  {{ t.bookVisitOnline }}
                </button>
              </div>

              <label class="mb-2 mt-6 block text-[12px] font-semibold">{{ t.bookingBranch }}</label>
              <div class="grid gap-2">
                <button v-for="opt in t.branches" :key="opt" type="button"
                  class="min-h-12 cursor-pointer rounded-xl border px-3 py-3.5 text-start text-[13px] transition-colors"
                  :class="branch === opt
                    ? 'border-primary bg-primary/5 font-semibold text-primary'
                    : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                    " @click="branch = opt">
                  {{ opt }}
                </button>
              </div>
            </div>

            <!-- Step 4 · Appointment (date & time) — MicroLab-like -->
            <!-- Step 4 · Appointment (date & time) — MicroLab-like -->
            <div v-else-if="step === 4" class="flex flex-1 flex-col">

              <!-- هدر: عنوان + انتخاب‌گر ماه -->
              <div class="flex flex-wrap items-start justify-between gap-3">
                <h2 class="text-[20px] font-bold text-on-surface sm:text-[24px]">{{ t.bookSelectDateTime }}</h2>

                <!-- ✅ بخش کنترل ماه (قبلی / کلیک‌پذیر / بعدی) -->
                <div class="relative">
                  <div
                    class="flex items-center gap-1 rounded-full bg-surface-container-low px-2 py-1 text-[12px] font-semibold text-on-surface-variant">

                    <!-- دکمه هفته قبل -->
                    <button type="button"
                      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-white disabled:opacity-40"
                      :disabled="weekOffset === 0" @click="shiftWeek(-1)">
                      <Icon :name="locale === 'fa' ? 'ph:caret-right' : 'ph:caret-left'"
                        class="w-5 h-5 text-on-surface" />
                    </button>

                    <!-- ✅ دکمه ماه: با کلیک تقویم باز می‌شود -->
                    <button type="button"
                      class="min-w-30 cursor-pointer text-center hover:text-primary transition-colors"
                      @click="showCalendar = !showCalendar">
                      {{ monthLabel }}
                    </button>

                    <!-- دکمه هفته بعد -->
                    <button type="button"
                      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-white"
                      @click="shiftWeek(1)">
                      <Icon :name="locale === 'fa' ? 'ph:caret-left' : 'ph:caret-right'"
                        class="w-5 h-5 text-on-surface" />
                    </button>
                  </div>

                  <!-- ✅ تقویم پاپ‌آپ -->
                  <div v-if="showCalendar" class="absolute top-full end-0 z-50 mt-2">
                    <JalaliCalendarPopover :model-iso="selectedIso" :min-iso="isoDateOffset(0)"
                      @select="selectDateFromCalendar" @close="showCalendar = false" />
                  </div>
                </div>
              </div>

              <!-- ردیف تاریخ‌ها (Date strip) -->
              <div class="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none [scroll-snap-type:x_mandatory]">
                <button v-for="(d, i) in dates" :key="d.num" type="button"
                  class="flex min-w-17 shrink-0 snap-start cursor-pointer flex-col items-center rounded-xl px-2 py-3 transition-all"
                  :class="selectedDate === i
                    ? 'bg-transparent'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    " @click="selectedDate = i">
                  <span class="text-[11px] font-medium" :class="selectedDate === i ? 'text-primary' : ''">{{ d.day
                    }}</span>
                  <span class="mt-1 text-[20px] font-bold" :class="selectedDate === i ? 'text-on-surface' : ''">{{ d.num
                    }}</span>
                  <span class="mt-2 h-1 w-8 rounded-full transition-colors"
                    :class="selectedDate === i ? 'bg-primary' : 'bg-transparent'" />
                </button>
              </div>

              <!-- اگر اسلاتی برای این روز نبود -->
              <div v-if="!allSlots.length"
                class="mt-5 rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low p-6 text-center text-[13px] text-on-surface-variant">
                <p v-if="isSelectedToday">
                  {{
                    locale === 'fa'
                      ? 'برای امروز ساعت آزادی باقی نمانده. فردا یا روز بعد را انتخاب کنید.'
                      : 'No remaining slots today. Please pick tomorrow or another day.'
                  }}
                </p>
                <p v-else>{{ t.availUnavailable }}</p>
                <button v-if="isSelectedToday && dates.length > 1" type="button"
                  class="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-[12px] font-bold text-on-primary"
                  @click="selectedDate = 1">
                  {{ locale === 'fa' ? 'برو به فردا' : 'Go to tomorrow' }}
                </button>
              </div>

              <!-- شبکه ساعت‌ها (Time grid) -->
              <div v-else class="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                <button v-for="slot in visibleSlots" :key="slot.time" type="button"
                  class="min-h-11 cursor-pointer rounded-xl px-2 py-2.5 text-center text-[14px] font-semibold transition-colors"
                  :disabled="slot.taken" :class="slot.taken
                    ? 'cursor-not-allowed bg-surface-container-high text-on-surface-variant/50 line-through'
                    : selectedTime === slot.time
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    " @click="pickSlot(slot)">
                  {{ slot.time }}
                </button>
              </div>

              <!-- دکمه نمایش زمان‌های بیشتر -->
              <button v-if="allSlots.length" type="button"
                class="mt-4 cursor-pointer self-start text-[13px] font-semibold text-primary hover:underline"
                @click="showAllSlots = !showAllSlots">
                {{ showAllSlots ? t.bookBack : t.bookShowMoreSlots }}
                <span class="font-normal text-on-surface-variant">({{ availableCount }} {{ t.bookSlotsAvailable
                  }})</span>
              </button>

              <!-- بنر زمان انتخاب‌شده -->
              <div v-if="selectedTime"
                class="mt-5 flex items-start gap-3 rounded-2xl border border-primary/15 bg-[#faedcd] px-4 py-3 sm:items-center">
                <Icon name="ph:clock" />
                <p class="text-[13px] text-on-surface">
                  <span class="font-semibold text-on-surface-variant">{{ t.bookCurrentlySelected }}:</span>
                  {{ selectedBanner }}
                </p>
              </div>
            </div>

            <!-- Step 5 · Payment / addons -->
            <div v-else-if="step === 5" class="flex flex-1 flex-col">
              <h2 class="text-[20px] font-bold text-on-surface sm:text-[24px]">{{ t.bookPayTitle }}</h2>
              <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.bookPayDesc }}</p>

              <div class="mt-5 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-4">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-[13px] font-semibold text-on-surface">{{ t.bookDeposit }}</span>
                  <span class="text-[18px] font-bold text-primary">{{ formatPrice(deposit) }} {{ t.toman }}</span>
                </div>
              </div>

              <h3 class="mt-6 text-[13px] font-bold text-on-surface">{{ t.bookAddons }}</h3>
              <p class="mt-1 text-[11px] text-on-surface-variant">{{ t.bookAddonsDesc }}</p>
              <div class="mt-3 space-y-2">
                <button v-for="a in addonOptions" :key="a.id" type="button"
                  class="flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 text-start transition-all sm:items-center"
                  :class="addons.includes(a.id)
                    ? 'border-primary/40 bg-surface-container-low'
                    : 'border-outline-variant/40 hover:bg-surface-container-low'
                    " @click="toggleAddon(a.id)">
                  <div class="flex min-w-0 items-start gap-2.5 sm:items-center">
                    <div class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded sm:mt-0"
                      :class="addons.includes(a.id) ? 'bg-primary text-on-primary' : 'border border-outline bg-white'">
                      <Icon name="ph:check" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-[13px] font-semibold text-on-surface">{{ a.title }}</p>
                      <p class="text-[11px] text-on-surface-variant">{{ a.desc }}</p>
                    </div>
                  </div>
                  <span class="shrink-0 text-[12px] font-bold text-primary">+{{ formatPrice(a.price) }}</span>
                </button>
              </div>

              <div class="mt-5 flex items-center justify-between rounded-2xl bg-on-surface px-4 py-3 text-white">
                <span class="text-[13px] font-semibold">{{ t.bookDeposit }}</span>
                <span class="text-[18px] font-bold">{{ formatPrice(total) }} <span
                    class="text-[12px] font-medium opacity-80">{{ t.toman }}</span></span>
              </div>
            </div>

            <!-- Step 6 · Confirmation review -->
            <div v-else class="flex flex-1 flex-col">
              <h2 class="text-[20px] font-bold text-on-surface sm:text-[24px]">{{ t.bookStepTitles[5] }}</h2>
              <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.bookConfirmReview }}</p>

              <div
                class="mt-6 space-y-3 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-4 text-[13px]">
                <p class="font-bold text-on-surface">{{ t.bookSummary }}</p>
                <ul class="space-y-2 text-on-surface-variant">
                  <li><strong class="text-on-surface">{{ t.bookingService }}:</strong> {{ service }}</li>
                  <li><strong class="text-on-surface">{{ t.bookDoctorLabel }}:</strong> {{ doctor }}</li>
                  <li><strong class="text-on-surface">{{ t.bookingBranch }}:</strong> {{ branch }}</li>
                  <li><strong class="text-on-surface">{{ t.bookVisitType }}:</strong> {{ visitType === 'clinic' ?
                    t.bookVisitClinic : t.bookVisitOnline }}</li>
                  <li><strong class="text-on-surface">{{ t.bookWhen }}:</strong> {{ selectedDateLabel }}</li>
                  <li><strong class="text-on-surface">{{ t.bookName }}:</strong> {{ name }}</li>
                  <li><strong class="text-on-surface">{{ t.bookPhone }}:</strong> <span dir="ltr">{{ phone }}</span>
                  </li>
                  <li><strong class="text-on-surface">{{ t.bookDeposit }}:</strong> {{ formatPrice(total) }} {{ t.toman
                  }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer actions -->
          <div
            class="mt-auto flex flex-col gap-3 border-t border-outline-variant/20 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <RouterLink to="/"
              class="order-3 text-center text-[12px] font-semibold text-on-surface-variant hover:text-primary sm:order-1 sm:text-start">
              {{ t.bookBackHome }}
            </RouterLink>
            <div class="order-1 flex gap-2 sm:order-2 sm:ms-auto">
              <button v-if="step > 1" type="button"
                class="min-h-11 flex-1 cursor-pointer rounded-full border border-outline-variant/40 bg-surface-container-low px-5 text-[14px] font-semibold text-on-surface sm:flex-none"
                @click="back">
                {{ t.bookBack }}
              </button>
              <motion.button v-if="step < 6" type="button"
                class="min-h-11 flex-1 cursor-pointer rounded-full bg-primary px-6 text-[14px] font-bold text-on-primary disabled:opacity-40 sm:flex-none"
                :disabled="!canNext" :while-tap="reduce ? undefined : { scale: 0.98 }" @click="next">
                {{ t.bookContinue }}
              </motion.button>
              <motion.button v-else type="button"
                class="min-h-11 flex-1 cursor-pointer rounded-full bg-on-surface px-6 text-[14px] font-bold text-white disabled:opacity-40 sm:flex-none"
                :disabled="!canConfirm" :while-tap="reduce ? undefined : { scale: 0.98 }" @click="confirmBooking">
                {{ t.bookConfirm }}
              </motion.button>
            </div>
          </div>
        </template>
      </div>
    </motion.div>
  </div>
</template>
