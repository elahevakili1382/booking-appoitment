<script setup lang="ts">
import { bookingImages } from '../../data/bookingImages'
import {
    serviceDetails,
    type ServiceContent,
} from '../../data/serviceDetails'
import RelatedServicesSlider from '../../components/services/RelatedServicesSlider.vue'

interface ServiceFaq {
    question: string
    answer: string
}

interface ServiceDetails extends ServiceContent {
    id: string
    category: string
    titleFa: string
    titleEn?: string
    descriptionFa?: string
    descriptionEn?: string
    duration: number
    price: number
    imageUrl?: string
}

interface ServicesResponse {
    ok: boolean
    data: ServiceDetails[]
}

const route = useRoute()

const serviceId = computed(() => {
    const value = route.params.id
    return Array.isArray(value) ? value[0] || '' : String(value || '')
})

const {
    data: service,
    status,
    error,
    refresh,
} = await useAsyncData(
    computed(() => `service-details-${serviceId.value}`),
    async () => {
        const id = serviceId.value

        const response = await $fetch<ServicesResponse>(
            '/api/services',
        )

        if (!response.ok || !Array.isArray(response.data)) {
            throw createError({
                statusCode: 502,
                statusMessage: 'Unable to load service information',
            })
        }

        const item = response.data.find((entry) => entry.id === id)

        if (!item) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Service not found',
            })
        }

        // محتوای عمومی فایل، پایه است.
        // اگر API بعدها فیلد تکمیلی برگرداند، همان فیلد API اولویت دارد.
        return {
            ...(serviceDetails[item.id] || {}),
            ...item,
        }
    },
)

if (error.value?.statusCode === 404) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Service not found',
        message: 'خدمت موردنظر پیدا نشد.',
    })
}

// ───────── Basic information ─────────

const categories: Record<string, string> = {
    skin: 'پوست و جوان‌سازی',
    injectables: 'تزریقات زیبایی',
    laser: 'لیزر',
    hair: 'پوست سر و مو',
    body: 'بدن و تناسب اندام',
    beauty: 'زیبایی و مراقبت',
    packages: 'پکیج‌های مراقبتی',
}

const categoryLabel = computed(() => {
    const category = service.value?.category || ''
    return categories[category] || category || 'خدمات کلینیک'
})

function formatNumber(value: number) {
    return Number(value).toLocaleString('fa-IR')
}

const priceLabel = computed(() => {
    const price = Number(service.value?.price)

    if (!Number.isFinite(price) || price <= 0) {
        return 'پس از مشاوره'
    }

    return `${formatNumber(price)} تومان`
})

const durationLabel = computed(() => {
    const duration = Number(service.value?.duration)

    if (!Number.isFinite(duration) || duration <= 0) {
        return 'پس از بررسی'
    }

    return `${formatNumber(duration)} دقیقه`
})

const intro = computed(() => {
    const description = service.value?.descriptionFa?.trim()
    const title = service.value?.titleFa?.trim()

    // اگر seed فقط عنوان را در description ذخیره کرده، دوباره نمایش نده.
    if (!description || description === title) {
        return 'برای آشنایی با جزئیات این خدمت و بررسی مناسب‌بودن آن برای شما، با کلینیک مشورت کنید.'
    }

    return description
})

const bookingLink = computed(() => ({
    path: '/book',
    query: {
        service: service.value?.id || serviceId.value,
    },
}))

// ───────── Image ─────────

const imageFailed = ref(false)

const imageUrl = computed(() =>
    service.value?.imageUrl ||
    bookingImages[service.value?.id || serviceId.value] ||
    '',
)

watch(imageUrl, () => {
    imageFailed.value = false
})

// ───────── Optional content ─────────

function cleanItems(items?: string[]) {
    if (!Array.isArray(items)) return []

    return items.filter(
        (item): item is string =>
            typeof item === 'string' && item.trim().length > 0,
    )
}

