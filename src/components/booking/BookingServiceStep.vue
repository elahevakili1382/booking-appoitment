<script setup lang="ts">
import { computed, ref } from 'vue'

import type {
    BookingService,
    BookingDoctor,
} from '../../types/booking'

const props = defineProps<{
    services: BookingService[]
    doctors: BookingDoctor[]
    serviceId: string
    staffId: string
    isFa: boolean
    loading: boolean
    hasError: boolean

    // برای سازگاری با والد قبلی حفظ شده است؛
    // انتخابگر جدید عکس بزرگ نمایش نمی‌دهد.
    images?: Record<string, string>

    labels: {
        loading: string
        loadError: string
        retry: string
        noServices: string
        doctor: string
        noDoctor: string
    }
}>()

const emit = defineEmits<{
    'update:serviceId': [value: string]
    'update:staffId': [value: string]
    retry: []
}>()

const editingService = ref(false)
const search = ref('')
const selectedCategory = ref('all')

const selectedService = computed(() =>
    props.services.find((item) => item.id === props.serviceId),
)

const showServicePicker = computed(() =>
    editingService.value || !selectedService.value,
)

const categoryLabels: Record<string, { fa: string; en: string }> = {
    skin: {
        fa: 'پوست',
        en: 'Skin',
    },
    injectables: {
        fa: 'تزریقات',
        en: 'Injectables',
    },
    laser: {
        fa: 'لیزر',
        en: 'Laser',
    },
    hair: {
        fa: 'مو',
        en: 'Hair',
    },
    packages: {
        fa: 'پکیج‌ها',
        en: 'Packages',
    },
    body: {
        fa: 'بدن',
        en: 'Body',
    },
    beauty: {
        fa: 'زیبایی',
        en: 'Beauty',
    },
}

const categories = computed(() =>
    [...new Set(
        props.services
            .map((item) => item.category)
            .filter((item): item is string => Boolean(item)),
    )],
)

function text(fa: string, en: string) {
    return props.isFa ? fa : en
}

function formatNumber(value: number) {
    return Number(value).toLocaleString(
        props.isFa ? 'fa-IR' : 'en-US',
    )
}

function serviceName(item: BookingService) {
    return props.isFa
        ? item.titleFa
        : item.titleEn || item.titleFa
}

function doctorName(item: BookingDoctor) {
    return props.isFa
        ? item.nameFa
        : item.nameEn || item.nameFa
}

function categoryName(category: string) {
    const label = categoryLabels[category]

    if (!label) return category

    return props.isFa ? label.fa : label.en
}

function priceLabel(item: BookingService) {
    const value = Number(item.price)

    if (!Number.isFinite(value) || value <= 0) {
        return text('پس از مشاوره', 'After consultation')
    }

    return [
        text('شروع از', 'From'),
        formatNumber(value),
        text('تومان', 'toman'),
    ].join(' ')
}

function durationLabel(item: BookingService) {
    const value = Number(item.duration)

    if (!Number.isFinite(value) || value <= 0) {
        return ''
    }

    return `${formatNumber(value)} ${text('دقیقه', 'min')}`
}

function normalize(value: string) {
    return value
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/\u200c/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .trim()
}

const filteredServices = computed(() => {
    const query = normalize(search.value)

    return props.services.filter((item) => {
        const matchesCategory =
            selectedCategory.value === 'all' ||
            item.category === selectedCategory.value

        const searchableText = normalize([
            item.titleFa,
            item.titleEn,
            item.category ? categoryName(item.category) : '',
        ].filter(Boolean).join(' '))

        return matchesCategory && (
            !query || searchableText.includes(query)
        )
    })
})

function chooseService(item: BookingService) {
    emit('update:serviceId', item.id)
    editingService.value = false
    search.value = ''
    selectedCategory.value = 'all'
}

function openServicePicker() {
    search.value = ''
    selectedCategory.value = 'all'
    editingService.value = true
}

