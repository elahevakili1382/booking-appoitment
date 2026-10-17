<script setup lang="ts">
// import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const root = ref<HTMLElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const img = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
    if (!root.value || !frame.value || !img.value) return

    ctx = gsap.context(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: root.value,
                start: 'top top',
                end: '+=100%',      // طول اسکرول انیمیشن: ۱ برابر ارتفاع صفحه
                scrub: 1,           // اتصال به اسکرول (جلو و عقب)
                pin: true,          // سکشن حین انیمیشن ثابت می‌مونه
                anticipatePin: 1,
            },
        })

        // بیضی → مستطیل تمام‌صفحه
        tl.fromTo(
            frame.value,
            { clipPath: 'ellipse(22% 70% at 50% 100%)' },
            { clipPath: 'ellipse(100% 100% at 50% 50%)', ease: 'none' },
            0,
        )

        // زوم آروم عکس همزمان با باز شدن
        tl.fromTo(img.value, { scale: 1.25 }, { scale: 1, ease: 'none' }, 0)
    }, root.value)
})

onBeforeUnmount(() => {
    ctx?.revert()
})
</script>

<template>
    <section ref="root" class="relative h-screen w-full overflow-hidden">
        <div ref="frame" class="absolute inset-0" style="clip-path: ellipse(22% 70% at 50% 100%)">
            <img ref="img" src="/images/clinic.jpg" alt="فضای داخلی کلینیک لومینا"
                class="h-full w-full object-cover will-change-transform" />
        </div>
    </section>
</template>