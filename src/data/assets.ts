/** Image URLs sourced from the Stitch Aura Lumina project */
export const assets = {
  logo: '/logo.svg', // نشان محلی (L + نقطهٔ نور) با رنگ‌های برند
  hero: '/hero/lumina-hero.jpg', // public fallback; HeroSection imports from ~/assets/hero
 services: [
'/services/hifu.jpg',
'/services/profhilo.jpg',
'/services/filler.jpg',
'/services/consult.jpg',
'/services/bridal.jpg',
'/services/facial-care.jpg',

],
  // فایل‌های محلی (public/doctors)؛ ترتیب: رستمی، بهرامی، کاویانی
  doctors: [
    '/doctors/rostami.jpg',
    '/doctors/bahrami.jpg',
    '/doctors/kaviani.jpg',
  ],
  // تصاویر محلی (public/hero). فقط `.after` در صفحهٔ اصلی استفاده می‌شود؛ `before` برای سازگاری با ساختار قبلی است.
  gallery: [
    { before: '/hero/clinic-01.jpg', after: '/hero/lumina-hero-alt.jpg' },
    { before: '/hero/clinic-03.jpg', after: '/hero/clinic-02.jpg' },
    { before: '/hero/clinic-04.jpg', after: '/hero/clinic-05.jpg' },
  ],
} as const
