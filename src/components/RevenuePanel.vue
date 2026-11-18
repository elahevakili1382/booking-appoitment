<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'vue-chartjs'
import { useLanguage } from '../i18n/useLanguage'
import type { BookingLite } from '../composables/useBookingStats'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

/** ظاهر فقط «آمادهٔ نمایش» می‌گیرد؛ محاسبهٔ این مقدارها در منطق (useRevenueReport) انجام می‌شود. */
interface Kpis {
    today?: number
    month?: number
    avgTicket?: number
    /** تغییر ۷ روز اخیر نسبت به ۷ روز قبل (کسر)، یا null اگر قابل محاسبه نیست */
    weekDelta?: number | null
}
interface Row {
    name: string
    revenue: number
    count: number
    /** سهم از کل، بین ۰ و ۱ */
    share: number
}
interface Point {
    d: string
    value: number
}
type Period = 7 | 14 | 30

const props = defineProps<{
    kpis?: Kpis
    points: Point[]
    byService: Row[]
    byDoctor: Row[]
    recent: BookingLite[]
    period: Period
    loading?: boolean
}>()
const emit = defineEmits<{ 'update:period': [value: Period] }>()

const { t, locale } = useLanguage()
const isFa = computed(() => locale.value === 'fa')
const tag = computed(() => (isFa.value ? 'fa-IR' : 'en-US'))
const nf = computed(() => new Intl.NumberFormat(tag.value))
const compact = computed(() => new Intl.NumberFormat(tag.value, { notation: 'compact' }))
const pct = computed(() => new Intl.NumberFormat(tag.value, { style: 'percent', maximumFractionDigits: 0 }))
const signedPct = computed(
    () => new Intl.NumberFormat(tag.value, { style: 'percent', maximumFractionDigits: 0, signDisplay: 'exceptZero' }),
)
const dayFmt = computed(
    () => new Intl.DateTimeFormat(isFa.value ? 'fa-IR-u-ca-persian' : 'en-US', { month: 'short', day: 'numeric' }),
)
const showDay = (iso?: string) => (iso ? dayFmt.value.format(new Date(`${iso}T00:00:00`)) : '—')
const money = (n?: number) => (n === undefined ? '—' : `${nf.value.format(n)} ${t.value.dashOvCurrency}`)

const periods: Period[] = [7, 14, 30]

const tiles = computed(() => {
    const k = props.kpis
    return [
        { id: 'today', label: t.value.dashRevToday, value: k?.today === undefined ? '—' : compact.value.format(k.today), icon: 'today', tint: 'peach' },
        { id: 'month', label: t.value.dashRevMonth, value: k?.month === undefined ? '—' : compact.value.format(k.month), icon: 'calendar_month', tint: 'mint' },
        { id: 'avg', label: t.value.dashRevAvg, value: k?.avgTicket === undefined ? '—' : compact.value.format(k.avgTicket), icon: 'receipt_long', tint: 'mint' },
        { id: 'delta', label: t.value.dashRevWeek, value: k?.weekDelta == null ? '—' : signedPct.value.format(k.weekDelta), icon: k?.weekDelta != null && k.weekDelta < 0 ? 'trending_down' : 'trending_up', tint: 'peach' },
    ]
})

const hasPoints = computed(() => props.points.some((p) => p.value > 0))

function cssColor(name: string, fallback: string) {
    if (typeof window === 'undefined') return fallback
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
const reduceMotion = computed(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)
const chartData = computed(() => ({
    labels: props.points.map((p) => showDay(p.d)),
    datasets: [
        {
            data: props.points.map((p) => p.value),
            backgroundColor: cssColor('--color-primary', '#d4a373'),
            borderRadius: 6,
            borderSkipped: false as const,
            maxBarThickness: 28,
        },
    ],
}))
const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: reduceMotion.value ? (false as const) : { duration: 500 },
    scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { maxRotation: 0, autoSkip: true, font: { family: 'Vazirmatn', size: 11 } } },
        y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(61, 52, 38, 0.08)' },
            ticks: { font: { family: 'Vazirmatn', size: 11 }, callback: (v: string | number) => compact.value.format(Number(v)) },
        },
    },
    plugins: {
        legend: { display: false },
        tooltip: { displayColors: false, callbacks: { label: (ctx: { parsed: { y: number | null } }) => money(ctx.parsed.y ?? 0) } },
    },
}))

const breakdowns = computed(() => [
    { id: 'service', title: t.value.dashRevByService, rows: props.byService },
    { id: 'doctor', title: t.value.dashRevByDoctor, rows: props.byDoctor },
])
</script>

