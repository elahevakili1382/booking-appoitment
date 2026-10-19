<script setup lang="ts">

import { useLanguage } from '../i18n/useLanguage'

const { t, locale, setLocale } = useLanguage()
const route = useRoute()
const open = ref(false)
const scrolled = ref(false)

const links = computed(() => [
  { to: '/faq', label: locale.value === 'fa' ? 'مراجع اول' : 'First visit' },
  { to: '/faq', label: locale.value === 'fa' ? 'سوالات' : 'FAQ' },
  { to: '/doctors', label: locale.value === 'fa' ? 'پزشکان' : 'Doctors' },
  { to: '/services', label: locale.value === 'fa' ? 'منوی درمان' : 'Menu' },
  { to: '/gallery', label: locale.value === 'fa' ? 'نمونه نتایج' : 'Cases' },
  { to: '/blog', label: locale.value === 'fa' ? 'ستون زیبایی' : 'Column' },
])

const onHomeTop = computed(() => route.path === '/' && !scrolled.value && !open.value)
const pill = computed(() => route.path === '/' && scrolled.value && !open.value)

function onScroll() {
  scrolled.value = window.scrollY > 60
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})
watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
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

    <!-- ✅ سایدبار کناری (جایگزین منوی قبلی) -->
    <Teleport to="body">
      <!-- لایه تاریک پشت سایدبار -->
      <div v-if="open" class="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] xl:hidden transition-opacity"
        @click="open = false" />

      <!-- پنل سایدبار -->
      <div
        class="fixed inset-y-0 end-0 z-[70] flex w-[280px] flex-col bg-[#fefae0] shadow-2xl transition-transform duration-300 ease-in-out xl:hidden"
        :class="open ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'">
        
        <!-- هدر سایدبار (دکمه بستن) -->
        <div class="flex items-center justify-between border-b border-outline-variant/30 px-4 py-4">
          <span class="font-latin text-[13px] font-semibold tracking-[0.28em] text-on-surface">MENU</span>
          <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#e9edc9]/50"
            @click="open = false">
            <Icon name="ph:x" class="w-5 h-5 text-on-surface" />
          </button>
        </div>

        <!-- لینک‌های منو -->
        <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <NuxtLink v-for="link in links" :key="link.to + link.label" :to="link.to"
            class="rounded-xl px-4 py-3.5 text-[15px] font-semibold text-on-surface hover:bg-[#e9edc9]/60"
            @click="open = false">
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- فوتر سایدبار (دکمه رزرو) -->
        <div class="border-t border-outline-variant/30 p-4">
          <NuxtLink to="/book"
            class="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[14px] font-bold text-on-primary"
            @click="open = false">
            {{ t.bookCta }}
          </NuxtLink>
        </div>
      </div>
    </Teleport>

  </header>
</template>