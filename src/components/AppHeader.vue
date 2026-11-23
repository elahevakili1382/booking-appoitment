<script setup lang="ts">

import { assets } from '../data/assets'
import { useLanguage } from '../i18n/useLanguage'

const { t, locale, setLocale } = useLanguage()
const route = useRoute()
const open = ref(false)
const scrolled = ref(false)

// icon = نام Material Symbols (فونت محلی)؛ فقط در سایدبار موبایل نمایش داده می‌شود
const links = computed(() => [
  { to: '/faq', icon: 'waving_hand', label: locale.value === 'fa' ? 'مراجع اول' : 'First visit' },
  { to: '/faq', icon: 'help', label: locale.value === 'fa' ? 'سوالات' : 'FAQ' },
  { to: '/doctors', icon: 'stethoscope', label: locale.value === 'fa' ? 'پزشکان' : 'Doctors' },
  { to: '/services', icon: 'spa', label: locale.value === 'fa' ? 'منوی درمان' : 'Menu' },
  { to: '/gallery', icon: 'photo_library', label: locale.value === 'fa' ? 'نمونه نتایج' : 'Cases' },
  { to: '/blog', icon: 'auto_stories', label: locale.value === 'fa' ? 'ستون زیبایی' : 'Column' },
])

const brandTitle = computed(() => (locale.value === 'fa' ? 'کلینیک زیبایی لومینا' : 'Lumina Beauty Clinic'))
const closeBtn = ref<HTMLButtonElement | null>(null)

const onHomeTop = computed(() => route.path === '/' && !scrolled.value && !open.value)
const pill = computed(() => route.path === '/' && scrolled.value && !open.value)

