<script setup lang="ts">
import { computed } from 'vue'
import { useLanguage } from '../i18n/useLanguage'

const { locale } = useLanguage()

const isFa = computed(() => locale.value === 'fa')

const content = computed(() => {
    if (isFa.value) {
        return {
            title: 'صفحه موردنظر پیدا نشد',
            description: 'ممکن است آدرس اشتباه باشد یا این صفحه جابه‌جا شده باشد.',
            backHome: 'بازگشت به صفحه اصلی',
        }
    }

    return {
        title: 'Page not found',
        description: 'The link might be wrong or this page has moved.',
        backHome: 'Back to home',
    }
})

useSeoMeta({
    title: () => `${content.value.title} | Lumina Clinic`,
    robots: 'noindex, nofollow',
})
</script>

<template>
    <main :dir="isFa ? 'rtl' : 'ltr'"
        class="flex min-h-dvh w-full flex-col items-center justify-center bg-[#fefae0] px-5 py-16 text-center sm:px-6">
        <p class="font-latin text-7xl font-bold leading-none text-primary sm:text-8xl">
            404
        </p>

        <h1 class="mt-6 text-xl font-bold leading-9 text-on-surface sm:text-2xl">
            {{ content.title }}
        </h1>

        <p class="mt-3 max-w-md text-sm leading-8 text-on-surface-variant">
            {{ content.description }}
        </p>

        <NuxtLink to="/"
            class="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none">
            {{ content.backHome }}
        </NuxtLink>
    </main>
</template>