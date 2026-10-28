// تصاویر نمایشی (placeholder) — جایگزین با نمونه‌کارهای واقعی و با رضایت بیمار
export type GalleryCategory = 'filler' | 'skin' | 'eye'

export interface GalleryCase {
  id: string
  category: GalleryCategory
  treatment: string
  title: string
  description: string
  sessions: string
  img: string
}

export const galleryCategories: { key: GalleryCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'filler', label: 'فیلر' },
  { key: 'skin', label: 'پوست' },
  { key: 'eye', label: 'ناحیه چشم' },
]

export const galleryCases: GalleryCase[] = [
  {
    id: '01',
    category: 'filler',
    treatment: 'فیلر لب',
    title: 'تزریق ژل برای برجسته‌سازی طبیعی لب',
    description: 'با تزریق هدفمند، حجم طبیعی و متقارن به لب‌ها داده می‌شود.',
    sessions: 'یک جلسه',
    img: '/results/images (30).jpg',
  },
  {
    id: '02',
    category: 'skin',
    treatment: 'لیزر پوست',
    title: 'جوانسازی و یکدست‌سازی رنگ پوست',
    description: 'بهبود لک و افزایش شفافیت پوست با چند جلسه‌ی درمان.',
    sessions: 'سه جلسه',
    img: '/results/images (33).jpg',
  },
  {
    id: '03',
    category: 'eye',
    treatment: 'تزریق زیر چشم',
    title: 'رفع تیرگی و افتادگی دور چشم',
    description: 'کاهش گودی و تیرگی دور چشم با روشی کم‌تهاجمی.',
    sessions: 'یک تا دو جلسه',
    img: '/results/images (34).jpg',
  },
  {
    id: '04',
    category: 'filler',
    treatment: 'فیلر چانه و خط فک',
    title: 'متعادل‌سازی طبیعی خط فک و چانه',
    description: 'با تزریق دقیق، تعادل و تناسب چهره بدون تغییر محسوس حفظ می‌شود.',
    sessions: 'یک جلسه',
    img: '/results/filler.jpg',
  },
  {
    id: '05',
    category: 'filler',
    treatment: 'فیلر لب',
    title: 'حجم‌دهی و تقارن لب‌ها',
    description: 'افزایش حجم لب با حفظ فرم طبیعی و تقارن.',
    sessions: 'یک جلسه',
    img: '/results/filler2.jpg',
  },
  {
    id: '06',
    category: 'filler',
    treatment: 'فیلر لب',
    title: 'پرپشتی و شکل‌دهی ظریف لب',
    description: 'تزریق ژل برای لب‌هایی پرتر و با خط لب مشخص‌تر.',
    sessions: 'یک جلسه',
    img: '/results/filler3.jpg',
  },
  {
    id: '07',
    category: 'filler',
    treatment: 'فیلر لب',
    title: 'ترمیم خط لب و افزایش شادابی',
    description: 'بهبود فرم و حجم لب‌ها با نتیجه‌ای نزدیک به حالت طبیعی.',
    sessions: 'یک جلسه',
    img: '/results/lip-ba.webp',
  },
  {
    id: '08',
    category: 'skin',
    treatment: 'درمان ملاسما',
    title: 'کاهش لک‌های قهوه‌ای گونه',
    description: 'روشن‌تر شدن لک و یکدست‌تر شدن رنگ پوست با درمان تخصصی.',
    sessions: 'چند جلسه',
    img: '/results/melasma.jpg',
  },
  {
    id: '09',
    category: 'skin',
    treatment: 'درمان ملاسما',
    title: 'یکدست‌سازی رنگ پوست صورت',
    description: 'کم‌رنگ شدن لک‌های پوستی با برنامه‌ی درمانی و مراقبت منظم.',
    sessions: 'چند جلسه',
    img: '/results/melasma1.jpg',
  },
]