function onScroll() {
  scrolled.value = window.scrollY > 60
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) nextTick(() => closeBtn.value?.focus())
})
// با تغییر صفحه، منو بسته شود
watch(() => route.path, () => (open.value = false))
</script>
<template>
  <header class="safe-top fixed top-0 z-50 w-full max-w-[100vw] transition-all duration-500"
    :class="pill ? 'px-4 pt-3 sm:px-8 sm:pt-4' : ''">
    
    <!-- هدر اصلی (بدون تغییر) -->
    <div class="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 transition-all duration-500"
      :class="pill
        ? 'h-[4.5rem] rounded-full bg-[#fefae0]/80 px-6 shadow-[0_10px_40px_-18px_rgba(61,52,38,0.22)] backdrop-blur-md'
        : 'h-20 bg-transparent px-page md:h-[5.5rem]'
        ">
      <RouterLink to="/" class="shrink-0" @click="open = false">
        <span class="font-latin text-[13px] font-semibold tracking-[0.28em] text-on-surface uppercase sm:text-[15px] md:tracking-[0.34em]">
          LUMINA CLINIC
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
        <NuxtLink v-for="link in links" :key="link.to + link.label" :to="link.to"
          class="rounded-full px-3 py-2 text-[12px] font-semibold text-on-surface-variant transition hover:text-primary">
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <!-- سرچ -->
        <div class="hidden h-10 items-center gap-2 rounded-full bg-[#e9edc9]/80 px-3 text-on-surface lg:flex">
          <Icon name="ph:magnifying-glass" />
          <span class="font-latin text-[11px] tracking-wide opacity-60">search...</span>
        </div>

        <!-- تلفن -->
        <a href="tel:+982100000000" class="hidden flex-col leading-tight text-on-surface xl:flex">
          <span class="font-latin text-[13px] font-semibold tracking-wide">tel. 021-0000-0000</span>
          <span class="text-[10px] text-on-surface-variant">{{ locale === 'fa' ? 'پذیرش ۹ تا ۱۸' : '9:00–18:00' }}</span>
        </a>

        <!-- تغییر زبان -->
        <div class="flex h-9 items-center rounded-full bg-[#e9edc9]/70 p-0.5">
          <button type="button" class="h-8 rounded-full px-2.5 font-latin text-[10px] font-bold"
            :class="locale === 'fa' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'"
            @click="setLocale('fa')">
            FA
          </button>
          <button type="button" class="h-8 rounded-full px-2.5 font-latin text-[10px] font-bold"
            :class="locale === 'en' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'"
            @click="setLocale('en')">
            EN
          </button>
        </div>

        <NuxtLink to="/book"
          class="hidden h-10 items-center rounded-full bg-primary px-4 text-[12px] font-bold text-on-primary lg:inline-flex">
          {{ t.bookCta }}
        </NuxtLink>

        <!-- دکمه همبرگری (فقط موبایل و تبلت) -->
        <button type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e9edc9]/80 text-on-surface xl:hidden"
          :aria-expanded="open" @click="open = true">
          <Icon :name="open ? 'ph:x' : 'ph:list'" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- سایدبار موبایل: از سمت شروع (راست در فارسی، چپ در انگلیسی) باز می‌شود -->
    <Teleport to="body">
      <!-- لایه تاریک پشت سایدبار -->
      <div class="fixed inset-0 z-[60] bg-on-surface/35 backdrop-blur-[3px] transition-opacity duration-300 motion-reduce:transition-none xl:hidden"
        :class="open ? 'opacity-100' : 'pointer-events-none opacity-0'" aria-hidden="true" @click="open = false" />

      <!-- پنل -->
      <aside id="mobile-menu" role="dialog" aria-modal="true" :aria-label="brandTitle" :inert="open ? undefined : ''"
        class="fixed inset-y-0 start-0 z-[70] flex w-[min(86vw,21rem)] flex-col overflow-hidden rounded-e-[2rem] bg-[#fefae0] shadow-[0_0_60px_-10px_rgba(61,52,38,0.45)] transition-transform duration-300 ease-out motion-reduce:transition-none xl:hidden"
        :class="open ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'">
        <!-- لکهٔ رنگی ملایم پس‌زمینه -->
        <div class="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-sage/60 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-24 -start-20 h-56 w-56 rounded-full bg-primary/20 blur-2xl" aria-hidden="true" />

        <!-- سربرگ: برند + بستن -->
        <div class="relative flex items-center gap-3 px-5 pb-4 pt-6">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/80 shadow-sm">
            <img :src="assets.logo" alt="" class="h-7 w-auto object-contain" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[16px] font-extrabold leading-tight text-on-surface">{{ brandTitle }}</p>
            <p class="mt-0.5 font-latin text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Lumina Clinic</p>
          </div>
          <button ref="closeBtn" type="button" :aria-label="locale === 'fa' ? 'بستن منو' : 'Close menu'"
            class="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-white/70 text-on-surface transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-primary"
            @click="open = false">
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        </div>

        <div class="relative mx-5 h-px bg-outline-variant/40" />

        <!-- لینک‌ها -->
        <nav class="relative flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-4" :aria-label="brandTitle">
          <NuxtLink v-for="(link, i) in links" :key="link.to + link.label" :to="link.to"
            class="group relative flex min-h-14 items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-bold text-on-surface transition-all duration-300 hover:bg-white/80 hover:shadow-[0_8px_24px_-14px_rgba(61,52,38,0.35)] focus-visible:bg-white/80 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none"
            active-class="bg-white/70"
            :class="open ? 'translate-x-0 opacity-100' : 'opacity-0 ltr:-translate-x-4 rtl:translate-x-4'"
            :style="{ transitionDelay: open ? `${100 + i * 45}ms` : '0ms' }" @click="open = false">
            <span
              class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage/50 text-on-surface transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
              <span class="material-symbols-outlined text-[22px]" aria-hidden="true">{{ link.icon }}</span>
            </span>
            <span class="min-w-0 flex-1 truncate">{{ link.label }}</span>
            <span
              class="material-symbols-outlined text-[20px] text-on-surface-variant transition-transform duration-300 group-hover:text-primary ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              aria-hidden="true">{{ locale === 'fa' ? 'chevron_left' : 'chevron_right' }}</span>
          </NuxtLink>
        </nav>

        <!-- پایین: تماس و رزرو -->
        <div class="relative space-y-3 border-t border-outline-variant/30 bg-white/40 p-4">
          <a href="tel:+982122000000"
            class="flex min-h-11 items-center justify-between gap-2 rounded-xl px-2 text-[13px] text-on-surface-variant transition-colors hover:text-primary">
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">call</span>
              {{ locale === 'fa' ? 'پذیرش ۹ تا ۱۸' : 'Reception 9–18' }}
            </span>
            <span dir="ltr" class="font-latin text-[12px] font-semibold text-on-surface">021-2200-0000</span>
          </a>
          <NuxtLink to="/book"
            class="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[14px] font-bold text-on-primary shadow-[0_10px_24px_-12px_rgba(176,122,69,0.8)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="open = false">
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">event_available</span>
            {{ t.bookCta }}
          </NuxtLink>
        </div>
      </aside>
    </Teleport>

  </header>
</template>