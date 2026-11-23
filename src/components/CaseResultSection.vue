<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface CaseItem {
    id: string
    treatment: string
    title: string
    description: string
    risk: string
    img: string
}

const cases: CaseItem[] = [
    {
        id: '01',
        treatment: 'فیلر لب',
        title: 'تزریق ژل برای برجسته‌سازی طبیعی لب',
        description: 'با تزریق هدفمند، حجم طبیعی و متقارن به لب‌ها داده می‌شود.',
        risk: 'تورم و کبودی خفیف تا ۳ تا ۵ روز',
        img: '/results/images (30).jpg',
    },
    {
        id: '02',
        treatment: 'لیزر پوست',
        title: 'جوانسازی و یکدست‌سازی رنگ پوست',
        description: 'بهبود لک و افزایش شفافیت پوست با چند جلسه‌ی درمان.',
        risk: 'قرمزی خفیف تا ۲۴ ساعت',
        img: '/results/images (33).jpg',
    },
    {
        id: '03',
        treatment: 'تزریق زیر چشم',
        title: 'رفع تیرگی و افتادگی دور چشم',
        description: 'کاهش گودی و تیرگی دور چشم با روشی کم‌تهاجمی.',
        risk: 'تورم خفیف تا یک هفته',
        img: '/results/images (34).jpg',
    },
]

const autoplay = true
const activeIndex = ref(0)
const containerWidth = ref(1200)
const stageRef = ref<HTMLElement | null>(null)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const total = computed(() => cases.length)
const activeCase = computed<CaseItem>(() => cases[activeIndex.value] ?? cases[0]!)

function calculateGap(width: number) {
    const minWidth = 768
    const maxWidth = 1400
    const minGap = 48
    const maxGap = 86
    if (width <= minWidth) return minGap
    if (width >= maxWidth) return maxGap
    return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
}

function stopAutoplay() {
    if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
    }
}

function startAutoplay() {
    stopAutoplay()
    if (!autoplay || total.value <= 1) return
    autoplayTimer = setInterval(() => {
        activeIndex.value = (activeIndex.value + 1) % total.value
    }, 5000)
}

function next() {
    activeIndex.value = (activeIndex.value + 1) % total.value
    startAutoplay()
}

function prev() {
    activeIndex.value = (activeIndex.value - 1 + total.value) % total.value
    startAutoplay()
}

function goTo(index: number) {
    activeIndex.value = index
    startAutoplay()
}

function getCardStyle(index: number) {
    const gap = calculateGap(containerWidth.value)
    const liftY = gap * 0.45
    const isActive = index === activeIndex.value
    const isPrev = (activeIndex.value - 1 + total.value) % total.value === index
    const isNext = (activeIndex.value + 1) % total.value === index

    if (isActive) {
        return {
            zIndex: 30,
            opacity: 1,
            pointerEvents: 'auto' as const,
            transform: 'translate3d(0px, 0px, 0px) scale(1) rotateY(0deg)',
        }
    }
    if (isPrev) {
        return {
            zIndex: 20,
            opacity: 0.92,
            pointerEvents: 'auto' as const,
            transform: `translate3d(-${gap}px, -${liftY}px, 0px) scale(0.86) rotateY(14deg)`,
        }
    }
    if (isNext) {
        return {
            zIndex: 20,
            opacity: 0.92,
            pointerEvents: 'auto' as const,
            transform: `translate3d(${gap}px, -${liftY}px, 0px) scale(0.86) rotateY(-14deg)`,
        }
    }

    return {
        zIndex: 10,
        opacity: 0,
        pointerEvents: 'none' as const,
        transform: 'translate3d(0px, 20px, 0px) scale(0.8) rotateY(0deg)',
    }
}

function handleResize() {
    if (stageRef.value) {
        containerWidth.value = stageRef.value.offsetWidth
    }
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') prev()
    if (e.key === 'ArrowLeft') next()
}

