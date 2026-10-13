<script setup lang="ts">
import { computed } from 'vue'
import { homeEn, homeFa } from '../data/homeContent'
import { useLanguage } from '../i18n/useLanguage'

const { locale } = useLanguage()
const h = computed(() => (locale.value === 'fa' ? homeFa : homeEn))

type BlogPost = {
  slug: string
  title_fa?: string
  title_en?: string
  title?: string
  category?: string
  date?: string
  excerpt_fa?: string
  excerpt_en?: string
}

const { data } = await useAsyncData('home-blog', () =>
  $fetch<{ ok: boolean; data: BlogPost[] }>('/api/blog'),
)

const fallback = computed(() =>
  locale.value === 'fa'
    ? [
        { slug: 'hifu-aftercare', title: 'مراقبت بعد از هایفوتراپی', category: 'درباره درمان‌ها', date: '۱۴۰۵.۰۶.۱۳' },
        { slug: '', title: 'مزوژل پوست‌ساز چیست؟', category: 'مراقبت پوست', date: '۱۴۰۵.۰۶.۰۱' },
        { slug: '', title: 'روتین ساده برای پوست حساس', category: 'عادت‌های روزانه', date: '۱۴۰۵.۰۵.۲۰' },
      ]
    : [
        { slug: 'hifu-aftercare', title: 'HIFU aftercare tips', category: 'About treatments', date: '2026.09.04' },
        { slug: '', title: 'What is a skin booster?', category: 'Skin care', date: '2026.08.22' },
        { slug: '', title: 'A simple routine for sensitive skin', category: 'Daily habits', date: '2026.08.10' },
      ],
)

const list = computed(() => {
  const api = data.value?.data ?? []
  if (!api.length) return fallback.value
  return api.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: locale.value === 'fa' ? p.title_fa || p.title || p.title_en || '' : p.title_en || p.title || p.title_fa || '',
    category: p.category || (locale.value === 'fa' ? 'ستون زیبایی' : 'Beauty column'),
    date: p.date || '',
  }))
})
</script>

<template>
  <section class="w-full bg-pegasus-cream py-14 sm:py-20">
    <div class="mx-auto max-w-[1400px] px-page">
      <div v-fade-up class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{{ h.blog.eyebrow }}</p>
          <h2 class="mt-2 font-hero text-[clamp(1.6rem,3.5vw,2.4rem)]">{{ h.blog.title }}</h2>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="cat in h.blog.categories"
              :key="cat"
              class="rounded-full bg-pegasus-sand px-3 py-1 text-[12px] font-semibold text-on-surface-variant"
            >
              {{ cat }}
            </span>
          </div>
        </div>
        <NuxtLink
          to="/blog"
          class="inline-flex h-11 items-center rounded-full border border-outline-variant/40 px-5 text-[13px] font-bold text-primary"
        >
          {{ h.blog.viewAll }}
        </NuxtLink>
      </div>

      <div class="mt-10 grid gap-4 md:grid-cols-3">
        <NuxtLink
          v-for="post in list"
          :key="post.title"
          v-fade-up
          :to="post.slug ? `/blog/${post.slug}` : '/blog'"
          class="block rounded-2xl bg-pegasus-sand p-5 transition hover:bg-[#e9edc9]"
        >
          <p class="font-latin text-[11px] text-on-surface-variant">
            <span v-if="post.date">{{ post.date }}</span>
            <span v-if="post.date && post.category" class="mx-2 text-outline-variant">|</span>
            <span>{{ post.category }}</span>
          </p>
          <h3 class="mt-2 text-[16px] font-bold text-on-surface">{{ post.title }}</h3>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