const contentSections = computed(() => {
    const item = service.value
    if (!item) return []

    return [
        {
            id: 'benefits',
            title: 'کاربردها و مزایای مورد انتظار',
            items: cleanItems(item.benefitsFa),
        },
        {
            id: 'suitability',
            title: 'مناسب‌بودن این خدمت',
            items: cleanItems(item.suitableForFa),
        },
        {
            id: 'limitations',
            title: 'محدودیت‌ها و موارد نیازمند بررسی',
            items: cleanItems(item.limitationsFa),
        },
        {
            id: 'procedure',
            title: 'مراحل مراجعه و انجام خدمت',
            items: cleanItems(item.stepsFa),
        },
        {
            id: 'preparation',
            title: 'پیش از مراجعه',
            items: cleanItems(item.preparationFa),
        },
        {
            id: 'aftercare',
            title: 'مراقبت‌های پس از خدمت',
            items: cleanItems(item.aftercareFa),
        },
        {
            id: 'risks',
            title: 'خطرها و عوارض احتمالی',
            items: cleanItems(item.risksFa),
        },
    ].filter((section) => section.items.length > 0)
})

const hasDetailedContent = computed(() =>
    Boolean(
        service.value?.overviewFa?.trim() ||
        service.value?.recoveryFa?.trim() ||
        service.value?.expectedResultsFa?.trim() ||
        contentSections.value.length,
    ),
)

const faqs = computed<ServiceFaq[]>(() => {
    const custom = service.value?.faqs

    if (Array.isArray(custom)) {
        const valid = custom.filter(
            (faq) =>
                typeof faq.question === 'string' &&
                typeof faq.answer === 'string' &&
                faq.question.trim() &&
                faq.answer.trim(),
        )

        if (valid.length) return valid
    }

    return [
        {
            question: 'چطور برای این خدمت نوبت بگیرم؟',
            answer:
                'دکمه «رزرو این خدمت» را انتخاب کنید. در صفحه رزرو، این خدمت از قبل انتخاب می‌شود و می‌توانید مراحل انتخاب پزشک، زمان و ثبت اطلاعات را ادامه دهید.',
        },
        {
            question: 'اگر درباره انتخاب این خدمت مطمئن نباشم چه کار کنم؟',
            answer:
                'پیش از انتخاب نهایی، با کلینیک مشورت کنید. انتخاب خدمت در سایت جایگزین ارزیابی اختصاصی و تأیید مناسب‌بودن روش نیست.',
        },
        {
            question: 'آیا قیمت نمایش‌داده‌شده قطعی است؟',
            answer:
                'اگر قیمت با عنوان «شروع از» نمایش داده شده، مبلغ اولیه است. هزینه نهایی و موارد مشمول آن را پیش از پرداخت از کلینیک تأیید کنید. عبارت «پس از مشاوره» نیز به معنی رایگان‌بودن خدمت نیست.',
        },
    ]
})

// ───────── Related services ─────────

const relatedServices = ref<ServiceDetails[]>([])

async function loadRelatedServices() {
    try {
        const response = await $fetch<ServicesResponse>(
            '/api/services',
        )

        if (!response.ok || !Array.isArray(response.data)) {
            relatedServices.value = []
            return
        }

        relatedServices.value = response.data
            .filter(
                (item) =>
                    item.id !== service.value?.id &&
                    item.category === service.value?.category,
            )
            .slice(0, 8)
    } catch {
        relatedServices.value = []
    }
}

watch(
    () => service.value?.id,
    () => {
        relatedServices.value = []
    },
)

onMounted(loadRelatedServices)

watch(
    () => service.value?.id,
    () => {
        if (import.meta.client) {
            void loadRelatedServices()
        }
    },
)

// ───────── SEO ─────────

useSeoMeta({
    title: () =>
        service.value
            ? `${service.value.titleFa} | کلینیک لومینا`
            : 'جزئیات خدمت | کلینیک لومینا',

    description: () =>
        service.value
            ? `${service.value.titleFa} در کلینیک لومینا؛ معرفی خدمت، اطلاعات مراجعه و رزرو نوبت.`
            : 'معرفی خدمات و رزرو نوبت در کلینیک لومینا.',

    ogTitle: () =>
        service.value
            ? `${service.value.titleFa} | Lumina Clinic`
            : 'Lumina Clinic',

    ogDescription: () =>
        intro.value,
})
</script>

