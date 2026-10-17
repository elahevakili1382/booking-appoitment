<script setup lang="ts">
// import { computed } from 'vue'
import { useLanguage } from '../i18n/useLanguage'

const { t, locale } = useLanguage()

const packages = computed(() =>
  locale.value === 'fa'
    ? [
      {
        badge: '۳۰٪ صرفه‌جویی اقتصادی',
        badgeTone: 'primary' as const,
        icon: 'card_membership',
        title: 'پکیج ۶ ماهه جوان‌سازی و لیفتینگ Total Glow',
        desc: 'شامل ۲ جلسه هایفوتراپی ۳ بعدی، ۳ جلسه مزوژل پروفایلو و ۶ جلسه فیشیال تخصصی آنتی‌اکسیدان با کنسیرژ اولویت‌دار.',
        perks: [
          'رزرو اولویت‌دار بدون انتظار در صف',
          'شامل ۱ جلسه مشاوره تصویری تکمیلی رایگان',
          'قابلیت انتقال اعتبار به اعضای خانواده',
        ],
        old: '۶۲,۰۰۰,۰۰۰ تومان',
        price: '۴۳,۵۰۰,۰۰۰ تومان',
        cta: 'خرید اشتراک دوره‌ای Total Glow',
      },
      {
        badge: 'محبوب‌ترین پکیج عروس',
        badgeTone: 'gold' as const,
        icon: 'auto_awesome',
        title: 'پکیج کانتورینگ و شفافیت پوست Bridal Glow',
        desc: 'پروتکل آماده‌سازی ۴۵ روزه مراسم شامل فیلر طبیعی لب، رفع تیرگی زیر چشم، جوانسازی گردن و ماسک طلای ۲۴ عیار.',
        perks: [
          'هماهنگی اتاق استراحت VIP اختصاصی روز قبل مراسم',
          'کیت مراقبت خانگی با سرم‌های ساخت سوئیس',
          'تضمین ماندگاری و عکس‌برداری حرفه‌ای استودیویی',
        ],
        old: '۳۸,۰۰۰,۰۰۰ تومان',
        price: '۲۹,۹۰۰,۰۰۰ تومان',
        cta: 'رزرو پکیج Bridal Glow',
      },
      {
        badge: 'کارت هدیه SimplyBook',
        badgeTone: 'soft' as const,
        icon: 'featured_seasonal_and_gifts',
        title: 'گیفت‌کارت دیجیتال و فیزیکی لومینا (Beauty Voucher)',
        desc: 'هدیه‌ای شایسته و ماندگار برای عزیزانتان؛ ارسال پیامکی آنی لینک فعال‌سازی به همراه بسته‌بندی نفیس مهروموم‌شده.',
        gift: true,
        cta: 'خرید آنلاین کارت هدیه زیبایی',
      },
    ]
    : [
      {
        badge: '30% savings',
        badgeTone: 'primary' as const,
        icon: 'card_membership',
        title: '6-month Total Glow rejuvenation package',
        desc: 'Includes 2× 3D HIFU, 3× Profhilo, and 6× antioxidant facials with priority concierge.',
        perks: [
          'Priority booking — no waiting queue',
          '1 complimentary follow-up video consult',
          'Transferable credit for family members',
        ],
        old: '62,000,000 Toman',
        price: '43,500,000 Toman',
        cta: 'Buy Total Glow membership',
      },
      {
        badge: 'Most popular bridal',
        badgeTone: 'gold' as const,
        icon: 'auto_awesome',
        title: 'Bridal Glow contour & skin clarity package',
        desc: '45-day ceremony prep: natural lip filler, under-eye brightening, neck rejuvenation, and 24K gold mask.',
        perks: [
          'Private VIP rest suite the day before',
          'Swiss at-home serum care kit',
          'Longevity guarantee + studio photography',
        ],
        old: '38,000,000 Toman',
        price: '29,900,000 Toman',
        cta: 'Book Bridal Glow',
      },
      {
        badge: 'SimplyBook gift card',
        badgeTone: 'soft' as const,
        icon: 'featured_seasonal_and_gifts',
        title: 'Lumina digital & physical beauty voucher',
        desc: 'A lasting gift — instant SMS activation link plus sealed premium packaging.',
        gift: true,
        cta: 'Buy beauty gift card online',
      },
    ],
)
</script>

<template>
  <section id="vip"
    class="w-full max-w-[100vw] overflow-x-clip border-y border-outline-variant/30 bg-surface-container-low py-10 sm:py-14 md:py-space-xl">
    <div class="mx-auto max-w-[1400px] px-page">
      <div class="mb-6 flex flex-col justify-between gap-3 sm:mb-8 md:mb-space-lg lg:flex-row lg:items-end">
        <div v-fade-up class="min-w-0">
          <span class="font-latin text-[10px] font-bold uppercase tracking-[0.1em] text-primary">{{
            t.packagesEyebrow
          }}</span>
          <h2 class="section-title mt-1 text-on-surface">{{ t.packagesTitle }}</h2>
        </div>
        <p v-fade-up class="mt-0 max-w-md text-[13px] text-on-surface-variant">{{ t.packagesDesc }}</p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:gap-gutter md:grid-cols-2 xl:grid-cols-3">
        <article v-for="pkg in packages" :key="pkg.title" v-fade-up
          class="relative flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-xl border p-4 shadow-sm sm:p-space-lg"
          :class="pkg.gift
              ? 'border-primary-fixed/40 bg-gradient-to-br from-surface-container via-surface to-surface-container-high'
              : 'border-outline-variant/30 bg-surface-container-lowest'
            ">
          <div class="absolute end-0 top-0 rounded-es-lg px-3 py-1 text-[10px] font-bold" :class="{
            'bg-primary text-on-primary': pkg.badgeTone === 'primary',
            'bg-secondary-fixed text-on-secondary-fixed': pkg.badgeTone === 'gold',
            'bg-primary-container text-on-primary-container': pkg.badgeTone === 'soft',
          }">
            {{ pkg.badge }}
          </div>

          <div>
            <div class="mb-space-sm flex h-12 w-12 items-center justify-center rounded-xl"
              :class="pkg.gift ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-primary'">
              <Icon name="ph:{{ pkg.icon }}" />
            </div>
            <h3 class="text-[18px] font-bold text-on-surface">{{ pkg.title }}</h3>
            <p class="mt-2 text-[13px] leading-5 text-on-surface-variant">{{ pkg.desc }}</p>

            <ul v-if="pkg.perks"
              class="mt-space-md space-y-2 border-t border-outline-variant/30 pt-space-sm text-[12px] text-on-surface-variant">
              <li v-for="perk in pkg.perks" :key="perk" class="flex items-start gap-2">
                <Icon name="ph:check" />
                <span class="min-w-0">{{ perk }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-space-lg border-t border-outline-variant/30 pt-space-sm">
            <div v-if="!pkg.gift" class="mb-space-sm flex flex-wrap items-baseline justify-between gap-2">
              <span class="text-[10px] text-on-surface-variant line-through">{{ pkg.old }}</span>
              <span class="text-[16px] font-bold text-primary sm:text-[18px]">{{ pkg.price }}</span>
            </div>
            <RouterLink to="/book"
              class="flex min-h-11 w-full cursor-pointer items-center justify-center gap-1 rounded-full bg-primary py-2.5 text-[12px] font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container">
              {{ pkg.cta }}
            </RouterLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
