<script setup lang="ts">
useSmoothScroll()
// import CloudyShader from './CloudyShader.vue'
// import HeroSection from './HeroSection.vue'
// import HomeNews from './HomeNews.vue'
// import HomeMessage from './HomeMessage.vue'
// import MessageEllipse from './MessageEllipse.vue'
// import HorizontalJourney from './HorizontalJourney.vue'
// import ReasonStory from './ReasonStory.vue'
// import FirstVisit from './FirstVisit.vue'
// import ServicesSection from './ServicesSection.vue'
// import GallerySection from './GallerySection.vue'
// import HomeBlog from './HomeBlog.vue'
// import FinalCta from './FinalCta.vue'
</script>

<template>
  <div class="w-full max-w-[100vw] min-w-0 overflow-x-clip bg-[#fefae0]">
    <div class="relative isolate w-full">
      <CloudyShader color-top="#f1d3a5" color-mid="#fefae0" color-bottom="#cdd9a0" color-accent="#d4a373"
        :speed="0.8" />
      <HeroSection />
      <HomeNews />
      <HomeMessage />
      <MessageEllipse />
    </div>


    <PromiseDoctor />
    <ReasonStory />
    <FirstVisit />
    <ServicesSection />
    <GallerySection />
    <CaseResultSection />
  </div>
</template>
