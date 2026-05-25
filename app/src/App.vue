<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition name="route-fade" mode="out-in">
      <component :is="Component" :key="route.path.startsWith('/admin') && route.path !== '/admin/login' ? 'admin-layout' : route.matched[0]?.path === '/' ? 'public-layout' : route.fullPath" />
    </transition>
  </router-view>
  <Toaster position="top-right" rich-colors />
</template>
