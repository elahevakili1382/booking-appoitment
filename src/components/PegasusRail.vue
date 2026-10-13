<script setup lang="ts">
/** ریل شناور سمت راست — مثل پگاسوس (رزرو / تقویم / شبکه) */
import { useLanguage } from '../i18n/useLanguage'

const { locale } = useLanguage()
</script>

<template>
  <aside
    class="pointer-events-none fixed end-3 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-center gap-3 lg:end-5 lg:flex"
    aria-label="Quick actions"
  >
    <div
      class="pointer-events-auto flex flex-col overflow-hidden rounded-[2rem] bg-[#fefae0]/85 shadow-[0_12px_40px_-16px_rgba(61,52,38,0.28)] backdrop-blur-md"
    >
      <NuxtLink
        to="/book"
        class="flex w-[4.25rem] flex-col items-center gap-1 border-b border-[#d4ceb8]/50 px-2 py-4 text-center transition hover:bg-[#faedcd]/70"
      >
        <span class="material-symbols-outlined text-[22px] text-primary">diamond</span>
        <span class="text-[10px] font-bold leading-tight text-on-surface">
          {{ locale === 'fa' ? 'رزرو' : 'Book' }}
          <br />
          {{ locale === 'fa' ? 'آنلاین' : 'online' }}
        </span>
      </NuxtLink>
      <NuxtLink
        to="/contact"
        class="flex w-[4.25rem] flex-col items-center gap-1 border-b border-[#d4ceb8]/50 px-2 py-4 text-center transition hover:bg-[#faedcd]/70"
      >
        <span class="material-symbols-outlined text-[22px] text-primary">calendar_month</span>
        <span class="text-[10px] font-bold leading-tight text-on-surface">
          {{ locale === 'fa' ? 'ساعات' : 'Hours' }}
          <br />
          {{ locale === 'fa' ? 'پذیرش' : '' }}
        </span>
      </NuxtLink>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        class="flex w-[4.25rem] flex-col items-center gap-1 px-2 py-4 text-center transition hover:bg-[#faedcd]/70"
      >
        <span class="material-symbols-outlined text-[22px] text-primary">chat</span>
        <span class="text-[10px] font-bold leading-tight text-on-surface">LINE</span>
      </a>
    </div>

    <div class="pointer-events-auto flex flex-col items-center gap-3 py-2">
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="text-on-surface/70 transition hover:text-primary" aria-label="Instagram">
        <span class="material-symbols-outlined text-[20px]">photo_camera</span>
      </a>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="text-on-surface/70 transition hover:text-primary" aria-label="YouTube">
        <span class="material-symbols-outlined text-[20px]">play_circle</span>
      </a>
    </div>
  </aside>
</template>
