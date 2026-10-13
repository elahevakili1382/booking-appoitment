<script setup lang="ts">
import { computed } from 'vue'
import ScrollExpandHero from './ui/ScrollExpandHero.vue'
import { assets } from '../data/assets'
import { useLanguage } from '../i18n/useLanguage'
import heroImage from '~/assets/hero/lumina-hero.jpg'

const { t, locale } = useLanguage()

const copy = computed(() =>
  locale.value === 'fa'
    ? {
        title: 'لومینا کلینیک',
        date: 'Aesthetic Care',
        scroll: 'اسکرول کنید تا باز شود',
        lead: 'مشاوره آرام، توضیح شفاف، بدون فشار — مراقبت زیبایی را نزدیک‌تر و لذت‌بخش‌تر می‌کنیم.',
      }
    : {
        title: 'Lumina Clinic',
        date: 'Natural Beauty',
        scroll: 'Scroll to expand',
        lead: 'Calm counseling, clear explanations, no pressure — beauty care that feels closer and more enjoyable.',
      },
)
</script>

<template>
  <ScrollExpandHero
    media-type="image"
    :media-src="heroImage"
    :bg-image-src="assets.gallery[0].after"
    :title="copy.title"
    :date="copy.date"
    :scroll-to-expand="copy.scroll"
  >
    <div class="mx-auto max-w-2xl text-center">
      <p class="text-[16px] leading-8 text-on-surface-variant sm:text-[18px]">{{ copy.lead }}</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <NuxtLink
          to="/book"
          class="inline-flex h-12 min-w-[11rem] items-center justify-center rounded-full bg-primary px-7 text-[14px] font-bold text-on-primary"
        >
          {{ t.heroCtaPrimary }}
        </NuxtLink>
        <NuxtLink
          to="/services"
          class="inline-flex h-12 min-w-[11rem] items-center justify-center rounded-full border border-outline-variant/50 px-7 text-[14px] font-bold text-primary"
        >
          {{ t.heroCtaSecondary }}
        </NuxtLink>
      </div>
    </div>
  </ScrollExpandHero>
</template>