onMounted(() => {
    handleResize()
    startAutoplay()
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    stopAutoplay()
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <section id="case-results" class="w-full overflow-x-clip bg-white px-page py-16 md:py-24">
        <div class="mx-auto max-w-6xl">
            <!-- هدر -->
            <div class="text-center md:text-start">
                <p class="font-display text-sm tracking-[0.4em] text-muted">RESULTS</p>
                <h2 class="mt-3 font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-bold text-ink">
                    نمونه نتایج درمان
                </h2>
            </div>

            <!-- بدنه اصلی -->
            <div class="mt-12 grid items-center gap-12 md:grid-cols-2 md:gap-14">
                <!-- استیج کارت‌های سه‌بعدی -->
                <div ref="stageRef"
                    class="relative mx-auto flex h-80 w-full max-w-lg items-center justify-center sm:h-96"
                    style="perspective: 1000px">
                    <div v-for="(item, index) in cases" :key="item.id" role="button" tabindex="0"
                        :aria-label="`مشاهده ${item.treatment}`"
                        class="absolute h-72 w-60 cursor-pointer overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition-all duration-700 ease-[cubic-bezier(0.4,2,0.3,1)] will-change-transform sm:h-84 sm:w-72"
                        :style="getCardStyle(index)" @click="goTo(index)" @keydown.enter="goTo(index)">
                        <img :src="item.img" :alt="`قبل و بعد ${item.treatment}`" class="h-full w-full object-cover"
                            loading="lazy" draggable="false" />
                        <span
                            class="absolute bottom-3 inset-s-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-xs">
                            قبل و بعد
                        </span>
                    </div>
                </div>

                <!-- محتوای متنی و کنترل‌ها -->
                <div class="flex flex-col justify-between text-center md:text-start">
                    <Transition name="case-fade" mode="out-in">
                        <div :key="activeCase.id">
                            <p class="text-xs font-bold tracking-wider text-primary">
                                No.{{ activeCase.id }} — {{ activeCase.treatment }}
                            </p>
                            <h3 class="mt-2 font-display text-xl font-bold leading-8 text-ink sm:text-2xl">
                                {{ activeCase.title }}
                            </h3>
                            <p class="mx-auto mt-3 max-w-md text-[14px] leading-8 text-muted md:mx-0">
                                {{ activeCase.description }}
                            </p>
                            <p
                                class="mx-auto mt-4 inline-block rounded-xl bg-surface-container-low px-4 py-2.5 text-[12.5px] text-muted md:mx-0">
                                <span class="font-bold text-ink">احتمال عوارض: </span>
                                {{ activeCase.risk }}
                            </p>
                        </div>
                    </Transition>

                    <!-- دکمه‌های قبلی/بعدی و نقطه‌های نشانگر -->
                    <div class="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div class="flex items-center gap-3">
                            <button type="button" aria-label="نتیجه قبلی"
                                class="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition-colors duration-300 hover:bg-primary"
                                @click="prev">
                                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                            <button type="button" aria-label="نتیجه بعدی"
                                class="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition-colors duration-300 hover:bg-primary"
                                @click="next">
                                <svg viewBox="0 0 24 24" class="h-4 w-4 rotate-180" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <div class="flex items-center gap-2">
                            <button v-for="(item, idx) in cases" :key="item.id" type="button"
                                :aria-label="`رفتن به مورد ${idx + 1}`"
                                class="h-2.5 rounded-full transition-all duration-300"
                                :class="idx === activeIndex ? 'w-7 bg-primary' : 'w-2.5 bg-ink/20 hover:bg-ink/40'"
                                @click="goTo(idx)" />
                        </div>
                    </div>
                </div>
            </div>

            <p class="mt-12 text-center text-[11px] leading-6 text-muted/70">
                تصاویر این بخش جنبه‌ی نمایشی دارند و برای نشان‌دادن طراحی صفحه استفاده شده‌اند؛ محتوای واقعی باید از سوی
                کلینیک و با رضایت بیمار تأمین شود.
            </p>
        </div>
    </section>
</template>

<style scoped>
.case-fade-enter-active,
.case-fade-leave-active {
    transition: opacity 0.28s ease, transform 0.28s ease;
}

.case-fade-enter-from {
    opacity: 0;
    transform: translateY(12px);
}

.case-fade-leave-to {
    opacity: 0;
    transform: translateY(-12px);
}
</style>