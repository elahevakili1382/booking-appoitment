<script setup lang="ts">
const cases = [
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

const trackRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const activeIndex = ref(0)

let observer: IntersectionObserver | null = null
// وضعیت کشیدن با ماوس
let dragging = false
let startX = 0
let startScroll = 0

onMounted(() => {
    if (!trackRef.value) return

    observer = new IntersectionObserver(
        (entries) => {
            const visible = entries.filter((e) => e.isIntersecting)
            if (visible.length === 0) return
            const top = visible.reduce((a, b) => (a.intersectionRatio > b.intersectionRatio ? a : b))
            const index = cardRefs.value.indexOf(top.target as HTMLElement)
            if (index !== -1) activeIndex.value = index
        },
        { root: trackRef.value, threshold: 0.6 },
    )
    cardRefs.value.forEach((el) => observer?.observe(el))
})

onBeforeUnmount(() => {
    observer?.disconnect()
})

function goTo(index: number) {
    const el = cardRefs.value[index]
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
}
function prev() {
    goTo(Math.max(0, activeIndex.value - 1))
}
function next() {
    goTo(Math.min(cases.length - 1, activeIndex.value + 1))
}

// فقط برای ماوس: کشیدن دستی نوار اسکرول
function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || !trackRef.value) return
    dragging = true
    startX = e.clientX
    startScroll = trackRef.value.scrollLeft
    trackRef.value.setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
    if (!dragging || !trackRef.value) return
    trackRef.value.scrollLeft = startScroll - (e.clientX - startX)
}
function onPointerUp() {
    dragging = false
}
</script>

<template>
    <section id="case-results" class="w-full bg-white px-page py-16 md:py-24">
        <div class="mx-auto max-w-7xl">
            <!-- هدر -->
            <div class="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <p class="font-display text-sm tracking-[0.4em] text-muted">RESULTS</p>
                    <h2 class="mt-3 font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-bold text-ink">
                        نمونه نتایج درمان
                    </h2>
                </div>

                <!-- فلش‌های ناوبری با SVG خام، بدون وابستگی به آیکون -->
                <div class="flex items-center gap-2">
                    <button type="button"
                        class="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 text-ink transition-colors hover:bg-surface-container-low disabled:opacity-30"
                        :disabled="activeIndex === 0" @click="prev">
                        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                    </button>
                    <button type="button"
                        class="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 text-ink transition-colors hover:bg-surface-container-low disabled:opacity-30"
                        :disabled="activeIndex === cases.length - 1" @click="next">
                        <svg viewBox="0 0 24 24" class="h-4 w-4 rotate-180" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- نوار اسکرول افقی: هم با انگشت، هم با کشیدن ماوس -->
            <div ref="trackRef"
                class="no-scrollbar mt-10 flex cursor-grab select-none snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 active:cursor-grabbing"
                @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
                @pointerleave="onPointerUp">
                <article v-for="c in cases" :key="c.id" ref="cardRefs"
                    class="w-[80%] shrink-0 snap-start sm:w-[45%] md:w-[31%]">
                    <div class="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[5/4]">
                        <img :src="c.img" :alt="`قبل و بعد ${c.treatment}`" class="h-full w-full object-cover"
                            loading="lazy" draggable="false" />
                        <span
                            class="absolute bottom-2 start-2 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white">قبل
                            و بعد</span>
                    </div>

                    <p class="mt-4 text-[11px] font-semibold tracking-wide text-primary">No.{{ c.id }} — {{ c.treatment
                        }}</p>
                    <h3 class="mt-1 text-[15px] font-bold leading-7 text-ink">{{ c.title }}</h3>
                    <p class="mt-2 text-[13px] leading-7 text-muted">{{ c.description }}</p>
                    <p class="mt-3 text-[12px] text-muted">
                        <span class="font-semibold text-ink">احتمال عوارض: </span>{{ c.risk }}
                    </p>
                </article>
            </div>

            <!-- نقطه‌های پیشرفت -->
            <div class="mt-6 flex justify-center gap-2">
                <button v-for="(c, i) in cases" :key="c.id" type="button"
                    class="h-2 rounded-full transition-all duration-300"
                    :class="i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-outline-variant/50 hover:bg-primary/50'"
                    :aria-label="`کارت ${i + 1}`" @click="goTo(i)" />
            </div>

            <p class="mt-10 text-center text-[11px] leading-6 text-muted/70">
                تصاویر این بخش جنبه‌ی نمایشی دارند و برای نشان‌دادن طراحی صفحه استفاده شده‌اند؛ محتوای واقعی باید از سوی
                کلینیک و با رضایت بیمار تأمین شود.
            </p>
        </div>
    </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>