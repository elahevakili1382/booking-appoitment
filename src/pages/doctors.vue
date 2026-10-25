<script setup lang="ts">
interface Doctor {
  id: string
  nameFa: string
  nameEn?: string
  roleFa: string
  roleEn?: string
  imageUrl?: string
  active: boolean
}

interface DoctorsResponse {
  ok: boolean
  data: Doctor[]
}

const { data, status, error, refresh } = await useAsyncData(
  'doctors-page',
  () => $fetch<DoctorsResponse>('/api/doctors'),
)

const doctors = computed(() => data.value?.data ?? [])

const failedImages = ref<Record<string, boolean>>({})

function onImageError(id: string) {
  failedImages.value[id] = true
}

useSeoMeta({
  title: 'پزشکان و پرسنل | Lumina Clinic',
  description:
    'با پزشکان و تیم کلینیک لومینا آشنا شوید و زمان مناسب برای مشاوره خود را انتخاب کنید.',
})
</script>

<template>
  <section dir="rtl" aria-labelledby="doctors-title" class="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
    <div class="mx-auto w-full max-w-6xl">
      <!-- عنوان صفحه -->
      <header class="mx-auto mb-8 max-w-2xl text-center sm:mb-10 lg:mb-12">
        <p class="text-xs font-medium leading-7 text-primary sm:text-sm">
          تیم کلینیک لومینا
        </p>

        <h1 id="doctors-title"
          class="mt-2 break-words text-2xl font-bold leading-normal text-on-surface sm:text-3xl lg:text-4xl">
          پزشکان و پرسنل
        </h1>

        <p class="mx-auto mt-3 max-w-lg text-sm leading-8 text-on-surface-variant">
          با تیم ما آشنا شوید و زمان مناسب برای مشاوره خود را انتخاب کنید.
        </p>

        <span aria-hidden="true" class="mx-auto mt-5 block h-1 w-10 rounded-full bg-primary/60" />
      </header>

      <!-- بارگذاری -->
      <div v-if="status === 'pending'" role="status" class="py-16 text-center text-sm text-on-surface-variant">
        در حال دریافت اطلاعات پزشکان…
      </div>

      <!-- خطا -->
      <div v-else-if="error" role="alert" class="rounded-2xl border border-outline-variant/20 bg-white p-6 text-center">
        <p class="text-sm leading-7 text-on-surface-variant">
          دریافت اطلاعات پزشکان انجام نشد.
        </p>

        <button type="button"
          class="mt-4 min-h-11 rounded-xl border border-primary/30 px-5 py-2 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          @click="refresh()">
          تلاش دوباره
        </button>
      </div>

      <!-- پزشکان -->
      <div v-else-if="doctors.length"
        class="mx-auto grid max-w-sm grid-cols-1 gap-6 sm:max-w-3xl sm:grid-cols-4 lg:max-w-none lg:grid-cols-3">
        <article v-for="(doctor, index) in doctors" :key="doctor.id"
          class="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm sm:col-span-2 lg:col-span-1"
          :class="{
            'sm:col-start-2 lg:col-start-auto':
              doctors.length % 2 === 1 &&
              index === doctors.length - 1,
          }">
          <!-- تصویر -->
          <div class="aspect-[4/5] w-full overflow-hidden bg-primary/10">
            <img v-if="doctor.imageUrl && !failedImages[doctor.id]" :src="doctor.imageUrl" :alt="doctor.nameFa"
              width="480" height="600" loading="lazy" decoding="async"
              class="block h-full w-full object-cover object-top" @error="onImageError(doctor.id)">

            <div v-else class="flex h-full w-full items-center justify-center text-5xl font-bold text-primary">
              {{ doctor.nameFa?.trim().slice(0, 1) || 'پ' }}
            </div>
          </div>

          <!-- اطلاعات -->
          <div class="flex flex-1 flex-col p-5 text-center sm:p-6">
            <h2 class="break-words text-lg font-bold leading-8 text-on-surface">
              {{ doctor.nameFa }}
            </h2>

            <p class="mt-1 break-words text-sm leading-7 text-on-surface-variant">
              {{ doctor.roleFa }}
            </p>

            <div class="mt-auto pt-5">
              <NuxtLink :to="{
                path: '/book',
                query: { doctor: doctor.id },
              }" :aria-label="`مشاهده زمان‌های رزرو ${doctor.nameFa}`"
                class="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none">
                <span>مشاهده تقویم و رزرو</span>

                <svg class="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 12H5M5 12L11 18M5 12L11 6" stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <!-- لیست خالی -->
      <p v-else class="py-16 text-center text-sm leading-8 text-on-surface-variant">
        در حال حاضر اطلاعاتی برای نمایش وجود ندارد.
      </p>
    </div>
  </section>
</template>