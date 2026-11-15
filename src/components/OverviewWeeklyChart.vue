<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'vue-chartjs'
import { useLanguage } from '../i18n/useLanguage'
import { STATUS_GROUPS, lastNDays, statusCountsByDay, type BookingLite, type StatusGroup } from '../composables/useBookingStats'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const props = defineProps<{
    bookings: BookingLite[]
    /** آخرین روز بازه (ISO) */
    endDate: string
    loading?: boolean
}>()

const { t, locale } = useLanguage()

const days = computed(() => lastNDays(props.endDate, 7))
const counts = computed(() => statusCountsByDay(props.bookings, days.value))
const total = computed(() => STATUS_GROUPS.reduce((sum, g) => sum + counts.value[g].reduce((a, b) => a + b, 0), 0))

const tag = computed(() => (locale.value === 'fa' ? 'fa-IR' : 'en-US'))
const nf = computed(() => new Intl.NumberFormat(tag.value))
const dayFormat = computed(
    () =>
        new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
            weekday: 'short',
            day: 'numeric',
        }),
)
const dayLabels = computed(() => days.value.map((d) => dayFormat.value.format(new Date(`${d}T00:00:00`))))

const labels = computed<Record<StatusGroup, string>>(() => ({
    completed: t.value.dashOvStCompleted,
    confirmed: t.value.dashOvStConfirmed,
    pending: t.value.dashOvStPending,
    missed: t.value.dashOvStMissed,
}))

/** رنگ هر وضعیت از توکن‌های طراحی. در legend و tooltip هم نام متنی هست، پس رنگ تنها حامل معنی نیست. */
const tokens: Record<StatusGroup, [string, string]> = {
    completed: ['--color-sage', '#ccd5ae'],
    confirmed: ['--color-primary', '#d4a373'],
    pending: ['--color-secondary', '#a9845a'],
    missed: ['--color-outline-variant', '#d4ceb8'],
}
function cssColor(name: string, fallback: string) {
    if (typeof window === 'undefined') return fallback
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
const colors = computed(() =>
    Object.fromEntries(STATUS_GROUPS.map((g) => [g, cssColor(...tokens[g])])) as Record<StatusGroup, string>,
)

const chartData = computed(() => ({
    labels: dayLabels.value,
    datasets: STATUS_GROUPS.map((g) => ({
        label: labels.value[g],
        data: counts.value[g],
        backgroundColor: colors.value[g],
        borderRadius: 4,
        borderSkipped: false as const,
        maxBarThickness: 28,
    })),
}))

const reduceMotion = computed(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: reduceMotion.value ? (false as const) : { duration: 500 },
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
        x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Vazirmatn', size: 11 } } },
        y: {
            stacked: true,
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(61, 52, 38, 0.08)' },
            ticks: { precision: 0, font: { family: 'Vazirmatn', size: 11 }, callback: (v: string | number) => nf.value.format(Number(v)) },
        },
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: { label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => `${ctx.dataset.label}: ${nf.value.format(ctx.parsed.y ?? 0)}` },
        },
    },
}))
</script>

<template>
    <section class="rounded-card border border-outline-variant/25 bg-white p-4 shadow-card sm:p-5" :aria-label="t.dashOvWeekTitle">
        <header class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-[15px] font-bold text-on-surface">{{ t.dashOvWeekTitle }}</h3>
            <ul class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-on-surface-variant">
                <li v-for="g in STATUS_GROUPS" :key="g" class="inline-flex items-center gap-1.5">
                    <span class="h-2.5 w-2.5 rounded-sm" :style="{ backgroundColor: colors[g] }" aria-hidden="true" />
                    {{ labels[g] }}
                </li>
            </ul>
        </header>

        <div v-if="loading" class="mt-4 h-56 animate-pulse rounded-xl bg-surface-container motion-reduce:animate-none"
            aria-hidden="true" />

        <p v-else-if="total === 0" class="mt-4 grid h-56 place-items-center rounded-xl bg-surface-container-low px-4 text-center text-[13px] text-on-surface-variant">
            {{ t.dashOvWeekEmpty }}
        </p>

        <template v-else>
            <div class="relative mt-4 h-56" aria-hidden="true">
                <ClientOnly>
                    <Bar :data="chartData" :options="chartOptions" />
                    <template #fallback>
                        <div class="h-full w-full" />
                    </template>
                </ClientOnly>
            </div>

            <!-- معادل متنی نمودار برای صفحه‌خوان -->
            <table class="sr-only">
                <caption>{{ t.dashOvWeekTitle }}</caption>
                <thead>
                    <tr>
                        <th scope="col" />
                        <th v-for="g in STATUS_GROUPS" :key="g" scope="col">{{ labels[g] }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(label, i) in dayLabels" :key="days[i]">
                        <th scope="row">{{ label }}</th>
                        <td v-for="g in STATUS_GROUPS" :key="g">{{ nf.format(counts[g][i] ?? 0) }}</td>
                    </tr>
                </tbody>
            </table>
        </template>
    </section>
</template>
