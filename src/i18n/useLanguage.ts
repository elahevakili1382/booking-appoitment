import { computed, onMounted } from 'vue'
import { translations, type Dictionary, type Locale } from './translations'

const STORAGE_KEY = 'lumina-locale'

export function useLanguage() {
  // ✅ مقدار اولیه ثابت — روی سرور و کلاینت یکسان
  const locale = useState<Locale>('lumina-locale', () => 'fa')

  // ✅ ترجمه‌ها
  const t = computed(() => translations[locale.value] as Dictionary)

  // ✅ جهت
  const dir = computed<'rtl' | 'ltr'>(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))

  // ✅ تغییر زبان
  function setLocale(next: Locale) {
    locale.value = next
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.lang = next
      document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr'
      document.body.dataset.lang = next
    }
  }

  // ✅ تغییر بین fa و en
  function toggleLocale() {
    setLocale(locale.value === 'fa' ? 'en' : 'fa')
  }

  // ✅ فقط در کلاینت: خواندن از localStorage و اعمال
  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'fa') {
      locale.value = saved
      document.documentElement.lang = saved
      document.documentElement.dir = saved === 'fa' ? 'rtl' : 'ltr'
      document.body.dataset.lang = saved
    }
  })

  return {
    locale,
    t,
    dir,
    setLocale,
    toggleLocale,
  }
}