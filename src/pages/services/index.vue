<script setup lang="ts">
import { bookingImages } from '../../data/bookingImages'

interface Service {
    id: string
    category: string
    titleFa: string
    titleEn?: string
    descriptionFa?: string
    descriptionEn?: string
    price: number
    duration: number
    imageUrl?: string
}

interface ServicesResponse {
    ok: boolean
    data: Service[]
}

const { data, status, error, refresh } = await useAsyncData(
    'services-page',
    () => $fetch<ServicesResponse>('/api/services'),
)

const locale = useCookie<string>('lumina-locale', {
    default: () => 'fa',
})

const isFa = computed(() => locale.value !== 'en')

const search = ref('')
const selectedCategory = ref('all')
const failedImages = ref<Record<string, boolean>>({})

const services = computed(() => data.value?.data ?? [])

const categoryLabels: Record<string, { fa: string; en: string }> = {
    skin: {
        fa: 'پوست و جوان‌سازی',
        en: 'Skin & Rejuvenation',
    },
    injectables: {
        fa: 'تزریقات زیبایی',
        en: 'Injectables',
    },
    packages: {
        fa: 'پکیج‌های مراقبتی',
        en: 'Care Packages',
    },
    hair: {
        fa: 'پوست سر و مو',
        en: 'Scalp & Hair',
    },
    laser: {
        fa: 'لیزر',
        en: 'Laser',
    },
    body: {
        fa: 'بدن و تناسب اندام',
        en: 'Body Care',
    },
    beauty: {
        fa: 'زیبایی و مراقبت',
        en: 'Beauty & Care',
    },
}

const categories = computed(() =>
    [...new Set(services.value.map((service) => service.category))]
        .filter(Boolean),
)

function categoryLabel(category: string) {
    const label = categoryLabels[category]

    return label
        ? (isFa.value ? label.fa : label.en)
        : category
}

function serviceTitle(service: Service) {
    return isFa.value
        ? service.titleFa
        : service.titleEn || service.titleFa
}

function serviceDescription(service: Service) {
    const description = (
        isFa.value
            ? service.descriptionFa
            : service.descriptionEn || service.descriptionFa
    )?.trim()

    const title = serviceTitle(service).trim()

    if (description && description !== title) {
        return description
    }

    return isFa.value
        ? 'برای آشنایی با این خدمت، جزئیات را بررسی کنید یا برای مشاوره نوبت بگیرید.'
        : 'Explore the service details or book a consultation to discuss your options.'
}

function serviceImage(service: Service) {
    return service.imageUrl || bookingImages[service.id] || ''
}

function onImageError(id: string) {
    failedImages.value[id] = true
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

    return services.value.filter((service) => {
        const matchesCategory =
            selectedCategory.value === 'all' ||
            service.category === selectedCategory.value

        const searchableText = normalize(
            [
                service.titleFa,
                service.titleEn,
                service.descriptionFa,
                service.descriptionEn,
                categoryLabel(service.category),
            ]
                .filter(Boolean)
                .join(' '),
        )

        const matchesSearch =
            !query || searchableText.includes(query)

        return matchesCategory && matchesSearch
    })
})

function formatNumber(value: number) {
    return Number(value).toLocaleString(
        isFa.value ? 'fa-IR' : 'en-US',
    )
}

function hasPrice(service: Service) {
    const value = Number(service.price)
    return Number.isFinite(value) && value > 0
}

function durationLabel(service: Service) {
    const value = Number(service.duration)

    if (!Number.isFinite(value) || value <= 0) {
        return isFa.value ? 'پس از بررسی' : 'After assessment'
    }

    const unit = isFa.value ? 'دقیقه' : 'min'

    return `${formatNumber(value)} ${unit}`
}

function resetFilters() {
    search.value = ''
    selectedCategory.value = 'all'
}

async function retryServices() {
    failedImages.value = {}
    await refresh()
}

useSeoMeta({
    title: () =>
        isFa.value
            ? 'خدمات کلینیک | Lumina Clinic'
            : 'Services | Lumina Clinic',

    description: () =>
        isFa.value
            ? 'خدمات کلینیک لومینا را همراه با تصاویر، معرفی کوتاه، مدت تقریبی جلسه و هزینه اولیه بررسی کنید.'
            : 'Explore Lumina Clinic services, images, estimated durations and starting prices.',
})
</script>

