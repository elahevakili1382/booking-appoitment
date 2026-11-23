<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onBeforeUnmount, onMounted, ref } from 'vue'

gsap.registerPlugin(ScrollTrigger)

const root = ref<HTMLElement | null>(null)
const promisePanel = ref<HTMLElement | null>(null)
const doctorPanel = ref<HTMLElement | null>(null)
let mm: gsap.MatchMedia | null = null

const promises = [
    { title: 'زمان کافی', text: 'تا همه‌ی سؤال‌ها و نگرانی‌هایتان برطرف نشود، با حوصله پاسخ می‌دهیم.' },
    { title: 'توضیح ساده', text: 'اصطلاحات پزشکی را تا جای ممکن ساده و با تصویر توضیح می‌دهیم.' },
    { title: 'چند گزینه', text: 'روش‌های درمان را متناسب با سبک زندگی شما پیشنهاد می‌دهیم.' },
    { title: 'بدون اجبار', text: 'تصمیم نهایی با شماست و ما فقط راهنمایی می‌کنیم.' },
]

onMounted(() => {
    if (!root.value) return

    mm = gsap.matchMedia()

    mm.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: root.value,
                    start: 'top top',
                    end: '+=200%',
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                },
            })

            tl.from('[data-card]', { y: 40, opacity: 0, stagger: 0.2, duration: 1 })

            tl.to(
                promisePanel.value,
                { xPercent: -25, opacity: 0, filter: 'blur(10px)', duration: 1.2 },
                '+=0.8',
            )

            tl.fromTo(
                doctorPanel.value,
                { xPercent: 25, opacity: 0, filter: 'blur(10px)' },
                { xPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2 },
                '<0.3',
            )
        },
        root.value,
    )
})

onBeforeUnmount(() => {
    mm?.revert()
})
</script>

<template>
    <div class="mx-auto mt-10 mb-6 max-w-2xl px-page text-center sm:mt-14 sm:mb-8">
        <!-- برچسب ظریف بالا (اختیاری) -->
        <p class="font-display text-xs tracking-[0.35em] text-muted sm:text-sm">
            PROMISE
        </p>

        <!-- خط کوتاه ظریف زیر برچسب -->
        <div class="mx-auto mt-2.5 h-px w-10 bg-ink/35" />

        <!-- تیتر اصلی درشت و پررنگ مثل تصویر -->
        <h2 class="mt-4 font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold leading-[1.5] text-ink">
            تعهد کلینیک
        </h2>
    </div>

    <!-- بخش اصلی پارالاکس -->
    <section ref="root" class="relative h-screen w-full overflow-hidden bg-[#fefae0]">
        <!-- عکس پس‌زمینه/سمت چپ در همه سایزها -->
        <div class="relative h-[38vh] w-full sm:h-[45vh] lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2">
            <NuxtImg src="/doctors/doctor.jpg" alt="پزشک کلینیک لومینا" class="h-full w-full object-cover" format="webp"
                loading="lazy" />
            <div
                class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-[#fefae0] to-transparent" />
            <!-- محو شدن لبه‌ی عکس توی پس‌زمینه -->
            <div
                class="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#fefae0] lg:bg-linear-to-r" />
        </div>

        <!-- ناحیه‌ی محتوا: دو پنل روی هم در همه سایزها -->
        <div
            class="relative z-10 grid h-[62vh] items-center overflow-hidden px-page py-6 sm:h-[55vh] lg:ml-auto lg:h-full lg:w-1/2 lg:overflow-visible lg:py-0">
            <!-- پنل ۱: تعهدات -->
            <div ref="promisePanel" class="col-start-1 row-start-1">
                <div class="grid grid-cols-2 gap-3 sm:gap-4">
                    <article v-for="p in promises" :key="p.title" data-card
                        class="rounded-2xl bg-white/70 p-3.5 text-center shadow-[0_12px_32px_-20px_rgba(61,52,38,0.3)] backdrop-blur-sm sm:p-6">
                        <h3 class="text-sm font-bold text-ink sm:text-lg">{{ p.title }}</h3>
                        <p class="mt-1.5 text-xs leading-5 text-muted sm:mt-3 sm:text-[14px] sm:leading-8">
                            {{ p.text }}
                        </p>
                    </article>
                </div>
            </div>

            <!-- پنل ۲: دکتر -->
            <div ref="doctorPanel" class="col-start-1 row-start-1">
                <span
                    class="inline-block rounded-sm border border-ink/30 px-3 py-2 text-sm text-ink sm:px-4 sm:py-6 sm:text-lg">
                    مدیر کلینیک
                </span>
                <h3 class="mt-3 font-display text-2xl font-bold text-ink sm:mt-6 sm:text-4xl">دکتر نام نمونه</h3>
                <p class="mt-2 text-xs leading-6 text-muted sm:mt-4 sm:text-[15px] sm:leading-8">
                    متخصص پوست و زیبایی با تمرکز بر نتایج طبیعی و ظریف.
                </p>
                <ul class="mt-4 space-y-2 text-xs leading-6 text-ink sm:mt-6 sm:space-y-3 sm:text-[14px] sm:leading-7">
                    <li>✓ سال‌ها تجربه‌ی مدیریت کلینیک زیبایی</li>
                    <li>✓ آموزش‌دهنده‌ی پزشکان و پرستاران</li>
                    <li>✓ تخصص در لیفت، فیلر و جوانسازی پوست</li>
                </ul>
            </div>
        </div>
    </section>
</template>