function cancelServiceChange() {
    editingService.value = false
    search.value = ''
    selectedCategory.value = 'all'
}

function resetFilters() {
    search.value = ''
    selectedCategory.value = 'all'
}
</script>

<template>
    <div class="min-w-0">
        <!-- بارگذاری -->
        <p v-if="loading" role="status" class="py-8 text-center text-sm text-on-surface-variant">
            {{ labels.loading }}
        </p>

        <!-- خطای دریافت -->
        <div v-else-if="hasError" role="alert" class="rounded-xl bg-red-50 p-4 text-sm">
            <p>{{ labels.loadError }}</p>

            <button type="button" class="mt-3 min-h-11 px-3 font-semibold text-primary" @click="emit('retry')">
                {{ labels.retry }}
            </button>
        </div>

        <template v-else>
            <!-- خلاصه خدمت انتخاب‌شده -->
            <section v-if="selectedService && !showServicePicker" aria-labelledby="selected-booking-service"
                class="rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="text-xs leading-6 text-on-surface-variant">
                            {{ text('خدمت انتخاب‌شده', 'Selected service') }}
                        </p>

                        <h2 id="selected-booking-service"
                            class="mt-1 break-words text-lg font-bold leading-8 text-on-surface">
                            {{ serviceName(selectedService) }}
                        </h2>
                    </div>

                    <span aria-hidden="true"
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                        <Icon name="ph:check" class="h-5 w-5" />
                    </span>
                </div>

                <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs leading-7 text-on-surface-variant">
                    <span v-if="durationLabel(selectedService)">
                        {{ durationLabel(selectedService) }}
                    </span>

                    <span>{{ priceLabel(selectedService) }}</span>
                </div>

                <button type="button"
                    class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    @click="openServicePicker">
                    <Icon name="ph:arrows-clockwise" class="h-4 w-4" />

                    {{ text('تغییر خدمت', 'Change service') }}
                </button>
            </section>

            <!-- انتخابگر خدمات -->
            <section v-if="showServicePicker" aria-labelledby="booking-service-picker-title">
                <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 id="booking-service-picker-title" class="text-base font-bold leading-8 text-on-surface">
                        {{ text('انتخاب خدمت', 'Choose a service') }}
                    </h2>

                    <button v-if="selectedService" type="button"
                        class="min-h-10 rounded-lg px-3 text-xs font-semibold text-primary"
                        @click="cancelServiceChange">
                        {{ text('حفظ انتخاب قبلی', 'Keep current selection') }}
                    </button>
                </div>

                <label class="block">
                    <span class="sr-only">
                        {{ text('جست‌وجوی خدمات', 'Search services') }}
                    </span>

                    <input v-model="search" type="search" aria-controls="booking-service-options"
                        :placeholder="text('نام خدمت را جست‌وجو کنید…', 'Search for a service…')"
                        class="min-h-12 w-full rounded-xl border border-outline-variant/30 bg-white px-3 text-base text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                </label>

                <!-- فیلتر موضوعی -->
                <div v-if="categories.length > 1" class="mt-3 flex flex-wrap gap-2"
                    :aria-label="text('دسته‌بندی خدمات', 'Service categories')">
                    <button type="button" :aria-pressed="selectedCategory === 'all'"
                        class="min-h-10 rounded-full border px-3 py-2 text-xs" :class="selectedCategory === 'all'
                                ? 'border-primary bg-primary text-on-primary'
                                : 'border-outline-variant/30 bg-white text-on-surface-variant'
                            " @click="selectedCategory = 'all'">
                        {{ text('همه', 'All') }}
                    </button>

                    <button v-for="category in categories" :key="category" type="button"
                        :aria-pressed="selectedCategory === category"
                        class="min-h-10 rounded-full border px-3 py-2 text-xs" :class="selectedCategory === category
                                ? 'border-primary bg-primary text-on-primary'
                                : 'border-outline-variant/30 bg-white text-on-surface-variant'
                            " @click="selectedCategory = category">
                        {{ categoryName(category) }}
                    </button>
                </div>

                <p aria-live="polite" class="mb-3 mt-4 text-xs leading-6 text-on-surface-variant">
                    {{ formatNumber(filteredServices.length) }}
                    {{ text('خدمت', 'services') }}
                </p>

                <!-- فهرست کوتاه و بدون عکس‌های بزرگ -->
                <div id="booking-service-options" class="max-h-96 space-y-2 overflow-y-auto p-1">
                    <button v-for="item in filteredServices" :key="item.id" type="button"
                        :aria-pressed="serviceId === item.id"
                        class="flex w-full items-start gap-3 rounded-xl border p-3 text-start focus-visible:outline-2 focus-visible:outline-primary sm:p-4"
                        :class="serviceId === item.id
                                ? 'border-primary bg-primary/5'
                                : 'border-outline-variant/25 bg-white hover:border-primary/40'
                            " @click="chooseService(item)">
                        <span aria-hidden="true"
                            class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border" :class="serviceId === item.id
                                    ? 'border-primary bg-primary text-on-primary'
                                    : 'border-outline-variant/50'
                                ">
                            <Icon v-if="serviceId === item.id" name="ph:check" class="h-3 w-3" />
                        </span>

                        <span class="min-w-0 flex-1">
                            <span class="block break-words text-sm font-semibold leading-7 text-on-surface">
                                {{ serviceName(item) }}
                            </span>

                            <span class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-6 text-on-surface-variant">
                                <span v-if="durationLabel(item)">
                                    {{ durationLabel(item) }}
                                </span>

                                <span>{{ priceLabel(item) }}</span>
                            </span>
                        </span>
                    </button>

                    <div v-if="!filteredServices.length"
                        class="rounded-xl border border-dashed border-outline-variant/30 p-5 text-center">
                        <p class="text-sm leading-7 text-on-surface-variant">
                            {{
                                services.length
                                    ? text('خدمتی با این مشخصات پیدا نشد.', 'No matching services found.')
                                    : labels.noServices
                            }}
                        </p>

                        <button v-if="services.length" type="button"
                            class="mt-3 min-h-10 px-3 text-sm font-semibold text-primary" @click="resetFilters">
                            {{ text('پاک‌کردن فیلترها', 'Clear filters') }}
                        </button>
                    </div>
                </div>
            </section>

            <!-- پزشکان فقط بعد از انتخاب و بستن انتخابگر -->
            <fieldset v-if="selectedService && !showServicePicker" class="mt-6 min-w-0">
                <legend class="mb-3 text-sm font-bold text-on-surface">
                    {{ labels.doctor }}
                </legend>

                <div class="grid gap-2">
                    <button v-for="item in doctors" :key="item.id" type="button" :aria-pressed="staffId === item.id"
                        class="flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-start text-sm focus-visible:outline-2 focus-visible:outline-primary"
                        :class="staffId === item.id
                                ? 'border-primary bg-primary/5 font-semibold text-primary'
                                : 'border-outline-variant/30 text-on-surface'
                            " @click="emit('update:staffId', item.id)">
                        <span aria-hidden="true"
                            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border" :class="staffId === item.id
                                    ? 'border-primary bg-primary text-on-primary'
                                    : 'border-outline-variant/50'
                                ">
                            <Icon v-if="staffId === item.id" name="ph:check" class="h-3 w-3" />
                        </span>

                        <span class="min-w-0 break-words">
                            {{ doctorName(item) }}
                        </span>
                    </button>
                </div>

                <p v-if="!doctors.length" class="mt-3 text-sm leading-7 text-on-surface-variant">
                    {{ labels.noDoctor }}
                </p>
            </fieldset>
        </template>
    </div>
</template>