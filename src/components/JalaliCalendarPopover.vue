<script setup lang="ts">
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import 'dayjs/locale/fa'
import { onClickOutside } from '@vueuse/core'
import { useLanguage } from '../i18n/useLanguage'

dayjs.extend(jalaliday)

const props = defineProps<{
    modelIso?: string   // تاریخ انتخاب‌شده‌ی فعلی (YYYY-MM-DD میلادی)
    minIso?: string      // کمترین تاریخ قابل‌انتخاب
}>()

const emit = defineEmits<{
    select: [iso: string]
    close: []
}>()

const { locale } = useLanguage()
const isFa = computed(() => locale.value === 'fa')
const calendarSystem = computed(() => (isFa.value ? 'jalali' : 'gregory'))

function d(input?: string | Date) {
    const x = dayjs(input).calendar(calendarSystem.value)
    return x.locale(isFa.value ? 'fa' : 'en')
}

const root = ref<HTMLElement | null>(null)
onClickOutside(root, () => emit('close'))

const todayIso = dayjs().format('YYYY-MM-DD')
const minIso = computed(() => props.minIso ?? todayIso)

const viewMonth = ref(d(props.modelIso ?? todayIso).startOf('month'))
watch(calendarSystem, () => {
    viewMonth.value = d(props.modelIso ?? todayIso).startOf('month')


})

const weekdaysFa = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const weekdaysEn = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']

const weekdays = computed(() => (isFa.value ? weekdaysFa : weekdaysEn))

function weekStartIndex(x: dayjs.Dayjs) {
    return (x.day() + 1) % 7
}

const monthLabel = computed(() => viewMonth.value.format('MMMM YYYY'))

const daysGrid = computed(() => {
    const start = viewMonth.value
    const total = start.daysInMonth()
    const leading = weekStartIndex(start)
    const cells: Array<null | {
        day: number; iso: string; disabled: boolean; isToday: boolean; isSelected: boolean
    }> = []

    for (let i = 0; i < leading; i++) cells.push(null)

    for (let day = 1; day <= total; day++) {
        const cellDate = start.date(day)
        const iso = cellDate.calendar('gregory').format('YYYY-MM-DD')
        cells.push({
            day,
            iso,
            disabled: iso < minIso.value,
            isToday: iso === todayIso,
            isSelected: iso === props.modelIso,
        })
    }
    return cells
})

function prevMonth() {
    const prev = viewMonth.value.subtract(1, 'month')
    if (prev.endOf('month').calendar('gregory').format('YYYY-MM-DD') < minIso.value) return
    viewMonth.value = prev
}

function nextMonth() {
    viewMonth.value = viewMonth.value.add(1, 'month')
}

function pick(cell: { iso: string; disabled: boolean } | null) {
    if (!cell || cell.disabled) return
    emit('select', cell.iso)
}

function dayDigits(n: number) {
    return isFa.value ? n.toLocaleString('fa-IR') : String(n)
}
</script>


<template>
    <div ref="root" class="w-72 rounded-2xl border border-outline-variant/30 bg-white p-3 shadow-xl">
        <div class="flex items-center justify-between px-1 pb-2">
            <button type="button"
                class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container-low"
                @click="prevMonth">
                <Icon :name="isFa ? 'ph:caret-right' : 'ph:caret-left'" class="h-4 w-4" />
            </button>
            <span class="text-[13px] font-bold text-on-surface">{{ monthLabel }}</span>
            <button type="button"
                class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container-low"
                @click="nextMonth">
                <Icon :name="isFa ? 'ph:caret-left' : 'ph:caret-right'" class="h-4 w-4" />
            </button>
        </div>

        <div class="grid grid-cols-7 gap-1 px-1 pb-1 text-center text-[11px] font-semibold text-on-surface-variant">
            <span v-for="w in weekdays" :key="w">{{ w }}</span>
        </div>

        <div class="grid grid-cols-7 gap-1 px-1">
            <template v-for="(cell, i) in daysGrid" :key="i">
                <span v-if="!cell" class="h-9 w-9" />
                <button v-else type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition-colors"
                    :disabled="cell.disabled" :class="[
                        cell.disabled ? 'cursor-not-allowed text-on-surface-variant/30' : 'cursor-pointer hover:bg-surface-container-low',
                        cell.isSelected ? 'bg-primary text-on-primary hover:bg-primary' : '',
                        cell.isToday && !cell.isSelected ? 'ring-1 ring-primary/50' : '',
                    ]" @click="pick(cell)">
                    {{ dayDigits(cell.day) }}
                </button>
            </template>
        </div>
    </div>
</template>