<template>
    <main dir="rtl" class="px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
        <div class="mx-auto w-full max-w-6xl">
            <!-- مسیر صفحه -->
            <nav dir="rtl" aria-label="مسیر صفحه" class="mb-7 min-w-0 sm:mb-9 lg:mb-10">
                <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-7 sm:gap-x-3 sm:text-sm">
                    <!-- خانه -->
                    <li class="shrink-0">
                        <NuxtLink to="/"
                            class="inline-flex min-h-10 items-center rounded-lg px-1 text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                            خانه
                        </NuxtLink>
                    </li>

                    <!-- جداکننده -->
                    <li aria-hidden="true" class="flex shrink-0 items-center text-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="block h-4 w-4"
                            focusable="false">
                            <path d="M14 6L8 12L14 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </li>

                    <!-- خدمات -->
                    <li class="shrink-0">
                        <NuxtLink to="/services"
                            class="inline-flex min-h-10 items-center rounded-lg px-1 text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                            خدمات
                        </NuxtLink>
                    </li>

                    <template v-if="service">
                        <!-- جداکننده -->
                        <li aria-hidden="true" class="flex shrink-0 items-center text-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="block h-4 w-4"
                                focusable="false">
                                <path d="M14 6L8 12L14 18" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </li>

                        <!-- صفحه فعلی -->
                        <li aria-current="page" class="min-w-0 break-words py-1 font-semibold text-on-surface">
                            {{ service.titleFa }}
                        </li>
                    </template>
                </ol>
            </nav>

            <!-- بارگذاری -->
            <div v-if="status === 'pending'" role="status"
                class="rounded-2xl border border-outline-variant/20 bg-white px-5 py-16 text-center text-sm text-on-surface-variant">
                در حال دریافت اطلاعات خدمت…
            </div>

            <!-- خطا -->
            <div v-else-if="error" role="alert"
                class="rounded-2xl border border-outline-variant/20 bg-white p-6 text-center">
                <h1 class="text-xl font-bold text-on-surface">
                    اطلاعات خدمت در دسترس نیست
                </h1>

                <p class="mt-3 text-sm leading-8 text-on-surface-variant">
                    دریافت اطلاعات انجام نشد یا این خدمت دیگر در فهرست فعال نیست.
                </p>

                <div class="mt-5 flex flex-wrap justify-center gap-3">
                    <button type="button"
                        class="min-h-11 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-on-primary"
                        @click="refresh()">
                        تلاش دوباره
                    </button>

                    <NuxtLink to="/services"
                        class="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/25 px-5 py-2 text-sm text-primary">
                        بازگشت به خدمات
                    </NuxtLink>
                </div>
            </div>

            <template v-else-if="service">
                <main dir="rtl" class="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-14">
                    <div class="mx-auto w-full max-w-6xl">
                        <!-- معرفی خدمت -->
                        <section aria-labelledby="service-title"
                            class="grid min-w-0 grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-10">
                            <div class="min-w-0">
                                <span
                                    class="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium leading-7 text-primary">
                                    {{ categoryLabel }}
                                </span>

                                <h1 id="service-title"
                                    class="mt-3 break-words text-2xl font-bold leading-normal text-on-surface sm:mt-4 sm:text-3xl lg:text-4xl">
                                    {{ service.titleFa }}
                                </h1>

                                <p
                                    class="mt-4 whitespace-pre-line text-sm leading-8 text-on-surface-variant sm:text-base">
                                    {{ intro }}
                                </p>

                                <dl class="mt-6 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                                    <div class="rounded-2xl border border-outline-variant/20 bg-white p-4">
                                        <dt class="text-xs leading-6 text-on-surface-variant">
                                            مدت تقریبی جلسه
                                        </dt>

                                        <dd class="mt-2 text-sm font-bold text-on-surface">
                                            {{ durationLabel }}
                                        </dd>
                                    </div>

                                    <div class="rounded-2xl border border-outline-variant/20 bg-white p-4">
                                        <dt class="text-xs leading-6 text-on-surface-variant">
                                            {{ Number(service.price) > 0 ? 'هزینه شروع از' : 'هزینه' }}
                                        </dt>

                                        <dd class="mt-2 text-sm font-bold text-on-surface">
                                            {{ priceLabel }}
                                        </dd>
                                    </div>
                                </dl>

                                <div class="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <NuxtLink :to="bookingLink"
                                        class="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                                        رزرو این خدمت
                                        <span aria-hidden="true">←</span>
                                    </NuxtLink>

                                    <NuxtLink to="/services"
                                        class="inline-flex min-h-12 items-center justify-center rounded-xl border border-primary/25 px-6 py-3 text-sm font-medium text-primary">
                                        مشاهده همه خدمات
                                    </NuxtLink>
                                </div>
                            </div>

                            <div
                                class="aspect-[4/3] min-w-0 overflow-hidden rounded-3xl border border-outline-variant/20 bg-primary/5">
                                <NuxtImg v-if="imageUrl && !imageFailed" :src="imageUrl" :alt="service.titleFa"
                                    width="960" height="720" format="webp" class="block h-full w-full object-cover"
                                    @error="imageFailed = true" />

                                <div v-else
                                    class="flex h-full flex-col items-center justify-center gap-3 text-primary/60">
                                    <Icon name="ph:sparkle" class="h-12 w-12" aria-hidden="true" />

                                    <span class="px-4 text-center text-sm">
                                        {{ service.titleFa }}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <div v-if="service.editorialNoteFa"
                            class="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                            <h2 class="text-sm font-semibold leading-7 text-on-surface">
                                نکته درباره اطلاعات این خدمت
                            </h2>

                            <p class="mt-2 text-sm leading-8 text-on-surface-variant">
                                {{ service.editorialNoteFa }}
                            </p>
                        </div>

                        <!-- جزئیات و خلاصه رزرو -->
                        <div
                            class="mt-8 grid min-w-0 grid-cols-1 items-start gap-6 sm:mt-10 lg:mt-12 lg:grid-cols-3 lg:gap-8">
                            <div class="min-w-0 space-y-5 sm:space-y-6 lg:col-span-2">
                                <!-- معرفی تکمیلی -->
                                <section v-if="service.overviewFa?.trim()"
                                    class="rounded-2xl border border-outline-variant/20 bg-white p-5 sm:p-6">
                                    <h2 class="text-lg font-bold leading-8 text-on-surface">
                                        درباره {{ service.titleFa }}
                                    </h2>

                                    <p class="mt-3 whitespace-pre-line text-sm leading-8 text-on-surface-variant">
                                        {{ service.overviewFa }}
                                    </p>
                                </section>

                                <!-- بخش‌های دارای محتوای واقعی -->
                                <section v-for="section in contentSections" :id="section.id" :key="section.id"
                                    class="rounded-2xl border border-outline-variant/20 bg-white p-5 sm:p-6">
                                    <h2 class="text-lg font-bold leading-8 text-on-surface">
                                        {{ section.title }}
                                    </h2>

                                    <ol v-if="section.id === 'procedure'"
                                        class="mt-4 list-decimal space-y-3 ps-5 text-sm leading-8 text-on-surface-variant">
                                        <li v-for="(item, index) in section.items" :key="index" class="ps-1">
                                            {{ item }}
                                        </li>
                                    </ol>

                                    <ul v-else
                                        class="mt-4 list-disc space-y-3 ps-5 text-sm leading-8 text-on-surface-variant">
                                        <li v-for="(item, index) in section.items" :key="index" class="ps-1">
                                            {{ item }}
                                        </li>
                                    </ul>
                                </section>

                                <section v-if="service.expectedResultsFa?.trim()"
                                    class="rounded-2xl border border-outline-variant/20 bg-white p-5 sm:p-6">
                                    <h2 class="text-lg font-bold leading-8 text-on-surface">
                                        نتایج مورد انتظار
                                    </h2>

                                    <p class="mt-3 whitespace-pre-line text-sm leading-8 text-on-surface-variant">
                                        {{ service.expectedResultsFa }}
                                    </p>
                                </section>

                                <section v-if="service.recoveryFa?.trim()"
                                    class="rounded-2xl border border-outline-variant/20 bg-white p-5 sm:p-6">
                                    <h2 class="text-lg font-bold leading-8 text-on-surface">
                                        دوره نقاهت و بازگشت به فعالیت
                                    </h2>

                                    <p class="mt-3 whitespace-pre-line text-sm leading-8 text-on-surface-variant">
                                        {{ service.recoveryFa }}
                                    </p>
                                </section>

                                <!-- نبود محتوای تکمیلی -->
                                <section v-if="!hasDetailedContent"
                                    class="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
                                    <h2 class="text-lg font-bold leading-8 text-on-surface">
                                        پیش از انتخاب این خدمت
                                    </h2>

                                    <p class="mt-3 text-sm leading-8 text-on-surface-variant">
                                        جزئیات اختصاصی این خدمت هنوز در سایت منتشر نشده است.
                                        برای بررسی روش انجام، محدودیت‌ها، مراقبت‌ها و هزینه نهایی،
                                        از کلینیک اطلاعات دریافت کنید.
                                    </p>
                                </section>

                                <!-- پرسش‌ها -->
                                <section aria-labelledby="service-faq-title">
                                    <h2 id="service-faq-title"
                                        class="mb-4 text-lg font-bold leading-8 text-on-surface sm:text-xl">
                                        پرسش‌های مربوط به این خدمت
                                    </h2>

                                    <div class="space-y-3">
                                        <details v-for="(faq, index) in faqs" :key="index"
                                            class="group rounded-2xl border border-outline-variant/20 bg-white open:border-primary/40">
                                            <summary
                                                class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold leading-7 text-on-surface focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                                                <span class="min-w-0 break-words">
                                                    {{ faq.question }}
                                                </span>

                                                <Icon name="ph:caret-down"
                                                    class="h-4 w-4 shrink-0 text-primary transition-transform group-open:rotate-180 motion-reduce:transition-none"
                                                    aria-hidden="true" />
                                            </summary>

                                            <p class="px-4 pb-5 text-sm leading-8 text-on-surface-variant">
                                                {{ faq.answer }}
                                            </p>
                                        </details>
                                    </div>
                                </section>
                            </div>

                            <!-- خلاصه رزرو -->
                            <aside aria-labelledby="service-booking-title"
                                class="min-w-0 rounded-2xl border border-primary/20 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
                                <p class="text-xs font-medium leading-7 text-primary">
                                    رزرو در کلینیک لومینا
                                </p>

                                <h2 id="service-booking-title"
                                    class="mt-2 break-words text-lg font-bold leading-8 text-on-surface">
                                    {{ service.titleFa }}
                                </h2>

                                <dl class="mt-5 space-y-4 text-sm">
                                    <div class="flex flex-wrap justify-between gap-2">
                                        <dt class="text-on-surface-variant">دسته‌بندی</dt>
                                        <dd>{{ categoryLabel }}</dd>
                                    </div>

                                    <div class="flex flex-wrap justify-between gap-2">
                                        <dt class="text-on-surface-variant">مدت تقریبی</dt>
                                        <dd>{{ durationLabel }}</dd>
                                    </div>

                                    <div class="flex flex-wrap justify-between gap-2">
                                        <dt class="text-on-surface-variant">
                                            {{ Number(service.price) > 0 ? 'شروع از' : 'هزینه' }}
                                        </dt>
                                        <dd class="font-semibold text-primary">
                                            {{ priceLabel }}
                                        </dd>
                                    </div>
                                </dl>

                                <NuxtLink :to="bookingLink"
                                    class="mt-6 flex min-h-12 items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary">
                                    <span>انتخاب پزشک و زمان</span>
                                    <span aria-hidden="true">←</span>
                                </NuxtLink>

                                <NuxtLink to="/faq"
                                    class="mt-2 flex min-h-11 items-center justify-center rounded-xl px-3 py-2 text-sm text-primary">
                                    راهنمای رزرو و سؤالات متداول
                                </NuxtLink>

                                <p class="mt-4 text-xs leading-7 text-on-surface-variant">
                                    انتخاب این خدمت در سایت جایگزین ارزیابی اختصاصی نیست.
                                    هزینه نهایی و برنامه مراجعه باید توسط کلینیک تأیید شود.
                                </p>
                            </aside>
                        </div>
                        <RelatedServicesSlider :services="relatedServices" />
                    </div>
                </main>

            </template>
        </div>
    </main>
</template>