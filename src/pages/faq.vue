<script setup lang="ts">
type FaqCategory =
  | 'booking'
  | 'consultation'
  | 'injectables'
  | 'laser'
  | 'aftercare'

interface Faq {
  id: string
  category: FaqCategory
  q: string
  a: string
}

const search = ref('')
const selectedCategory = ref<FaqCategory | 'all'>('all')

const categories: Array<{
  id: FaqCategory | 'all'
  label: string
}> = [
    { id: 'all', label: 'همه سؤالات' },
    { id: 'booking', label: 'رزرو و هزینه' },
    { id: 'consultation', label: 'پیش از مراجعه' },
    { id: 'injectables', label: 'تزریقات' },
    { id: 'laser', label: 'لیزر' },
    { id: 'aftercare', label: 'مراقبت و پیگیری' },
  ]

const faqs: Faq[] = [
  {
    id: 'booking',
    category: 'booking',
    q: 'چطور برای یک خدمت نوبت بگیرم؟',
    a: 'از صفحه خدمات، گزینه رزرو خدمت موردنظر را انتخاب کنید و مراحل انتخاب پزشک و زمان را ادامه دهید. در پایان، خلاصه اطلاعات و وضعیت ثبت نوبت را بررسی کنید.',
  },
  {
    id: 'price',
    category: 'booking',
    q: 'آیا هزینه درج‌شده در سایت، هزینه نهایی است؟',
    a: 'عبارت «شروع از» نشان‌دهنده هزینه اولیه است. هزینه نهایی می‌تواند به نوع خدمت، ناحیه موردنظر، مواد مصرفی و برنامه جلسات بستگی داشته باشد. پیش از پرداخت، مبلغ نهایی و مواردی را که شامل می‌شود از کلینیک تأیید کنید.',
  },
  {
    id: 'deposit',
    category: 'booking',
    q: 'آیا برای رزرو باید بیعانه پرداخت کنم؟',
    a: 'شرایط پرداخت باید در مرحله رزرو همان خدمت مشخص شود. پیش از پرداخت، مبلغ بیعانه و شرایط استرداد را بررسی کنید. اگر این اطلاعات نمایش داده نشده است، از پذیرش سؤال کنید.',
  },
  {
    id: 'cancellation',
    category: 'booking',
    q: 'چطور نوبتم را تغییر بدهم یا لغو کنم؟',
    a: 'شرایط تغییر و لغو را در اطلاعات نوبت و قوانین رزرو بررسی کنید. اگر گزینه تغییر یا لغو در حساب کاربری در دسترس نیست، با پذیرش تماس بگیرید. مهلت مجاز و شرایط بازگشت وجه باید پیش از ثبت نوبت روشن باشد.',
  },
  {
    id: 'choose-service',
    category: 'consultation',
    q: 'اگر ندانم کدام خدمت مناسب من است، چه کار کنم؟',
    a: 'به‌جای انتخاب مستقیم یک روش، برای مشاوره اقدام کنید. در جلسه مشاوره، دغدغه شما، وضعیت پوست یا مو، سوابق پزشکی و انتظاراتتان بررسی می‌شود تا گزینه‌های مناسب و محدودیت‌های هرکدام مشخص شود.',
  },
  {
    id: 'medical-history',
    category: 'consultation',
    q: 'پیش از مراجعه چه اطلاعاتی را به پزشک بگویم؟',
    a: 'بیماری‌ها، حساسیت‌ها، داروها و مکمل‌های مصرفی، درمان‌های قبلی و سابقه واکنش به اقدامات زیبایی را مطرح کنید. بارداری، قصد بارداری یا شیردهی را نیز اطلاع دهید. دارو یا مکملی را برای انجام خدمت، خودسرانه قطع نکنید.',
  },
  {
    id: 'results',
    category: 'consultation',
    q: 'آیا نتیجه من دقیقاً شبیه عکس‌های قبل و بعد می‌شود؟',
    a: 'عکس نمونه نمی‌تواند نتیجه فردی شما را تضمین کند. در مشاوره درباره نتیجه واقع‌بینانه، محدودیت‌ها، تعداد جلسات و احتمال نیاز به پیگیری سؤال کنید.',
  },
  {
    id: 'provider',
    category: 'consultation',
    q: 'پیش از انتخاب پزشک چه مواردی را بررسی کنم؟',
    a: 'درباره صلاحیت و تجربه فرد انجام‌دهنده، تجربه او در موارد مشابه، گزینه‌های جایگزین، خطرها، دوره نقاهت و مسیر پیگیری سؤال کنید. مشخص کنید چه کسی اقدام را انجام می‌دهد و در صورت بروز مشکل با چه کسی باید تماس بگیرید.',
  },
  {
    id: 'injection-consultation',
    category: 'injectables',
    q: 'آیا رزرو مشاوره بوتاکس یا فیلر به معنی انجام تزریق است؟',
    a: 'خیر؛ مشاوره برای بررسی مناسب‌بودن اقدام است. انجام تزریق به ارزیابی پزشک، بررسی سوابق و گفت‌وگو درباره مزایا، خطرها و انتظارات بستگی دارد. ممکن است گزینه دیگری پیشنهاد شود.',
  },
  {
    id: 'filler',
    category: 'injectables',
    q: 'پیش از تزریق فیلر چه سؤال‌هایی بپرسم؟',
    a: 'نام و نوع محصول، کاربرد آن برای ناحیه موردنظر، تجربه پزشک، عوارض احتمالی، ماندگاری مورد انتظار و هزینه را بپرسید. سوابق پزشکی و تزریق‌های قبلی را نیز مطرح کنید.',
  },
  {
    id: 'laser-preparation',
    category: 'laser',
    q: 'پیش از لیزر موهای زائد چه اطلاعاتی لازم است؟',
    a: 'درباره رنگ پوست و مو، برنزه‌شدن اخیر، سابقه اسکار یا کلوئید، تبخال و داروهای مصرفی اطلاع دهید. دستور آماده‌سازی ناحیه و زمان‌بندی جلسه را از کلینیک دریافت کنید.',
  },
  {
    id: 'laser-sessions',
    category: 'laser',
    q: 'برای لیزر موهای زائد چند جلسه لازم است؟',
    a: 'تعداد و فاصله جلسات برای همه یکسان نیست. در ارزیابی اولیه، درباره برنامه پیشنهادی، نتیجه قابل انتظار، محدودیت‌ها و احتمال نیاز به جلسات نگهدارنده سؤال کنید.',
  },
  {
    id: 'downtime',
    category: 'aftercare',
    q: 'چه زمانی می‌توانم به فعالیت روزانه برگردم؟',
    a: 'پیش از انجام خدمت، درباره استراحت، ورزش، آرایش، قرارگرفتن در آفتاب و زمان بازگشت به فعالیت‌های معمول سؤال کنید و دستور مراقبتی مخصوص همان خدمت را دریافت کنید.',
  },
  {
    id: 'follow-up',
    category: 'aftercare',
    q: 'مراقبت‌های بعد از خدمت را از کجا دریافت کنم؟',
    a: 'دستور مراقبت و مسیر تماس برای پیگیری را از تیم درمان دریافت کنید. مطالب عمومی سایت جایگزین دستور اختصاصی شما نیستند. اگر علامتی شدید، غیرمنتظره یا رو به تشدید دارید، پیگیری پزشکی را به خواندن مطالب سایت محدود نکنید.',
  },
]

