<script setup lang="ts">
import { useLanguage } from '~/i18n/useLanguage'

const route = useRoute()

// ───────── منطق نمایش هدر/فوتر ─────────
const isDashboard = computed(() => route.path.startsWith('/dashboard'))
const isBook = computed(() => route.path.startsWith('/book'))
const isHome = computed(() => route.path === '/')
const showFooter = computed(() => !isBook.value && !isDashboard.value)
const showHeader = computed(() => !isDashboard.value && !isBook.value)

// ───────── زبان و جهت ─────────
const { locale } = useLanguage()
const isFa = computed(() => locale.value === 'fa')

// ───────── تنظیم lang و dir به صورت واکنشی ─────────
useHead({
  htmlAttrs: {
    lang: () => (isFa.value ? 'fa' : 'en'),
    dir: () => (isFa.value ? 'rtl' : 'ltr'),
  },
})

// ───────── متا تگ‌های پیش‌فرض (داینامیک) ─────────
useSeoMeta({
  // عنوان کوتاه (titleTemplate از nuxt.config.ts اعمال می‌شود)
  title: () => (isFa.value ? 'کلینیک لومینا' : 'Lumina Clinic'),

  // توضیحات
  description: () =>
    isFa.value
      ? 'کلینیک بین‌المللی پوست، مو و زیبایی لومینا — خدمات تخصصی، تیمی باتجربه، تجهیزات نسل جدید.'
      : 'Lumina — International Skin, Hair & Beauty Clinic. Expert team, state-of-the-art technology.',

  // Open Graph
  ogType: 'website',
  ogSiteName: 'Lumina Clinic',
  ogTitle: () =>
    isFa.value ? 'کلینیک زیبایی لومینا' : 'Lumina Beauty Clinic',
  ogDescription: () =>
    isFa.value
      ? 'کلینیک بین‌المللی پوست، مو و زیبایی'
      : 'International Skin, Hair & Beauty Clinic',
  ogLocale: () => (isFa.value ? 'fa_IR' : 'en_US'),
  ogImage: 'https://lumina.clinic/og-image.jpg',
  ogUrl: () => `https://lumina.clinic${route.path}`,

  // Twitter
  twitterCard: 'summary_large_image',
  twitterTitle: () =>
    isFa.value ? 'کلینیک زیبایی لومینا' : 'Lumina Beauty Clinic',
  twitterDescription: () =>
    isFa.value
      ? 'کلینیک بین‌المللی پوست، مو و زیبایی'
      : 'International Skin, Hair & Beauty Clinic',
  twitterImage: 'https://lumina.clinic/og-image.jpg',

  // robots
  robots: 'index, follow',
})
</script>

<template>
  <div id="top" class="w-full max-w-[100vw] overflow-x-clip bg-surface text-on-surface antialiased"
    :class="isDashboard || isBook ? 'min-h-dvh' : 'h-dvh-screen'">
    <AppHeader v-if="showHeader" />
    <PegasusRail v-if="isHome" />

    <main class="w-full min-w-0 overflow-x-clip"
      :class="isDashboard ? 'bg-[#f6f3f3]' : isBook ? 'bg-transparent' : 'bg-surface'">
      <NuxtPage />
    </main>

    <AppFooter v-if="showFooter" />
  </div>
</template>