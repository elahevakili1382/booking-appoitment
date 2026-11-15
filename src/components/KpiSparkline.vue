<script setup lang="ts">
import {
    Chart as ChartJS,
    CategoryScale,
    Filler,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useLanguage } from '../i18n/useLanguage'

// فقط چیزهایی که لازم داریم ثبت می‌شود تا باندل کوچک بماند (tree-shaking)
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
    /** نقطه‌های روزانه به ترتیب زمان (قدیمی ← جدید): d = YYYY-MM-DD */
    points: Array<{ d: string; value: number }>
    /** متن برای صفحه‌خوان، مثلاً «نوبت‌های ۱۴ روز اخیر» */
    label: string
}>()

const { locale } = useLanguage()

const numberFormat = computed(() => new Intl.NumberFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US'))
const dayFormat = computed(
    () =>
        new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
            month: 'short',
            day: 'numeric',
        }),
)

/** رنگ از توکن‌های طراحی خوانده می‌شود، نه hard-code. فقط سمت کلاینت اجرا می‌شود. */
function cssColor(name: string, fallback: string) {
    if (typeof window === 'undefined') return fallback
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return v || fallback
}

const chartData = computed(() => {
    const line = cssColor('--color-secondary', '#a9845a')
    return {
        labels: props.points.map((p) => dayFormat.value.format(new Date(`${p.d}T00:00:00`))),
        datasets: [
            {
                data: props.points.map((p) => p.value),
                borderColor: line,
                backgroundColor: `${line}26`, // ~15% opacity
                borderWidth: 2,
                fill: true,
                tension: 0.35,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    }
})

const reduceMotion = computed(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: reduceMotion.value ? (false as const) : { duration: 600 },
    interaction: { mode: 'index' as const, intersect: false },
    layout: { padding: { top: 4, bottom: 2 } },
    scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
    plugins: {
        legend: { display: false },
        tooltip: {
            displayColors: false,
            callbacks: { label: (ctx: { parsed: { y: number | null } }) => numberFormat.value.format(ctx.parsed.y ?? 0) },
        },
    },
}))
</script>

<template>
    <!-- Canvas برای صفحه‌خوان معنی ندارد؛ برچسب متنی روی ظرف است -->
    <div v-if="points.length >= 2" role="img" :aria-label="label" class="relative h-14 w-full">
        <ClientOnly>
            <Line :data="chartData" :options="chartOptions" aria-hidden="true" />
            <template #fallback>
                <div class="h-full w-full" />
            </template>
        </ClientOnly>
    </div>
</template>
