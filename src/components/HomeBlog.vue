<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'

const { locale } = useLanguage()
const isFa = computed(() => locale.value === 'fa')

const postsFa = [
  { id: 1, date: '۲۴ مهر ۱۴۰۵', title: 'چرا پوست بعد از پاییز نیاز به مراقبت بیشتری دارد؟', excerpt: 'تغییر فصل روی رطوبت و شادابی پوست اثر می‌گذارد؛ چند نکته‌ی ساده برای مراقبت روزانه.', img: '/blog/article-01.jpg' },
  { id: 2, date: '۱۸ مهر ۱۴۰۵', title: 'فیلر یا بوتاکس؛ کدام برای شما مناسب‌تر است؟', excerpt: 'تفاوت این دو روش محبوب و اینکه هر کدام برای چه نوع نگرانی‌ای پیشنهاد می‌شود.', img: '/blog/article-02.jpg' },
  { id: 3, date: '۰۵ مهر ۱۴۰۵', title: 'سه اشتباه رایج در مراقبت پوستی بعد از لیزر', excerpt: 'برای نتیجه‌ی بهتر درمان لیزر، این نکات را بعد از جلسه رعایت کنید.', img: '/blog/article-03.jpg' },
]
const postsEn = [
  { id: 1, date: 'Oct 16, 2026', title: 'Why skin needs extra care after autumn arrives', excerpt: 'Seasonal change affects skin moisture and glow — a few simple daily tips.', img: '/blog/article-01.jpg' },
  { id: 2, date: 'Oct 10, 2026', title: 'Filler or Botox — which is right for you?', excerpt: 'The difference between these popular methods and which concerns each one suits.', img: '/blog/article-02.jpg' },
  { id: 3, date: 'Sep 27, 2026', title: '3 common mistakes after laser skin treatment', excerpt: 'Follow these tips after your session for better results.', img: '/blog/article-03.jpg' },
]
const posts = computed(() => (isFa.value ? postsFa : postsEn))
</script>

<template>
  <section id="blog" class="w-full bg-white px-page py-16 md:py-24">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="font-display text-sm tracking-[0.4em] text-muted">{{ isFa ? 'BEAUTY COLUMN' : 'BEAUTY COLUMN' }}</p>
          <h2 class="mt-3 font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-bold text-ink">
            {{ isFa ? 'ستون زیبایی' : 'Beauty Column' }}
          </h2>
        </div>
        <a href="#" class="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:underline">
          {{ isFa ? 'مشاهده‌ی همه' : 'View all' }}
          <Icon name="ph:arrow-left" class="h-4 w-4 rtl:rotate-180" />
        </a>
      </div>

      <div class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="p in posts" :key="p.id" class="group">
          <a href="#" class="block">
            <div class="aspect-4/3 overflow-hidden rounded-2xl">
              <img :src="p.img" :alt="p.title" loading="lazy"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <p class="mt-4 text-[11px] font-semibold text-primary">{{ p.date }}</p>
            <h3 class="mt-1 text-[15px] font-bold leading-7 text-ink">{{ p.title }}</h3>
            <p class="mt-2 text-[13px] leading-7 text-muted">{{ p.excerpt }}</p>
          </a>
        </article>
      </div>
    </div>
  </section>
</template>