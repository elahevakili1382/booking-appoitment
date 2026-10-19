<script setup lang="ts">
const services = [
  {
    no: '01',
    title: 'لیزر لک و یکدست‌سازی پوست',
    tags: ['کدری پوست', 'لک‌های سرسخت', 'ملاسما'],
    text: 'با طول‌موج‌های مناسب نوع لک شما، پوستی روشن‌تر و یکدست‌تر می‌سازیم.',
    img: '/services/service-01.jpg',
  },
  {
    no: '02',
    title: 'تزریق فیلر ژل',
    tags: ['خط خنده', 'حجم‌دهی لب', 'خط اطراف چشم'],
    text: 'با بهبود چین و چروک و افتادگی، چهره‌ای طبیعی و جوان را هدف می‌گیریم.',
    img: '/services/service-02.jpg',
  },
  {
    no: '03',
    title: 'جوانسازی و مراقبت پوست',
    tags: ['مزوتراپی', 'شادابی پوست'],
    text: 'برنامه‌ی درمانی را متناسب با نوع پوست و خواسته‌ی شما طراحی می‌کنیم.',
    img: '/services/service-03.jpg',
  },
]
</script>

<template>
  <section id="services" class="relative w-full px-page pb-16 md:pb-24">
    <div class="mx-auto w-full max-w-300 divide-y divide-ink/30">
      <article v-for="s in services" :key="s.no"
        class="grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <!-- متن -->
        <div>
          <!-- شماره + عنوان -->
          <div class="flex items-end gap-5">
            <span class="border-b border-ink/40 pb-1 font-display text-lg tracking-widest text-ink">
              {{ s.no }}
            </span>
            <h3 class="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold text-ink">
              {{ s.title }}
            </h3>
          </div>

          <!-- تگ‌ها -->
          <ul class="mt-6 flex flex-wrap gap-2">
            <li v-for="t in s.tags" :key="t" class="rounded-full bg-[#ccd5ae] px-4 py-1.5 text-[12px] text-ink">
              # {{ t }}
            </li>
          </ul>

          <!-- توضیح با خط کناری -->
          <p class="mt-8 border-s border-ink/35 ps-5 text-[14px] leading-8 text-muted">
            {{ s.text }}
          </p>

          <!-- دکمه‌ها -->
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="#"
              class="inline-flex items-center gap-2 rounded-full border border-[#d4a373]/60 px-6 py-3 text-[13px] text-ink transition-colors duration-300 hover:bg-[#d4a373]/10">
              جزئیات بیشتر
              <Icon name="ph:caret-left" />
            </a>
            <a href="#"
              class="inline-flex items-center gap-2 rounded-full border border-[#d4a373]/60 px-6 py-3 text-[13px] text-ink transition-colors duration-300 hover:bg-[#d4a373]/10">
              مشاهده‌ی نمونه نتایج
              <Icon name="ph:caret-left" />
            </a>
          </div>
        </div>

        <!-- عکس قرصی + هاور فید -->
        <figure class="group relative aspect-2/1 w-full overflow-hidden rounded-full">
          <img :src="s.img" :alt="s.title"
            class="h-full w-full object-cover motion-safe:transition-[transform,opacity,filter] motion-safe:duration-700 motion-safe:ease-out group-hover:opacity-80 motion-safe:group-hover:scale-105"
            loading="lazy" />
          <span
            class="pointer-events-none absolute inset-0 bg-[#d4a373]/25 opacity-0 motion-safe:transition-opacity motion-safe:duration-700 group-hover:opacity-100"
            aria-hidden="true" />
        </figure>
      </article>
    </div>
  </section>
</template>