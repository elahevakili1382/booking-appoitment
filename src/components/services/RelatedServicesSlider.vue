<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { A11y, Keyboard } from 'swiper/modules'
import type { Swiper as SwiperInstance } from 'swiper'

import { bookingImages } from '../../data/bookingImages'

import 'swiper/css'

interface RelatedService {
    id: string
    titleFa: string
    category: string
    descriptionFa?: string
    duration: number
    price: number
    imageUrl?: string
}

const props = defineProps<{
    services: RelatedService[]
}>()

const swiperInstance = shallowRef<SwiperInstance | null>(null)
const isBeginning = ref(true)
const isEnd = ref(false)
const isLocked = ref(true)
const failedImages = ref<Record<string, boolean>>({})

const modules = [A11y, Keyboard]

const breakpoints = {
    480: {
        slidesPerView: 1.45,
        spaceBetween: 16,
    },
    640: {
        slidesPerView: 2,
        spaceBetween: 20,
    },
    1024: {
        slidesPerView: 3,
        spaceBetween: 24,
    },
}

function syncState(instance: SwiperInstance) {
    if (instance.destroyed) return

    isBeginning.value = instance.isBeginning
    isEnd.value = instance.isEnd
    isLocked.value = instance.isLocked
}

function onSwiper(instance: SwiperInstance) {
    swiperInstance.value = instance
    syncState(instance)
}

function previousSlide() {
    swiperInstance.value?.slidePrev()
}

function nextSlide() {
    swiperInstance.value?.slideNext()
}

function imageFor(service: RelatedService) {
    return service.imageUrl || bookingImages[service.id] || ''
}

function priceLabel(service: RelatedService) {
    const price = Number(service.price)

    return Number.isFinite(price) && price > 0
        ? `${price.toLocaleString('fa-IR')} تومان`
        : 'پس از مشاوره'
}

function durationLabel(service: RelatedService) {
    const duration = Number(service.duration)

    return Number.isFinite(duration) && duration > 0
        ? `${duration.toLocaleString('fa-IR')} دقیقه`
        : 'پس از بررسی'
}

watch(
    () => props.services.map((service) => service.id).join('|'),
    () => {
        failedImages.value = {}
    },
)
</script>

<template>
    <section v-if="services.length" dir="rtl" aria-labelledby="related-services-title"
        class="mt-12 min-w-0 border-t border-outline-variant/20 pt-8 sm:mt-16 sm:pt-10">
        <!-- عنوان و کنترل‌ها -->
        <header class="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
            <div class="min-w-0">
                <p class="text-xs font-medium leading-7 text-primary">
                    بیشتر آشنا شوید
                </p>

                <h2 id="related-services-title" class="mt-1 text-xl font-bold leading-9 text-on-surface sm:text-2xl">
                    خدمات هم‌دسته
                </h2>
            </div>

            <div class="flex items-center gap-3">
                <NuxtLink to="/services"
                    class="inline-flex min-h-11 items-center text-xs font-semibold text-primary sm:text-sm">
                    همه خدمات
                </NuxtLink>

                <div v-if="!isLocked" class="flex items-center gap-2" aria-label="کنترل خدمات هم‌دسته">
                    <button type="button" aria-label="خدمات قبلی" :disabled="isBeginning"
                        class="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-white text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none"
                        @click="previousSlide">
                        <Icon name="ph:caret-right" class="h-5 w-5" />
                    </button>

                    <button type="button" aria-label="خدمات بعدی" :disabled="isEnd"
                        class="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-white text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none"
                        @click="nextSlide">
                        <Icon name="ph:caret-left" class="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>

        <!-- رندر تعاملی پس از آماده‌شدن کلاینت -->
        <ClientOnly>
            <Swiper :key="services.map(service => service.id).join('|')" dir="rtl" :modules="modules"
                :slides-per-view="1.08" :space-between="14" :breakpoints="breakpoints" :watch-overflow="true"
                :grab-cursor="true" :keyboard="{ enabled: true, onlyInViewport: true }" :a11y="{
                    enabled: true,
                    prevSlideMessage: 'خدمات قبلی',
                    nextSlideMessage: 'خدمات بعدی',
                    containerMessage: 'خدمات هم‌دسته',
                }" class="w-full min-w-0" @swiper="onSwiper" @slide-change="syncState" @resize="syncState"
                @breakpoint="syncState" @lock="syncState" @unlock="syncState">
                <SwiperSlide v-for="service in services" :key="service.id" class="!h-auto pb-2">
                    <article
                        class="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-white">
                        <NuxtLink :to="`/services/${service.id}`" :aria-label="`مشاهده ${service.titleFa}`"
                            class="block overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary">
                            <div class="aspect-[16/10] bg-primary/5">
                                <NuxtImg v-if="imageFor(service) && !failedImages[service.id]" :src="imageFor(service)"
                                    alt="" width="640" height="400" format="webp" loading="lazy"
                                    class="block h-full w-full object-cover" @error="failedImages[service.id] = true" />

                                <div v-else aria-hidden="true"
                                    class="flex h-full items-center justify-center text-primary/40">
                                    <Icon name="ph:sparkle" class="h-10 w-10" />
                                </div>
                            </div>
                        </NuxtLink>

                        <div class="flex flex-1 flex-col p-4 sm:p-5">
                            <h3 class="break-words text-base font-bold leading-8 text-on-surface sm:text-lg">
                                <NuxtLink :to="`/services/${service.id}`">
                                    {{ service.titleFa }}
                                </NuxtLink>
                            </h3>

                            <p v-if="
                                service.descriptionFa &&
                                service.descriptionFa !== service.titleFa
                            " class="mt-2 line-clamp-2 text-sm leading-7 text-on-surface-variant">
                                {{ service.descriptionFa }}
                            </p>

                            <div class="mt-auto pt-5">
                                <div
                                    class="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/20 pt-4 text-xs leading-6">
                                    <span class="text-on-surface-variant">
                                        {{ durationLabel(service) }}
                                    </span>

                                    <span class="font-semibold text-primary">
                                        {{ priceLabel(service) }}
                                    </span>
                                </div>

                                <NuxtLink :to="`/services/${service.id}`"
                                    class="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                                    <span>جزئیات خدمت</span>
                                    <Icon name="ph:arrow-left" class="h-4 w-4 shrink-0" aria-hidden="true" />
                                </NuxtLink>
                            </div>
                        </div>
                    </article>
                </SwiperSlide>
            </Swiper>

            <!-- جایگزین غیرتعاملی هنگام SSR -->
            <template #fallback>
                <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <li v-for="service in services.slice(0, 3)" :key="service.id"
                        class="rounded-2xl border border-outline-variant/20 bg-white p-5">
                        <NuxtLink :to="`/services/${service.id}`"
                            class="block min-h-11 text-sm font-semibold leading-8 text-primary">
                            {{ service.titleFa }}
                        </NuxtLink>
                    </li>
                </ul>
            </template>
        </ClientOnly>
    </section>
</template>