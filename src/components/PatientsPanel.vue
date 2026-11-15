<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'
import type { BookingLite, CustomerLite } from '../composables/useBookingStats'

const props = defineProps<{
    customers: CustomerLite[]
    bookings: BookingLite[]
    loading?: boolean
}>()

const { t, locale } = useLanguage()

type TagFilter = 'all' | 'vip' | 'allergy' | 'none'
const search = ref('')
const tagFilter = ref<TagFilter>('all')
const selectedId = ref<string | null>(null)

const digits = (s?: string) => (s ?? '').replace(/\D/g, '')

const filters = computed<Array<{ id: TagFilter; label: string }>>(() => [
    { id: 'all', label: t.value.dashPatFilterAll },
    { id: 'vip', label: t.value.dashPatTagVip },
    { id: 'allergy', label: t.value.dashPatTagAllergy },
    { id: 'none', label: t.value.dashPatTagNone },
])

const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    const qd = digits(q)
    return props.customers.filter((c) => {
        if (tagFilter.value !== 'all' && (c.tag || 'none') !== tagFilter.value) return false
        if (!q) return true
        return (
            c.name.toLowerCase().includes(q) ||
            c.fileNo.toLowerCase().includes(q) ||
            (qd.length > 0 && digits(c.phone).includes(qd))
        )
    })
})

const selected = computed(() => props.customers.find((c) => c.id === selectedId.value) ?? null)

// سابقهٔ نوبت‌ها: اتصال با شمارهٔ موبایل
const history = computed(() => {
    const s = selected.value
    if (!s) return []
    const p = digits(s.phone)
    return props.bookings
        .filter((b) => digits(b.phone) === p)
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
})

const todayTehran = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date())
const visits = computed(() => history.value.filter((b) => b.status === 'completed').length)
const upcoming = computed(
    () => history.value.filter((b) => (b.status === 'confirmed' || b.status === 'pending') && (b.date ?? '') >= todayTehran).length,
)

