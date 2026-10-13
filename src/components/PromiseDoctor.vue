<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import doctorImg from '~/assets/doctor/doctor.jpg'

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

    // فقط دسکتاپ و فقط اگر کاربر «کاهش حرکت» رو روشن نکرده
    mm.add(
        '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
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

            // ۱) کارت‌های تعهدات یکی‌یکی بالا میان
            tl.from('[data-card]', { y: 60, opacity: 0, stagger: 0.2, duration: 1 })

            // ۲) پنل تعهدات می‌ره و محو و تار می‌شه
            tl.to(
                promisePanel.value,
                { xPercent: -25, opacity: 0, filter: 'blur(10px)', duration: 1.2 },
                '+=0.8',
            )

            // ۳) پنل دکتر از سمت راست میاد (هم‌زمان با ۰.۳ ثانیه تاخیر)
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
    <section ref="root" class="relative w-full overflow-hidden bg-[#fefae0] lg:h-screen">
        <!-- عکس ثابت سمت چپ -->
        <div class="relative h-[60vh] w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2">
            <img :src="doctorImg" alt="پزشک کلینیک لومینا" class="h-full w-full object-cover" />
            <!-- محو شدن لبه‌ی عکس توی پس‌زمینه -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#fefae0]" />
        </div>

        <!-- ناحیه‌ی محتوا: دو پنل روی هم (فقط دسکتاپ) -->
        <div class="relative z-10 px-page py-12 lg:ml-auto lg:grid lg:h-full lg:w-1/2 lg:items-center lg:py-0">
            <!-- پنل ۱: تعهدات -->
            <div ref="promisePanel" class="lg:col-start-1 lg:row-start-1">
                <p class="text-center font-display tracking-[0.3em] text-muted">PROMISE</p>
                <h2 class="mt-4 text-center font-display text-3xl font-bold text-ink">
                    در مشاوره به شما قول می‌دهیم
                </h2>
                <div class="mt-10 grid gap-4 sm:grid-cols-2">
                    <article v-for="p in promises" :key="p.title" data-card
                        class="rounded-2xl bg-white/70 p-6 text-center shadow-[0_12px_32px_-20px_rgba(61,52,38,0.3)] backdrop-blur-sm">
                        <h3 class="text-lg font-bold text-ink">{{ p.title }}</h3>
                        <p class="mt-3 text-[14px] leading-8 text-muted">{{ p.text }}</p>
                    </article>
                </div>
            </div>

            <!-- پنل ۲: دکتر -->
            <div ref="doctorPanel" class="mt-16 lg:col-start-1 lg:row-start-1 lg:mt-0">
                <span class="inline-block rounded-sm border border-ink/30 px-4 py-6 text-lg text-ink">مدیر کلینیک</span>
                <h2 class="mt-6 font-display text-4xl font-bold text-ink">دکتر نام نمونه</h2>
                <p class="mt-4 text-[15px] leading-8 text-muted">
                    متخصص پوست و زیبایی با تمرکز بر نتایج طبیعی و ظریف.
                </p>
                <ul class="mt-6 space-y-3 text-[14px] leading-7 text-ink">
                    <li>✓ سال‌ها تجربه‌ی مدیریت کلینیک زیبایی</li>
                    <li>✓ آموزش‌دهنده‌ی پزشکان و پرستاران</li>
                    <li>✓ تخصص در لیفت، فیلر و جوانسازی پوست</li>
                </ul>
            </div>
        </div>
    </section>
</template>