<template>
    <div class="min-w-0 space-y-4">
        <header class="flex flex-wrap items-end justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-[20px] font-bold text-on-surface">{{ t.dashReportsTitle }}</h2>
                <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.dashRevSubtitle }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <div class="flex items-center rounded-full bg-white p-0.5 shadow-sm" role="group" :aria-label="t.dashRevPeriod">
                    <button v-for="p in periods" :key="p" type="button" :aria-pressed="period === p"
                        class="min-h-9 cursor-pointer rounded-full px-3 text-[12px] font-bold transition-colors"
                        :class="period === p ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'"
                        @click="emit('update:period', p)">
                        {{ nf.format(p) }} {{ t.dashRevDays }}
                    </button>
                </div>
                <a href="/api/reports/revenue?format=csv"
                    class="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-outline-variant/30 bg-white px-4 text-[12px] font-semibold shadow-sm hover:bg-surface-container-low">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">download</span>
                    {{ t.dashOvExport }}
                </a>
            </div>
        </header>

        <section :aria-label="t.dashRevKpis" :aria-busy="loading" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <dl v-for="tile in tiles" :key="tile.id"
                class="kpi-glass relative isolate overflow-hidden rounded-card border border-white/60 p-4 shadow-card"
                :class="tile.tint === 'peach' ? 'bg-primary/15' : 'bg-sage/45'">
                <div class="grid h-9 w-9 place-items-center rounded-xl bg-white/70 text-on-surface" aria-hidden="true">
                    <span class="material-symbols-outlined text-[20px]">{{ tile.icon }}</span>
                </div>
                <dt class="mt-3 text-[12px] font-semibold text-on-surface-variant">{{ tile.label }}</dt>
                <dd class="mt-1 text-[22px] font-bold leading-tight tabular-nums text-on-surface">
                    <span v-if="loading" class="block h-7 w-20 animate-pulse rounded bg-white/60 motion-reduce:animate-none" aria-hidden="true" />
                    <template v-else>{{ tile.value }}</template>
                </dd>
            </dl>
        </section>

        <section class="rounded-card border border-outline-variant/25 bg-white p-4 shadow-card sm:p-5" :aria-label="t.dashRevDaily">
            <h3 class="text-[15px] font-bold text-on-surface">{{ t.dashRevDaily }}</h3>
            <div v-if="loading" class="mt-4 h-56 animate-pulse rounded-xl bg-surface-container motion-reduce:animate-none" aria-hidden="true" />
            <p v-else-if="!hasPoints"
                class="mt-4 grid h-56 place-items-center rounded-xl bg-surface-container-low px-4 text-center text-[13px] text-on-surface-variant">
                {{ t.dashRevEmpty }}
            </p>
            <div v-else class="relative mt-4 h-56" role="img" :aria-label="t.dashRevDaily">
                <ClientOnly>
                    <Bar :data="chartData" :options="chartOptions" aria-hidden="true" />
                    <template #fallback><div class="h-full w-full" /></template>
                </ClientOnly>
            </div>
        </section>

        <div class="grid gap-4 lg:grid-cols-2">
            <section v-for="b in breakdowns" :key="b.id"
                class="rounded-card border border-outline-variant/25 bg-white p-4 shadow-card sm:p-5" :aria-label="b.title">
                <h3 class="text-[15px] font-bold text-on-surface">{{ b.title }}</h3>
                <p v-if="!b.rows.length" class="mt-3 rounded-xl bg-surface-container-low p-5 text-center text-[13px] text-on-surface-variant">
                    {{ t.dashRevEmpty }}
                </p>
                <ul v-else class="mt-3 space-y-3">
                    <li v-for="r in b.rows" :key="r.name">
                        <div class="flex items-baseline justify-between gap-3 text-[13px]">
                            <span lang="fa" dir="auto" class="min-w-0 truncate font-semibold text-on-surface">{{ r.name }}</span>
                            <span class="shrink-0 tabular-nums text-on-surface-variant">
                                {{ money(r.revenue) }} · {{ pct.format(r.share) }}
                            </span>
                        </div>
                        <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sage/35" aria-hidden="true">
                            <div class="h-full rounded-full bg-primary" :style="{ width: `${Math.round(Math.min(Math.max(r.share, 0), 1) * 100)}%` }" />
                        </div>
                    </li>
                </ul>
            </section>
        </div>

        <section class="rounded-card border border-outline-variant/25 bg-white p-4 shadow-card sm:p-5" :aria-label="t.dashRevRecent">
            <h3 class="text-[15px] font-bold text-on-surface">{{ t.dashRevRecent }}</h3>
            <p v-if="!recent.length" class="mt-3 rounded-xl bg-surface-container-low p-6 text-center text-[13px] text-on-surface-variant">
                {{ t.dashRevEmpty }}
            </p>
            <div v-else class="mt-3 overflow-x-auto">
                <table class="w-full min-w-[26rem] text-start text-[13px]">
                    <caption class="sr-only">{{ t.dashRevRecent }}</caption>
                    <thead>
                        <tr class="border-b border-outline-variant/25 text-[11px] text-on-surface-variant">
                            <th scope="col" class="py-2 pe-3 text-start font-semibold">{{ t.dashRevDate }}</th>
                            <th scope="col" class="py-2 pe-3 text-start font-semibold">{{ t.dashOvTblService }}</th>
                            <th scope="col" class="hidden py-2 pe-3 text-start font-semibold sm:table-cell">{{ t.dashOvTblDoctor }}</th>
                            <th scope="col" class="py-2 pe-3 text-start font-semibold">{{ t.dashOvTblStatus }}</th>
                            <th scope="col" class="py-2 text-end font-semibold">{{ t.dashOvTblAmount }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-outline-variant/15">
                        <tr v-for="b in recent" :key="b.id">
                            <td class="py-3 pe-3 tabular-nums text-on-surface-variant">{{ showDay(b.date) }}</td>
                            <td lang="fa" dir="auto" class="py-3 pe-3 font-semibold text-on-surface">{{ b.service || '—' }}</td>
                            <td lang="fa" dir="auto" class="hidden py-3 pe-3 text-on-surface-variant sm:table-cell">{{ b.doctor || '—' }}</td>
                            <td class="py-3 pe-3"><StatusPill :status="b.status" /></td>
                            <td class="py-3 text-end tabular-nums text-on-surface">{{ money(b.total || 0) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>
