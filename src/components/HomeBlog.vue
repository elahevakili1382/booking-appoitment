<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLanguage } from '../i18n/useLanguage'

interface BlogPost {
  id: number
  date: string
  title: string
  excerpt: string
  img: string
}

const { locale } = useLanguage()
const isFa = computed(() => locale.value === 'fa')

const postsFa: BlogPost[] = [
  {
    id: 1,
    date: '۲۴ مهر ۱۴۰۵',
    title: 'چرا پوست بعد از پاییز نیاز به مراقبت بیشتری دارد؟',
    excerpt: 'تغییر فصل روی رطوبت و شادابی پوست اثر می‌گذارد؛ چند نکته‌ی ساده برای مراقبت روزانه.',
    img: '/blog/article-01.jpg',
  },
  {
    id: 2,
    date: '۱۸ مهر ۱۴۰۵',
    title: 'فیلر یا بوتاکس؛ کدام برای شما مناسب‌تر است؟',
    excerpt: 'تفاوت این دو روش محبوب و اینکه هر کدام برای چه نوع نگرانی‌ای پیشنهاد می‌شود.',
    img: '/blog/article-02.jpg',
  },
  {
    id: 3,
    date: '۰۵ مهر ۱۴۰۵',
    title: 'سه اشتباه رایج در مراقبت پوستی بعد از لیزر',
    excerpt: 'برای نتیجه‌ی بهتر درمان لیزر، این نکات را بعد از جلسه رعایت کنید.',
    img: '/blog/article-03.jpg',
  },
]

const postsEn: BlogPost[] = [
  {
    id: 1,
    date: 'Oct 16, 2026',
    title: 'Why skin needs extra care after autumn arrives',
    excerpt: 'Seasonal change affects skin moisture and glow — a few simple daily tips.',
    img: '/blog/article-01.jpg',
  },
  {
    id: 2,
    date: 'Oct 10, 2026',
    title: 'Filler or Botox — which is right for you?',
    excerpt: 'The difference between these popular methods and which concerns each one suits.',
    img: '/blog/article-02.jpg',
  },
  {
    id: 3,
    date: 'Sep 27, 2026',
    title: '3 common mistakes after laser skin treatment',
    excerpt: 'Follow these tips after your session for better results.',
    img: '/blog/article-03.jpg',
  },
]

const posts = computed<BlogPost[]>(() => (isFa.value ? postsFa : postsEn))
const activeIndex = ref(0)
const hoveredIndex = ref<number | null>(null)

const activePost = computed<BlogPost>(() => posts.value[activeIndex.value] ?? posts.value[0]!)

function selectPost(index: number) {
  const len = posts.value.length
  activeIndex.value = ((index % len) + len) % len
}

function next() {
  selectPost(activeIndex.value + 1)
}

function prev() {
  selectPost(activeIndex.value - 1)
}

function getPanelFlexBasis(index: number) {
  const isActive = index === activeIndex.value
  const isHovered = hoveredIndex.value === index

  if (hoveredIndex.value !== null) {
    if (isHovered) return '60%'
    if (isActive) return '24%'
    return '16%'
  }

  return isActive ? '58%' : '21%'
}
</script>

<template>
  <section id="blog" class="w-full overflow-x-clip bg-white px-page py-16 md:py-24">
    <div class="mx-auto max-w-7xl">
      <!-- هدر -->
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="font-display text-sm tracking-[0.4em] text-muted">BEAUTY COLUMN</p>
          <h2 class="mt-3 font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-bold text-ink">
            {{ isFa ? 'ستون زیبایی' : 'Beauty Column' }}
          </h2>
        </div>

        <!-- دکمه‌های قبلی/بعدی -->
        <div class="flex items-center gap-2">
          <button type="button" :aria-label="isFa ? 'مقاله قبلی' : 'Previous article'"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 text-ink transition-colors hover:bg-surface-container-low"
            @click="prev">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button type="button" :aria-label="isFa ? 'مقاله بعدی' : 'Next article'"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 text-ink transition-colors hover:bg-surface-container-low"
            @click="next">
            <svg viewBox="0 0 24 24" class="h-4 w-4 rotate-180" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <!-- نوار پنل‌های فشرده‌شونده به‌صورت افقی در موبایل و دسکتاپ -->
      <div class="mt-10 flex h-56 flex-row gap-2.5 sm:h-72 sm:gap-4 md:h-[360px]" @mouseleave="hoveredIndex = null">
        <button v-for="(post, index) in posts" :key="post.id" type="button" :aria-pressed="index === activeIndex"
          class="group relative h-full min-w-0 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface text-start transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          :style="{ flexBasis: getPanelFlexBasis(index) }" @mouseenter="hoveredIndex = index"
          @click="selectPost(index)">
          <img :src="post.img" :alt="post.title" loading="lazy" draggable="false"
            class="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />

          <div
            class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-500"
            :class="index === activeIndex ? 'opacity-100' : 'opacity-65'" />

          <!-- عنوان و تاریخ فقط روی کارت فعال نمایش داده شود تا کارت‌های جمع‌شده شلوغ نشوند -->
          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-white transition-opacity duration-300 sm:p-5"
            :class="index === activeIndex ? 'opacity-100' : 'opacity-0'">
            <span class="block text-[10px] font-semibold tracking-wide text-white/80 sm:text-[11px]">
              {{ post.date }}
            </span>
            <span class="mt-0.5 line-clamp-1 font-display text-xs font-bold sm:mt-1 sm:text-base">
              {{ post.title }}
            </span>
          </div>
        </button>
      </div>

      <!-- پنل متن و چکیده مقاله فعال در پایین -->
      <div class="mt-7 border-t border-outline-variant/15 pt-6">
        <Transition name="blog-fade" mode="out-in">
          <div :key="`${locale}-${activePost.id}`"
            class="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-10">
            <div class="max-w-3xl">
              <p class="text-[11px] font-semibold text-primary">
                {{ activePost.date }}
              </p>
              <h3 class="mt-1 font-display text-lg font-bold leading-8 text-ink sm:text-xl">
                {{ activePost.title }}
              </h3>
              <p class="mt-2 text-[13.5px] leading-7 text-muted">
                {{ activePost.excerpt }}
              </p>
            </div>

            <span
              class="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-outline-variant/30 bg-surface-container-low px-4 py-2 text-[12px] font-semibold text-muted md:self-center">
              {{ isFa ? 'مطالعه به‌زودی' : 'Article coming soon' }}
            </span>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.blog-fade-enter-active,
.blog-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.blog-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.blog-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>