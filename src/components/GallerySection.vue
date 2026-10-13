<template>
  <section class="max-w-7xl mx-auto py-16 px-5 text-center font-sans text-[#1a2b4b]">

    <!-- بخش هدر -->
    <div class="mb-16">
      <h2
        class="text-xl tracking-[0.2em] relative inline-block mb-2.5 after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-px after:bg-[#1a2b4b]">
        منو
      </h2>
      <h3 class="text-3xl font-medium mt-8 mb-5">چه مشکلی دارید؟</h3>
      <p class="text-[0.95rem] leading-relaxed text-slate-600 mb-10">
        ما کلینیک پوست و زیبایی هستیم و<br />
        منوهای متنوعی متناسب با مشکلات پوست و بدن شما ارائه می‌دهیم.
      </p>

      <!-- دکمه‌ها -->
      <div class="flex flex-col md:flex-row justify-center gap-5">
        <button
          class="bg-transparent border border-slate-300 rounded-full py-3 px-8 text-[0.95rem] text-[#1a2b4b] cursor-pointer flex items-center justify-between md:justify-center gap-4 transition-all duration-300 hover:bg-slate-50 hover:border-[#1a2b4b] w-full max-w-[300px] mx-auto md:mx-0 md:w-auto">
          مشاهده لیست خدمات <span class="text-[0.7rem] text-slate-400">◀</span>
        </button>
        <button
          class="bg-transparent border border-slate-300 rounded-full py-3 px-8 text-[0.95rem] text-[#1a2b4b] cursor-pointer flex items-center justify-between md:justify-center gap-4 transition-all duration-300 hover:bg-slate-50 hover:border-[#1a2b4b] w-full max-w-[300px] mx-auto md:mx-0 md:w-auto">
          جستجو بر اساس مشکل <span class="text-[0.7rem] text-slate-400">◀</span>
        </button>
      </div>
    </div>

    <!-- بخش گرید آیکون‌ها (این بخش عالیه، دست نزن) -->
    <!-- بخش گرید آیکون‌ها -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-10 justify-items-center">

      <div v-for="item in menuItems" :key="item.id"
        class="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1.5">

        <!-- دایره آبی روشن -->
        <div
          class="w-[100px] h-[100px] md:w-[130px] md:h-[130px] bg-[#f4f8fc] rounded-full flex justify-center items-center mb-5 transition-shadow duration-300 group-hover:shadow-lg">

          <!-- ✅ سایز آیکون بزرگ‌تر شد (استفاده از ۵۰ درصد سایز دایره) -->
          <!-- برای آیکون‌های بزرگتر -->
          <Icon :name="item.icon" class="w-[65px] h-[65px] md:w-[85px] md:h-[85px] text-[#1a2b4b]" />
        </div>

        <p class="text-sm text-[#1a2b4b] font-medium m-0">{{ item.title }}</p>
      </div>

    </div>
  </section>
</template>

<script setup>

// ✅ اینجا اسم فایل‌های SVG خودت رو برای هر آیتم به صورت مجزا بنویس
const menuItems = [
  { id: 1, title: 'لیفت و کوچک‌کردن صورت', icon: 'my-icons:parts-icn01' },
  { id: 2, title: 'دور چشم', icon: 'my-icons:parts-icn03' },
  { id: 3, title: 'فرم بدن', icon: 'my-icons:parts-icn06' },
  { id: 4, title: 'بینی', icon: 'my-icons:parts-icn07' },
  { id: 5, title: 'تزریق مواد', icon: 'my-icons:parts-icn08' },
  { id: 6, title: 'سینه', icon: 'my-icons:parts-icn09' },
  { id: 7, title: 'لک و تیرگی', icon: 'my-icons:parts-icn011' },
  { id: 8, title: 'شادابی و قرمزی', icon: 'my-icons:parts-icn012' },
  { id: 9, title: 'منافذ و جوش', icon: 'my-icons:parts-icn14' },
  { id: 10, title: 'جای جوش و فرورفتگی', icon: 'my-icons:parts-icn13' },
  { id: 11, title: 'چین و چروک', icon: 'my-icons:parts-icn15' },
  { id: 12, title: 'افتادگی پوست', icon: 'my-icons:parts-icn16' },
  { id: 13, title: 'لیزر موهای زائد', icon: 'my-icons:parts-icn17' },
  { id: 14, title: 'آرت‌میک و تتو', icon: 'my-icons:parts-icn18' },
  { id: 15, title: 'مراقبت پوستی', icon: 'my-icons:parts-icn15' }
];

</script>