function normalize(value: string) {
  return value
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .toLowerCase()
    .trim()
}

const filteredFaqs = computed(() => {
  const query = normalize(search.value)

  return faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory.value === 'all' ||
      faq.category === selectedCategory.value

    const matchesSearch =
      !query ||
      normalize(`${faq.q} ${faq.a}`).includes(query)

    return matchesCategory && matchesSearch
  })
})

function resetFilters() {
  search.value = ''
  selectedCategory.value = 'all'
}

useSeoMeta({
  title: 'سؤالات متداول | Lumina Clinic',
  description:
    'پاسخ پرسش‌های متداول درباره رزرو، هزینه، مشاوره، تزریقات، لیزر و مراقبت پس از خدمات.',
})
</script>

<template>
  <section dir="rtl" aria-labelledby="faq-title" class="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
    <div class="mx-auto w-full max-w-6xl">
      <!-- عنوان -->
      <header class="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
        <p class="text-xs font-medium leading-7 text-primary sm:text-sm">
          راهنمای مراجعه به لومینا
        </p>

        <h1 id="faq-title" class="mt-2 text-2xl font-bold leading-normal text-on-surface sm:text-3xl lg:text-4xl">
          سؤالات متداول
        </h1>

        <p class="mx-auto mt-3 max-w-lg text-sm leading-8 text-on-surface-variant">
          پیش از رزرو و مراجعه، پاسخ پرسش‌های رایج را اینجا پیدا کنید.
        </p>

        <span aria-hidden="true" class="mx-auto mt-5 block h-1 w-10 rounded-full bg-primary/60" />
      </header>

      <!-- جست‌وجو و موضوعات -->
      <div class="mb-8">
        <label class="mx-auto block max-w-lg">
          <span class="mb-2 block text-xs leading-6 text-on-surface-variant">
            دنبال چه موضوعی هستید؟
          </span>

          <input v-model="search" type="search" aria-controls="faq-results" placeholder="مثلاً: هزینه، لیزر، مراقبت…"
            class="min-h-12 w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-base text-on-surface outline-none placeholder:text-on-surface-variant/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20">
        </label>

        <div aria-label="موضوع سؤالات" class="mt-5 flex flex-wrap justify-center gap-2">
          <button v-for="category in categories" :key="category.id" type="button"
            :aria-pressed="selectedCategory === category.id"
            class="min-h-11 max-w-full rounded-full border px-4 py-2 text-xs font-medium leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-sm motion-reduce:transition-none"
            :class="selectedCategory === category.id
                ? 'border-primary bg-primary text-white'
                : 'border-outline-variant/30 bg-white text-on-surface-variant hover:border-primary/50'
              " @click="selectedCategory = category.id">
            {{ category.label }}
          </button>
        </div>
      </div>

      <!-- موبایل: یک ستون / دسکتاپ: پرسش‌ها و راهنما -->
      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
        <div id="faq-results" class="min-w-0 lg:col-span-2">
          <p aria-live="polite" class="mb-3 text-xs leading-6 text-on-surface-variant">
            {{ filteredFaqs.length.toLocaleString('fa-IR') }}
            پرسش
          </p>

          <div v-if="filteredFaqs.length" class="space-y-3">
            <details v-for="faq in filteredFaqs" :key="faq.id"
              class="group min-w-0 overflow-hidden rounded-2xl border border-outline-variant/25 bg-white open:border-primary/50">
              <summary
                class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold leading-8 text-on-surface focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary sm:gap-4 sm:px-5 [&::-webkit-details-marker]:hidden">
                <span class="min-w-0 break-words">
                  {{ faq.q }}
                </span>

                <span aria-hidden="true"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg class="transition-transform group-open:rotate-180 motion-reduce:transition-none" width="16"
                    height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </span>
              </summary>

              <div class="px-4 pb-5 sm:px-5">
                <p
                  class="m-0 break-words border-t border-outline-variant/20 pt-4 text-sm leading-8 text-on-surface-variant">
                  {{ faq.a }}
                </p>
              </div>
            </details>
          </div>

          <!-- بدون نتیجه -->
          <div v-else class="rounded-2xl border border-dashed border-outline-variant/40 px-5 py-10 text-center">
            <h2 class="text-lg font-bold text-on-surface">
              پرسشی پیدا نشد
            </h2>

            <p class="mt-3 text-sm leading-8 text-on-surface-variant">
              عبارت کوتاه‌تری جست‌وجو کنید یا موضوع دیگری را انتخاب کنید.
            </p>

            <button type="button"
              class="mt-5 min-h-11 rounded-xl border border-primary/30 bg-white px-5 py-2 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              @click="resetFilters">
              نمایش همه سؤالات
            </button>
          </div>
        </div>

        <!-- راهنما -->
        <aside aria-labelledby="faq-help-title"
          class="min-w-0 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 lg:mt-9">
          <p class="text-xs font-medium leading-6 text-primary">
            راهنمای انتخاب
          </p>

          <h2 id="faq-help-title" class="mt-3 text-xl font-bold leading-9 text-on-surface">
            هنوز مطمئن نیستید؟
          </h2>

          <p class="mt-3 text-sm leading-8 text-on-surface-variant">
            اگر در انتخاب خدمت تردید دارید، ابتدا برای مشاوره اقدام کنید.
            پاسخ دقیق به شرایط شما پس از ارزیابی مشخص می‌شود.
          </p>

          <NuxtLink to="/book"
            class="mt-6 flex min-h-12 items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span>مشاهده زمان‌های رزرو</span>
            <span aria-hidden="true" class="shrink-0">←</span>
          </NuxtLink>

          <NuxtLink to="/contact"
            class="mt-2 flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            ارتباط با کلینیک
          </NuxtLink>
        </aside>
      </div>

      <p class="mx-auto mt-8 max-w-3xl text-center text-xs leading-7 text-on-surface-variant">
        این پاسخ‌ها برای آشنایی عمومی هستند و جایگزین ارزیابی پزشکی یا
        دستور مراقبتی اختصاصی شما نمی‌شوند.
      </p>
    </div>
  </section>
</template>