const nf = computed(() => new Intl.NumberFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US'))
const dateFmt = computed(
    () =>
        new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
)
function showDate(iso?: string) {
    if (!iso) return '—'
    const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
    return Number.isNaN(d.getTime()) ? iso : dateFmt.value.format(d)
}

const tagLabel = (tag?: string) => (tag === 'vip' ? t.value.dashPatTagVip : tag === 'allergy' ? t.value.dashPatTagAllergy : '')
const initial = (name: string) => name.trim().charAt(0) || '؟'
</script>

<template>
    <div class="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section class="min-w-0 rounded-card border border-outline-variant/25 bg-white p-4 shadow-card sm:p-5"
            :aria-label="t.dashCustomersTitle">
            <header class="flex flex-wrap items-baseline justify-between gap-2">
                <h2 class="text-[18px] font-bold text-on-surface">{{ t.dashCustomersTitle }}</h2>
                <p class="text-[12px] text-on-surface-variant" aria-live="polite">
                    {{ nf.format(filtered.length) }} {{ t.dashPatCountUnit }}
                </p>
            </header>

            <div class="mt-3 flex flex-wrap items-center gap-2">
                <div class="relative min-w-0 flex-1 basis-full sm:basis-64">
                    <span class="material-symbols-outlined pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" aria-hidden="true">search</span>
                    <input v-model="search" type="search" :aria-label="t.dashPatSearch" :placeholder="t.dashPatSearch"
                        class="h-11 w-full rounded-full border border-outline-variant/30 bg-white pe-3 ps-10 text-[13px] outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div class="flex flex-wrap items-center gap-1.5" role="group" :aria-label="t.dashPatFilterLabel">
                    <button v-for="f in filters" :key="f.id" type="button" :aria-pressed="tagFilter === f.id"
                        class="min-h-9 cursor-pointer rounded-full px-3 text-[12px] font-semibold transition-colors"
                        :class="tagFilter === f.id ? 'bg-primary text-on-primary' : 'bg-sage/35 text-on-surface hover:bg-sage/60'"
                        @click="tagFilter = f.id">
                        {{ f.label }}
                    </button>
                </div>
            </div>

            <div v-if="loading" class="mt-4 space-y-2" aria-hidden="true">
                <div v-for="i in 4" :key="i" class="h-14 animate-pulse rounded-xl bg-surface-container motion-reduce:animate-none" />
            </div>

            <p v-else-if="!customers.length"
                class="mt-4 rounded-xl bg-surface-container-low p-6 text-center text-[13px] text-on-surface-variant">
                {{ t.dashPatEmpty }}
            </p>

            <div v-else-if="!filtered.length" class="mt-4 rounded-xl bg-surface-container-low p-6 text-center">
                <p class="text-[13px] text-on-surface-variant">{{ t.dashPatNoResults }}</p>
                <button type="button"
                    class="mt-3 min-h-9 cursor-pointer rounded-full bg-primary px-4 text-[12px] font-bold text-on-primary"
                    @click="search = ''; tagFilter = 'all'">
                    {{ t.dashPatClear }}
                </button>
            </div>

            <ul v-else class="mt-3 divide-y divide-outline-variant/15">
                <li v-for="c in filtered" :key="c.id">
                    <button type="button" :aria-pressed="selectedId === c.id"
                        class="grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-xl px-2 py-3 text-start transition-colors hover:bg-surface-container-low aria-pressed:bg-primary/10 md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                        @click="selectedId = c.id">
                        <span class="row-span-2 grid h-10 w-10 place-items-center rounded-full bg-sage/45 text-[15px] font-bold text-on-surface md:row-span-1" aria-hidden="true">{{ initial(c.name) }}</span>
                        <span class="min-w-0">
                            <span class="block truncate text-[13px] font-bold text-on-surface">{{ c.name }}</span>
                            <span class="block font-latin text-[11px] text-on-surface-variant">{{ c.fileNo }}</span>
                        </span>
                        <span dir="ltr" class="hidden truncate text-end text-[12px] tabular-nums text-on-surface-variant md:block md:text-start">{{ c.phone }}</span>
                        <span class="hidden text-[12px] text-on-surface-variant md:block">{{ showDate(c.lastVisit) }}</span>
                        <span class="justify-self-end">
                            <span v-if="c.tag"
                                class="inline-flex w-fit items-center rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-semibold text-on-secondary-container">{{ tagLabel(c.tag) }}</span>
                        </span>
                    </button>
                </li>
            </ul>
        </section>

        <aside class="min-w-0 rounded-card border border-outline-variant/25 bg-white p-4 shadow-card sm:p-5 xl:sticky xl:top-24"
            :aria-label="t.dashPatDetail">
            <p v-if="!selected" class="rounded-xl bg-surface-container-low p-6 text-center text-[13px] text-on-surface-variant">
                {{ t.dashPatSelect }}
            </p>

            <template v-else>
                <div class="flex items-center gap-3">
                    <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sage/45 text-[20px] font-bold text-on-surface" aria-hidden="true">{{ initial(selected.name) }}</span>
                    <div class="min-w-0">
                        <h3 class="truncate text-[16px] font-bold text-on-surface">{{ selected.name }}</h3>
                        <p class="font-latin text-[12px] text-on-surface-variant">{{ selected.fileNo }}</p>
                        <p dir="ltr" class="text-start text-[12px] tabular-nums text-on-surface-variant">{{ selected.phone }}</p>
                    </div>
                </div>

                <dl class="mt-4 grid grid-cols-2 gap-2">
                    <div class="rounded-xl bg-sage/35 p-3">
                        <dt class="text-[11px] text-on-surface-variant">{{ t.dashPatVisits }}</dt>
                        <dd class="mt-0.5 text-[20px] font-extrabold tabular-nums text-on-surface">{{ nf.format(visits) }}</dd>
                    </div>
                    <div class="rounded-xl bg-primary/15 p-3">
                        <dt class="text-[11px] text-on-surface-variant">{{ t.dashPatUpcoming }}</dt>
                        <dd class="mt-0.5 text-[20px] font-extrabold tabular-nums text-on-surface">{{ nf.format(upcoming) }}</dd>
                    </div>
                </dl>

                <section v-if="selected.allergy" class="mt-4 rounded-xl border border-outline-variant/25 p-3">
                    <h4 class="flex items-center gap-1.5 text-[12px] font-bold text-on-surface">
                        <span class="material-symbols-outlined text-[16px]" aria-hidden="true">warning</span>
                        {{ t.dashPatAllergy }}
                    </h4>
                    <p class="mt-1 text-[13px] text-on-surface-variant">{{ selected.allergy }}</p>
                </section>

                <section v-if="selected.notes" class="mt-3 rounded-xl border border-outline-variant/25 p-3">
                    <h4 class="text-[12px] font-bold text-on-surface">{{ t.dashPatNotes }}</h4>
                    <p class="mt-1 text-[13px] text-on-surface-variant">{{ selected.notes }}</p>
                </section>

                <section class="mt-4">
                    <h4 class="text-[12px] font-bold text-on-surface">{{ t.dashPatHistory }}</h4>
                    <p v-if="!history.length" class="mt-2 text-[12px] text-on-surface-variant">{{ t.dashPatNoHistory }}</p>
                    <ol v-else class="mt-2 space-y-2">
                        <li v-for="b in history.slice(0, 6)" :key="b.id" class="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2">
                            <div class="min-w-0">
                                <p class="truncate text-[12px] font-semibold text-on-surface">{{ b.service || '—' }}</p>
                                <p class="text-[11px] text-on-surface-variant">{{ showDate(b.date) }} · <span class="font-latin tabular-nums">{{ b.time }}</span></p>
                            </div>
                            <StatusPill :status="b.status" />
                        </li>
                    </ol>
                </section>
            </template>
        </aside>
    </div>
</template>