<template>
    <section :dir="isFa ? 'rtl' : 'ltr'" aria-labelledby="services-title"
        class="px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
        <div class="mx-auto w-full max-w-6xl">
            <!-- عنوان صفحه -->
            <header class="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
                <p class="text-xs font-medium leading-7 text-primary sm:text-sm">
                    {{ isFa ? 'مراقبت در کلینیک لومینا' : 'CARE AT LUMINA CLINIC' }}
                </p>

                <h1 id="services-title"
                    class="mt-2 break-words text-2xl font-bold leading-normal text-on-surface sm:text-3xl lg:text-4xl">
                    {{ isFa ? 'خدمات کلینیک' : 'Our Services' }}
                </h1>

                <p class="mx-auto mt-3 max-w-lg text-sm leading-8 text-on-surface-variant">
                    {{
                        isFa
                            ? 'خدمات ما را بشناسید و برای انتخاب مراقبت متناسب با نیازتان، نوبت مشاوره بگیرید.'
                            : 'Explore our services and book a consultation to find care suited to your needs.'
                    }}
                </p>

                <span aria-hidden="true" class="mx-auto mt-5 block h-1 w-10 rounded-full bg-primary/60" />
            </header>

            <!-- جست‌وجو و فیلتر -->
            <div class="mb-7 sm:mb-9">
                <label class="relative mx-auto block max-w-lg">
                    <span class="sr-only">
                        {{ isFa ? 'جست‌وجوی خدمات' : 'Search services' }}
                    </span>

                    <input v-model="search" type="search" aria-controls="services-results" :placeholder="isFa
                        ? 'جست‌وجوی نام خدمت…'
                        : 'Search services…'
                        "
                        class="min-h-12 w-full rounded-2xl border border-outline-variant/30 bg-white px-4 py-3 text-base text-on-surface outline-none placeholder:text-on-surface-variant/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20">
                </label>

                <div class="mt-5 flex flex-wrap justify-center gap-2" :aria-label="isFa
                    ? 'دسته‌بندی خدمات'
                    : 'Service categories'
                    ">
                    <button type="button" :aria-pressed="selectedCategory === 'all'"
                        class="min-h-11 max-w-full rounded-full border px-4 py-2 text-xs font-medium leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none sm:text-sm"
                        :class="selectedCategory === 'all'
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-outline-variant/30 bg-white text-on-surface-variant hover:border-primary/50'
                            " @click="selectedCategory = 'all'">
                        {{ isFa ? 'همه خدمات' : 'All services' }}
                    </button>

                    <button v-for="category in categories" :key="category" type="button"
                        :aria-pressed="selectedCategory === category"
                        class="min-h-11 max-w-full rounded-full border px-4 py-2 text-xs font-medium leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none sm:text-sm"
                        :class="selectedCategory === category
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-outline-variant/30 bg-white text-on-surface-variant hover:border-primary/50'
                            " @click="selectedCategory = category">
                        {{ categoryLabel(category) }}
                    </button>
                </div>
            </div>

            <div id="services-results" :aria-busy="status === 'pending'">
                <!-- بارگذاری -->
                <p v-if="status === 'pending'" role="status" class="py-16 text-center text-sm text-on-surface-variant">
                    {{ isFa ? 'در حال دریافت خدمات…' : 'Loading services…' }}
                </p>

                <!-- خطای دریافت -->
                <div v-else-if="error" role="alert"
                    class="rounded-2xl border border-outline-variant/20 bg-white p-6 text-center">
                    <p class="text-sm leading-7 text-on-surface-variant">
                        {{
                            isFa
                                ? 'دریافت خدمات انجام نشد.'
                                : 'Unable to load services.'
                        }}
                    </p>

                    <button type="button"
                        class="mt-4 min-h-11 rounded-xl border border-primary/30 px-5 py-2 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        @click="retryServices">
                        {{ isFa ? 'تلاش دوباره' : 'Try again' }}
                    </button>
                </div>

                <template v-else>
                    <!-- تعداد نتایج -->
                    <p aria-live="polite" class="mb-4 text-xs leading-6 text-on-surface-variant">
                        {{ formatNumber(filteredServices.length) }}
                        {{ isFa ? 'خدمت' : 'services' }}
                    </p>

                    <!-- کارت‌های خدمات -->
                    <div v-if="filteredServices.length"
                        class="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                        <article v-for="service in filteredServices" :key="service.id"
                            class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm">
                            <!-- تصویر مرتبط با خدمت -->
                            <NuxtLink :to="`/services/${service.id}`" :aria-label="isFa
                                ? `مشاهده جزئیات ${serviceTitle(service)}`
                                : `View ${serviceTitle(service)} details`
                                "
                                class="block overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary">
                                <div class="relative aspect-[16/10] w-full overflow-hidden bg-primary/5">
                                    <NuxtImg v-if="
                                        serviceImage(service) &&
                                        !failedImages[service.id]
                                    " :src="serviceImage(service)" alt="" width="640" height="400"
                                        sizes="100vw sm:50vw lg:33vw" format="webp" loading="lazy" decoding="async"
                                        class="block h-full w-full object-cover object-center transition-transform duration-300 motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
                                        @error="onImageError(service.id)" />

                                    <!-- جایگزین عکس ناموجود -->
                                    <div v-else aria-hidden="true"
                                        class="flex h-full w-full items-center justify-center bg-primary/5">
                                        <div
                                            class="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-primary/50">
                                            <Icon name="ph:sparkle" class="h-8 w-8" />
                                        </div>
                                    </div>

                                    <!-- دسته‌بندی روی عکس -->
                                    <span
                                        class="absolute start-3 top-3 max-w-[calc(100%-1.5rem)] break-words rounded-full border border-white/60 bg-white/95 px-3 py-1 text-[11px] font-semibold leading-6 text-primary shadow-sm">
                                        {{ categoryLabel(service.category) }}
                                    </span>
                                </div>
                            </NuxtLink>

                            <!-- محتوای کارت -->
                            <div class="flex flex-1 flex-col p-5 sm:p-6">
                                <h2 class="break-words text-lg font-bold leading-8 text-on-surface">
                                    <NuxtLink :to="`/services/${service.id}`"
                                        class="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                                        {{ serviceTitle(service) }}
                                    </NuxtLink>
                                </h2>

                                <p class="mt-2 break-words text-sm leading-8 text-on-surface-variant">
                                    {{ serviceDescription(service) }}
                                </p>

                                <!-- پایین کارت‌ها هم‌تراز می‌ماند -->
                                <div class="mt-auto pt-5">
                                    <dl
                                        class="flex flex-wrap justify-between gap-x-5 gap-y-4 border-t border-outline-variant/20 pt-4">
                                        <div class="min-w-0">
                                            <dt class="text-xs leading-6 text-on-surface-variant">
                                                {{
                                                    hasPrice(service)
                                                        ? (isFa ? 'هزینه شروع از' : 'Starting price')
                                                        : (isFa ? 'هزینه' : 'Price')
                                                }}
                                            </dt>

                                            <dd
                                                class="mt-1 flex flex-wrap items-baseline gap-1 text-sm font-semibold leading-7 text-on-surface">
                                                <template v-if="hasPrice(service)">
                                                    <span>
                                                        {{ formatNumber(service.price) }}
                                                    </span>

                                                    <span class="text-xs font-normal text-on-surface-variant">
                                                        {{ isFa ? 'تومان' : 'toman' }}
                                                    </span>
                                                </template>

                                                <template v-else>
                                                    {{
                                                        isFa
                                                            ? 'پس از مشاوره'
                                                            : 'After consultation'
                                                    }}
                                                </template>
                                            </dd>
                                        </div>

                                        <div class="min-w-0">
                                            <dt class="text-xs leading-6 text-on-surface-variant">
                                                {{
                                                    isFa
                                                        ? 'مدت تقریبی'
                                                        : 'Estimated duration'
                                                }}
                                            </dt>

                                            <dd class="mt-1 text-sm font-semibold leading-7 text-on-surface">
                                                {{ durationLabel(service) }}
                                            </dd>
                                        </div>
                                    </dl>

                                    <!-- جزئیات و رزرو -->
                                    <div class="mt-5 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                                        <NuxtLink :to="`/services/${service.id}`" :aria-label="isFa
                                            ? `جزئیات ${serviceTitle(service)}`
                                            : `${serviceTitle(service)} details`
                                            "
                                            class="flex min-h-12 items-center justify-center rounded-xl border border-primary/25 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none">
                                            {{ isFa ? 'جزئیات خدمت' : 'View details' }}
                                        </NuxtLink>

                                        <NuxtLink :to="{
                                            path: '/book',
                                            query: { service: service.id },
                                        }" :aria-label="isFa
                                            ? `رزرو ${serviceTitle(service)}`
                                            : `Book ${serviceTitle(service)}`
                                            "
                                            class="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none">
                                            <span>
                                                {{ isFa ? 'رزرو نوبت' : 'Book now' }}
                                            </span>

                                            <Icon :name="isFa
                                                ? 'ph:arrow-left'
                                                : 'ph:arrow-right'
                                                " class="h-4 w-4 shrink-0" aria-hidden="true" />
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>

                    <!-- بدون نتیجه -->
                    <div v-else
                        class="rounded-2xl border border-dashed border-outline-variant/40 bg-white/60 px-5 py-12 text-center">
                        <Icon name="ph:magnifying-glass" class="mx-auto mb-3 h-9 w-9 text-primary/50"
                            aria-hidden="true" />

                        <p class="text-sm leading-8 text-on-surface-variant">
                            {{
                                isFa
                                    ? 'خدمتی با این مشخصات پیدا نشد.'
                                    : 'No matching services found.'
                            }}
                        </p>

                        <button type="button"
                            class="mt-4 min-h-11 rounded-xl border border-primary/30 bg-white px-5 py-2 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                            @click="resetFilters">
                            {{ isFa ? 'نمایش همه خدمات' : 'Show all services' }}
                        </button>
                    </div>
                </template>
            </div>

            <!-- توضیح پایانی -->
            <p v-if="services.length && !error"
                class="mx-auto mt-8 max-w-2xl text-center text-xs leading-7 text-on-surface-variant">
                {{
                    isFa
                        ? 'انتخاب روش، هزینه نهایی و مدت جلسه پس از ارزیابی مشخص می‌شود.'
                        : 'Treatment choice, final cost and session duration are confirmed after assessment.'
                }}
            </p>
        </div>
    </section>
</template>