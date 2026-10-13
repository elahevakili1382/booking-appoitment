import { computed, ref, watch, type Ref } from 'vue'
import { translations, type Dictionary, type Locale } from './translations'

const STORAGE_KEY = 'lumina-locale'

function readInitialLocale(): Locale {
  if (!import.meta.client) return 'fa'
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'en' || saved === 'fa' ? saved : 'fa'
}

const locale: Ref<Locale> = ref(readInitialLocale())

watch(
  locale,
  (next) => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.lang = next
      document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr'
      document.body.dataset.lang = next
    }
  },
  { immediate: true },
)

export function useLanguage() {
  const t = computed(() => translations[locale.value] as Dictionary)
  const dir = computed<'rtl' | 'ltr'>(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))

  function setLocale(next: Locale) {
    locale.value = next
  }

  function toggleLocale() {
    locale.value = locale.value === 'fa' ? 'en' : 'fa'
  }

  return {
    locale,
    t,
    dir,
    setLocale,
    toggleLocale,
  }
}
