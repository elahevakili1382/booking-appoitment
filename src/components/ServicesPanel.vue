<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'
import { bookingImages } from '../data/bookingImages'
import type { ServiceLite } from '../composables/useBookingStats'

const props = defineProps<{
    services: ServiceLite[]
    loading?: boolean
}>()

const { t, locale } = useLanguage()
const isFa = computed(() => locale.value === 'fa')
const nf = computed(() => new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US'))

const category = ref('all')
const search = ref('')

const categoryLabels = computed<Record<string, string>>(() => ({
    skin: t.value.dashSvcCatSkin,
    injectables: t.value.dashSvcCatInjectables,
    laser: t.value.dashSvcCatLaser,
    hair: t.value.dashSvcCatHair,
    packages: t.value.dashSvcCatPackages,
}))
const labelOf = (c?: string) => (c ? (categoryLabels.value[c] ?? c) : '')

const titleOf = (s: ServiceLite) => (isFa.value ? s.titleFa : s.titleEn) || s.titleFa || s.titleEn

/** دسته‌ها به ترتیب اولین ظهور در داده، با شمار هر دسته */
const tabs = computed(() => {
    const order: string[] = []
    const counts = new Map<string, number>()
    for (const s of props.services) {
        const c = s.category || 'other'
        if (!counts.has(c)) order.push(c)
        counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    return [
        { id: 'all', label: t.value.dashSvcAll, count: props.services.length },
        ...order.map((c) => ({ id: c, label: c === 'other' ? t.value.dashSvcCatOther : labelOf(c), count: counts.get(c) ?? 0 })),
    ]
})

const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return props.services.filter((s) => {
        if (category.value !== 'all' && (s.category || 'other') !== category.value) return false
        if (!q) return true
        return `${s.titleFa} ${s.titleEn}`.toLowerCase().includes(q)
    })
})

const imageOf = (id: string) => bookingImages[id] ?? '/services/service-01.jpg'
const priceLabel = (s: ServiceLite) => (s.price > 0 ? `${nf.value.format(s.price)} ${t.value.toman}` : t.value.dashSvcFree)
</script>

<template>
    <section class="min-w-0 space-y-4" :aria-label="t.dashServicesTitle">
        <header class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="text-[20px] font-bold text-on-surface">{{ t.dashServicesTitle }}</h2>
            <p class="text-[12px] text-on-surface-variant" aria-live="polite">{{ nf.format(filtered.length) }} {{ t.dashSvcCountUnit }}</p>
        </header>

        <div class="flex flex-wrap items-center gap-2">
            <div class="flex flex-wrap items-center gap-1.5" role="group" :aria-label="t.dashSvcFilterLabel">
                <button v-for="tab in tabs" :key="tab.id" type="button" :aria-pressed="category === tab.id"
                    class="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors"
                    :class="category === tab.id ? 'bg-primary text-on-primary' : 'bg-sage/35 text-on-surface hover:bg-sage/60'"
                    @click="category = tab.id">
                    {{ tab.label }}
                    <span class="rounded-full bg-white/60 px-1.5 text-[10px] tabular-nums"
                        :class="category === tab.id ? 'text-on-surface' : ''">{{ nf.format(tab.count) }}</span>
                </button>
            </div>
            <div class="relative ms-auto min-w-0 basis-full sm:basis-60">
                <span class="material-symbols-outlined pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" aria-hidden="true">search</span>
                <input v-model="search" type="search" :aria-label="t.dashSvcSearch" :placeholder="t.dashSvcSearch"
                    class="h-10 w-full rounded-full border border-outline-variant/30 bg-white pe-3 ps-10 text-[13px] outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
        </div>

        <ul v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
            <li v-for="i in 4" :key="i" class="h-64 animate-pulse rounded-card bg-surface-container motion-reduce:animate-none" />
        </ul>

        <p v-else-if="!services.length"
            class="rounded-card bg-surface-container-low p-8 text-center text-[13px] text-on-surface-variant">
            {{ t.dashSvcEmpty }}
        </p>

        <div v-else-if="!filtered.length" class="rounded-card bg-surface-container-low p-8 text-center">
            <p class="text-[13px] text-on-surface-variant">{{ t.dashSvcNoResults }}</p>
            <button type="button" class="mt-3 min-h-9 cursor-pointer rounded-full bg-primary px-4 text-[12px] font-bold text-on-primary"
                @click="category = 'all'; search = ''">{{ t.dashSvcClear }}</button>
        </div>

        <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <li v-for="s in filtered" :key="s.id">
                <article
                    class="h-full overflow-hidden rounded-card border border-outline-variant/25 bg-white shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:transform-none"
                    :class="s.active === false ? 'opacity-70' : ''">
                    <div class="relative aspect-[4/3] overflow-hidden bg-surface-container">
                        <NuxtImg :src="imageOf(s.id)" alt="" class="h-full w-full object-cover" format="webp" width="520" loading="lazy" />
                        <span v-if="s.category"
                            class="glass absolute start-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-on-surface">{{ labelOf(s.category) }}</span>
                        <span v-if="s.active === false"
                            class="absolute end-3 top-3 rounded-full bg-on-surface/80 px-2.5 py-1 text-[11px] font-semibold text-white">{{ t.dashSvcInactive }}</span>
                    </div>
                    <div class="p-4">
                        <h3 class="text-[14px] font-bold leading-snug text-on-surface">{{ titleOf(s) }}</h3>
                        <ul class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-on-surface-variant">
                            <li class="inline-flex items-center gap-1">
                                <span class="material-symbols-outlined text-[16px]" aria-hidden="true">schedule</span>
                                {{ nf.format(s.duration) }} {{ t.dashSvcMin }}
                            </li>
                            <li class="inline-flex items-center gap-1">
                                <span class="material-symbols-outlined text-[16px]" aria-hidden="true">{{ s.location === 'online' ? 'videocam' : 'location_on' }}</span>
                                {{ s.location === 'online' ? t.dashSvcOnline : t.dashSvcClinic }}
                            </li>
                        </ul>
                        <p class="mt-3 text-[15px] font-extrabold tabular-nums text-on-surface">{{ priceLabel(s) }}</p>
                    </div>
                </article>
            </li>
        </ul>
    </section>
</template>
