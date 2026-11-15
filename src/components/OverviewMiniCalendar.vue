<script setup lang="ts">
import 'dayjs/locale/fa'
import { useLanguage } from '../i18n/useLanguage'
import { dayjs, tehranToday } from '../../server/utils/dates'

const props = defineProps<{
    /** روز انتخاب‌شده (ISO میلادی) */
    selected: string
    /** روزهایی که نوبت دارند (ISO میلادی) */
    busyDays: string[]
}>()

const emit = defineEmits<{ select: [iso: string] }>()

const { t, locale } = useLanguage()
const isFa = computed(() => locale.value === 'fa')
const calendarSystem = computed(() => (isFa.value ? 'jalali' : 'gregory'))

function d(input?: string | Date) {
    const x = dayjs(input).calendar(calendarSystem.value)
    return x.locale(isFa.value ? 'fa' : 'en')
}

const todayIso = tehranToday()
const viewMonth = ref(d(props.selected || todayIso).startOf('month'))

// با تغییر روز انتخاب‌شده از بیرون (یا تغییر زبان) ماه نمایش‌داده‌شده هم‌گام می‌شود
watch([() => props.selected, calendarSystem], () => {
    viewMonth.value = d(props.selected || todayIso).startOf('month')
})

const weekdays = computed(() => (isFa.value ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] : ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']))
const busy = computed(() => new Set(props.busyDays))
const nf = computed(() => new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US'))

const monthLabel = computed(() => viewMonth.value.format('MMMM YYYY'))

const cells = computed(() => {
    const start = viewMonth.value
    const leading = (start.day() + 1) % 7
    const out: Array<null | { day: number; iso: string; isToday: boolean; isSelected: boolean; hasAppts: boolean; label: string }> = []
    for (let i = 0; i < leading; i++) out.push(null)
    for (let day = 1; day <= start.daysInMonth(); day++) {
        const date = start.date(day)
        const iso = date.calendar('gregory').format('YYYY-MM-DD')
        out.push({
            day,
            iso,
            isToday: iso === todayIso,
            isSelected: iso === props.selected,
            hasAppts: busy.value.has(iso),
            label: date.format('dddd D MMMM YYYY'),
        })
    }
    return out
})

const prev = () => (viewMonth.value = viewMonth.value.subtract(1, 'month'))
const next = () => (viewMonth.value = viewMonth.value.add(1, 'month'))
</script>

<template>
    <section class="rounded-card border border-outline-variant/25 bg-white p-4 shadow-card" :aria-label="t.dashOvMiniCal">
        <header class="flex items-center justify-between gap-2">
            <h3 class="text-[14px] font-bold text-on-surface">{{ monthLabel }}</h3>
            <div class="flex items-center gap-1">
                <button type="button" :aria-label="isFa ? 'ماه قبل' : 'Previous month'"
                    class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-sage/40 text-on-surface hover:bg-sage/70"
                    @click="prev">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">{{ isFa ? 'chevron_right' :
                        'chevron_left' }}</span>
                </button>
                <button type="button" :aria-label="isFa ? 'ماه بعد' : 'Next month'"
                    class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-sage/40 text-on-surface hover:bg-sage/70"
                    @click="next">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">{{ isFa ? 'chevron_left' :
                        'chevron_right' }}</span>
                </button>
            </div>
        </header>

        <div class="mt-3 grid grid-cols-7 gap-y-1 text-center text-[11px] font-semibold text-on-surface-variant" aria-hidden="true">
            <span v-for="w in weekdays" :key="w">{{ w }}</span>
        </div>

        <div class="mt-1 grid grid-cols-7 gap-y-1">
            <template v-for="(c, i) in cells" :key="i">
                <span v-if="!c" />
                <button v-else type="button" :aria-label="c.label" :aria-pressed="c.isSelected"
                    :aria-current="c.isToday ? 'date' : undefined"
                    class="relative mx-auto grid h-9 w-9 cursor-pointer place-items-center rounded-full text-[12px] font-semibold tabular-nums transition-colors"
                    :class="[
                        c.isSelected ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container',
                        c.isToday && !c.isSelected ? 'ring-1 ring-primary/60' : '',
                    ]" @click="emit('select', c.iso)">
                    {{ nf.format(c.day) }}
                    <!-- نقطهٔ نوبت: علاوه بر رنگ، در aria-label نیامده چون فقط کمکی بصری است -->
                    <span v-if="c.hasAppts"
                        class="absolute bottom-1 h-1 w-1 rounded-full" :class="c.isSelected ? 'bg-on-primary' : 'bg-primary'" />
                </button>
            </template>
        </div>
    </section>
</template>
