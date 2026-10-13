<script setup lang="ts">
const faqs = [
  { q: 'چطور نوبت بگیرم؟', a: 'از صفحه رزرو خدمت و ساعت را انتخاب کنید. ورود با موبایل هم ممکن است.' },
  { q: 'لغو نوبت تا چند ساعت قبل؟', a: 'تا ۲۴ ساعت قبل از نوبت از پنل کاربری قابل لغو است.' },
  { q: 'بیعانه لازم است؟', a: 'برای برخی خدمات بیعانه اختیاری از درگاه زرین‌پال دریافت می‌شود.' },
]
useSeoMeta({ title: 'سوالات متداول | Lumina Clinic' })
</script>

<template>
  <div class="mx-auto max-w-3xl px-page py-16">
    <h1 class="font-hero text-3xl text-primary">سوالات متداول</h1>
    <div class="mt-8 space-y-4">
      <details v-for="f in faqs" :key="f.q" class="rounded-2xl border border-outline-variant/20 bg-white p-4">
        <summary class="cursor-pointer font-bold">{{ f.q }}</summary>
        <p class="mt-2 text-sm text-on-surface-variant">{{ f.a }}</p>
      </details>
    </div>
  </div>
</template>
