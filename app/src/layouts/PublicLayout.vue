<script setup lang="ts">
import Navbar from '@/shared/components/ui/organisms/Navbar.vue'
import Footer from '@/shared/components/ui/organisms/Footer.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen font-sans">
    <Navbar />
    <main class="flex-grow flex flex-col w-full">
      <router-view />
    </main>
    <Footer />
  </div>
</template>
