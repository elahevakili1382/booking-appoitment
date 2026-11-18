<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'

const props = defineProps<{
    stats?: {
        appointmentsToday: number
        revenueToday: number
        revenueMonth: number
        newCustomers: number
        cancelRate: number
    }
    /** تغییر درآمد ۷ روز اخیر نسبت به ۷ روز قبل (کسر)، یا null اگر قابل محاسبه نیست */
    revenueDelta?: number | null
    /** تغییر تعداد نوبت‌های ۷ روز اخیر نسبت به ۷ روز قبل (کسر)، یا null */
    appointmentsDelta?: number | null
    loading?: boolean
}>()

const { t, locale } = useLanguage()

const tag = computed(() => (locale.value === 'fa' ? 'fa-IR' : 'en-US'))
const nf = computed(() => new Intl.NumberFormat(tag.value))
const compact = computed(() => new Intl.NumberFormat(tag.value, { notation: 'compact' }))
const percent = computed(() => new Intl.NumberFormat(tag.value, { style: 'percent', maximumFractionDigits: 0 }))
const signedPercent = computed(
    () => new Intl.NumberFormat(tag.value, { style: 'percent', maximumFractionDigits: 0, signDisplay: 'exceptZero' }),
)

const cards = computed(() => {
    const s = props.stats
    const delta = props.revenueDelta

    return [
        {
            id: 'appointments',
            label: t.value.dashStatsToday,
            value: s ? nf.value.format(s.appointmentsToday) : '—',
            hint: '',
            unit: '',
            icon: 'calendar_month',
            tint: 'peach',
            delta: props.appointmentsDelta ?? null,
        },
        {
            id: 'revenue',
            label: t.value.dashStatsRevenue,
            value: s ? compact.value.format(s.revenueToday) : '—',
            hint: s ? `${t.value.dashKpiRevenueMonth}: ${compact.value.format(s.revenueMonth)} ${t.value.dashCurrencyFull}` : '',
            unit: t.value.dashCurrencyFull,
            icon: 'payments',
            tint: 'mint',
            delta: delta ?? null,
        },
        {
            id: 'newCustomers',
            label: t.value.dashKpiNewCustomers,
            value: s ? nf.value.format(s.newCustomers) : '—',
            hint: '',
            unit: '',
            icon: 'person_add',
            tint: 'mint',
            delta: null as number | null,
        },
        {
            id: 'cancelRate',
            label: t.value.dashKpiCancelRate,
            value: s ? percent.value.format(s.cancelRate) : '—',
            hint: '',
            unit: '',
            icon: 'event_busy',
            tint: 'peach',
            delta: null as number | null,
        },
    ]
})
</script>

<template>
    <section :aria-label="t.dashKpiLabel" :aria-busy="loading" class="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <dl v-for="c in cards" :key="c.id" class="kpi-glass relative isolate overflow-hidden rounded-card border border-white/60 p-4 shadow-card"
            :class="[c.tint === 'peach' ? 'bg-primary/15' : 'bg-sage/45', c.id === 'appointments' ? 'lg:col-span-2 lg:p-5' : '']">
            <!-- نشان محو در گوشهٔ کاشی (تزئینی) -->
            <span class="material-symbols-outlined pointer-events-none absolute -bottom-4 -start-3 -z-10 text-[88px] text-on-surface opacity-[0.07]" aria-hidden="true">auto_awesome</span>
            <div class="flex items-start justify-between gap-3">
                <div class="grid h-9 w-9 place-items-center rounded-xl bg-white/70 text-on-surface" aria-hidden="true">
                    <span class="material-symbols-outlined text-[20px]">{{ c.icon }}</span>
                </div>
                <!-- نمودار کوچک: slot با نام spark (فقط کارت اول) -->
                <div v-if="c.id === 'appointments'" class="hidden min-w-0 flex-1 lg:block">
                    <slot name="spark" />
                </div>
            </div>
            <dt class="mt-3 text-[12px] font-semibold text-on-surface-variant">{{ c.label }}</dt>
            <dd class="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span v-if="loading"
                    class="block h-7 w-20 animate-pulse rounded bg-surface-container motion-reduce:animate-none"
                    aria-hidden="true" />
                <template v-else>
                    <span class="text-[28px] font-extrabold leading-tight tabular-nums text-on-surface"
                        :class="c.id === 'appointments' ? 'lg:text-[40px]' : 'lg:text-[30px]'">{{ c.value }}</span>
                    <span v-if="c.unit && c.value !== '—'"class="text-[12px] font-semibold text-on-surface-variant">{{ c.unit }}</span>
                    <!-- روند: آیکون + علامت + متن، نه فقط رنگ -->
                    <span v-if="c.delta !== null"
                        class="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums"
                        :class="c.delta >= 0 ? 'bg-white/75 text-positive' : 'bg-white/75 text-error'">
                        <span class="material-symbols-outlined text-[14px]" aria-hidden="true">{{ c.delta >= 0 ?
                            'arrow_upward' : 'arrow_downward' }}</span>
                        {{ signedPercent.format(c.delta) }}
                        <span class="sr-only">{{ t.dashOvDelta }}</span>
                    </span>
                </template>
            </dd>
            <dd v-if="c.hint && !loading" class="mt-1 text-[11px] text-on-surface-variant">{{ c.hint }}</dd>
            <dd v-if="c.delta !== null && !loading" class="text-[11px] text-on-surface-variant" aria-hidden="true">{{
                t.dashOvDelta }}</dd>
        </dl>
    </section>
</template>
