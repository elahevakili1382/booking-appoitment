<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'
import {
    addDays,
    isCounted,
    bookingsToCsv,
    lastNDays,
    periodDelta,
    statusCountsByDay,
    STATUS_GROUPS,
    type BookingLite,
    type OverviewDoctor,
    type OverviewSlot,
} from '../composables/useBookingStats'

type Stats = {
    appointmentsToday: number
    revenueToday: number
    revenueMonth: number
    newCustomers: number
    cancelRate: number
}

const emit = defineEmits<{ 'select-date': [iso: string] }>()

const props = defineProps<{
    stats?: Stats
    bookings: BookingLite[]
    dayBookings: BookingLite[]
    doctors: OverviewDoctor[]
    slots: OverviewSlot[]
    /** روز انتخاب‌شده (ISO) */
    viewDate: string
    /** تاریخ شمسی/میلادی آمادهٔ نمایش */
    dateLabel: string
    loading?: boolean
}>()

const { t } = useLanguage()

// نام کاربر برای خوش‌آمد؛ اگر نرسید، فقط «سلام»
const { data: me } = useAsyncData('dash-me', () =>
    $fetch<{ user: { name?: string } | null }>('/api/auth/me').catch(() => ({ user: null })),
)
const greeting = computed(() => {
    const name = me.value?.user?.name?.trim()
    return name ? `${t.value.dashOvHello}، ${name}` : t.value.dashOvHello
})

const delta = computed(() => periodDelta(props.bookings, props.viewDate))

// نمودار کوچک کارت اول: تعداد نوبت‌های فعال در ۱۴ روز تقویمی منتهی به روز انتخاب‌شده
const apptPoints = computed(() => {
    const days = lastNDays(props.viewDate, 14)
    const counts = statusCountsByDay(props.bookings, days)
    return days.map((d, i) => ({
        d,
        value: STATUS_GROUPS.filter((g) => g !== 'missed').reduce((sum, g) => sum + (counts[g][i] ?? 0), 0),
    }))
})

// روزهایی که نوبت فعال دارند، برای نقطه‌های تقویم ماهانه
const busyDays = computed(() => [...new Set(props.bookings.filter((b) => b.date && isCounted(b.status)).map((b) => b.date!))])

function exportCsv() {
    const from = addDays(props.viewDate, -6)
    const rows = props.bookings.filter((b) => b.date && b.date >= from && b.date <= props.viewDate)
    const blob = new Blob([bookingsToCsv(rows)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lumina-bookings-${props.viewDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
}
</script>

<template>
    <div class="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="min-w-0 space-y-4">
        <header class="flex flex-wrap items-end justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-[22px] font-extrabold leading-tight text-on-surface sm:text-[26px]">{{ greeting }}</h2>
                <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.dashOvSubtitle }} · {{ dateLabel }}</p>
            </div>
            <button type="button"
                class="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-outline-variant/30 bg-white px-4 text-[12px] font-semibold shadow-sm hover:bg-surface-container-low"
                @click="exportCsv">
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">download</span>
                {{ t.dashOvExport }}
            </button>
        </header>

        <DashboardKpiCards :stats="stats" :revenue-delta="delta" :loading="loading">
            <template #spark>
                <KpiSparkline :points="apptPoints" :label="t.dashOvTrend" />
            </template>
        </DashboardKpiCards>

        <div class="grid gap-4 lg:grid-cols-3">
            <OverviewWeeklyChart :bookings="bookings" :end-date="viewDate" :loading="loading" class="lg:col-span-2" />
            <OverviewDoctors :doctors="doctors" :slots="slots" />
        </div>

        <OverviewAppointmentsTable :bookings="dayBookings" />
        </div>

        <!-- ستون کناری: تقویم ماهانه و فعالیت‌های اخیر -->
        <aside class="min-w-0 space-y-4">
            <OverviewMiniCalendar :selected="viewDate" :busy-days="busyDays" @select="emit('select-date', $event)" />
            <OverviewActivity :bookings="bookings" />
        </aside>
    </div>
</template>
