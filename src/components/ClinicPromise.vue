<script setup lang="ts">
import { computed } from 'vue'
import { useLanguage } from '../i18n/useLanguage'

const { t, locale } = useLanguage()

const promises = computed(() =>
  locale.value === 'fa'
    ? [
        { title: 'زمان کافی برای مشاوره', desc: 'تا رفع کامل سوال‌ها و نگرانی‌ها کنار شما می‌مانیم.' },
        { title: 'توضیح ساده و شفاف', desc: 'بدون اصطلاحات سخت؛ با مثال و تصویر مسیر درمان را می‌گوییم.' },
        { title: 'چند گزینه، بدون فشار', desc: 'بر اساس سبک زندگی‌تان چند مسیر پیشنهاد می‌دهیم؛ تصمیم با شماست.' },
      ]
    : [
        { title: 'Unhurried consultation', desc: 'We stay until every question feels answered.' },
        { title: 'Clear explanations', desc: 'Plain language, visuals, and realistic expectations.' },
        { title: 'Options, never pressure', desc: 'Several paths — your choice comes first.' },
      ],
)

const reasons = computed(() =>
  locale.value === 'fa'
    ? [
        {
          n: '01',
          title: 'پزشک با تجربه، از مشاوره تا مراقبت',
          desc: 'از ویزیت اول تا پیگیری بعد درمان، مسیر یکپارچه و تحت نظر متخصص است.',
        },
        {
          n: '02',
          title: 'تیم آموزش‌دیده و آرام',
          desc: 'سوال‌های کوچک هم جدی گرفته می‌شود؛ فضای کلینیک امن و محترمانه است.',
        },
        {
          n: '03',
          title: 'تکنولوژی به‌روز پوست و زیبایی',
          desc: 'پروتکل‌ها و دستگاه‌ها برای نتیجه طبیعی و قابل پیگیری انتخاب شده‌اند.',
        },
      ]
    : [
        {
          n: '01',
          title: 'Specialist-led care end to end',
          desc: 'From first consult to aftercare, one coherent clinical path.',
        },
        {
          n: '02',
          title: 'Calm, trained team',
          desc: 'Small questions matter — the room feels safe and respectful.',
        },
        {
          n: '03',
          title: 'Modern aesthetics technology',
          desc: 'Protocols chosen for natural, measurable outcomes.',
        },
      ],
)
</script>

<template>
  <section class="w-full border-y border-outline-variant/15 bg-white py-14 sm:py-20">
    <div class="mx-auto max-w-[1400px] px-page">
      <div class="mx-auto max-w-2xl text-center">
        <p class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Promise</p>
        <h2 class="mt-3 font-hero text-[clamp(1.6rem,3.5vw,2.4rem)] text-on-surface">
          {{ locale === 'fa' ? 'در مشاوره به شما قول می‌دهیم' : 'What we promise in consultation' }}
        </h2>
      </div>

      <div class="mt-10 grid gap-6 sm:grid-cols-3">
        <article v-for="p in promises" :key="p.title" class="text-center sm:text-start">
          <h3 class="text-[16px] font-bold text-on-surface">{{ p.title }}</h3>
          <p class="mt-2 text-[14px] leading-7 text-on-surface-variant">{{ p.desc }}</p>
        </article>
      </div>

      <div class="mt-16 grid gap-8 border-t border-outline-variant/15 pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Reason</p>
          <h2 class="mt-3 font-hero text-[clamp(1.5rem,3vw,2.2rem)] text-on-surface">
            {{ locale === 'fa' ? 'چرا لومینا را انتخاب می‌کنند' : 'Why people choose Lumina' }}
          </h2>
          <p class="mt-4 max-w-md text-[15px] leading-7 text-on-surface-variant">
            {{
              locale === 'fa'
                ? 'تجربه کلینیکی آرام، نتیجه طبیعی، و نوبت‌دهی شفاف — بدون شلوغی تبلیغاتی.'
                : 'Calm clinical care, natural results, and clear booking — without marketing noise.'
            }}
          </p>
          <NuxtLink
            to="/book"
            class="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 text-[14px] font-bold text-on-primary"
          >
            {{ t.heroCtaPrimary }}
          </NuxtLink>
        </div>
        <div class="space-y-8">
          <article v-for="r in reasons" :key="r.n" class="grid grid-cols-[auto_1fr] gap-4">
            <span class="font-latin text-[28px] font-semibold leading-none text-primary/35">{{ r.n }}</span>
            <div>
              <h3 class="text-[16px] font-bold text-on-surface">{{ r.title }}</h3>
              <p class="mt-2 text-[14px] leading-7 text-on-surface-variant">{{ r.desc }}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
