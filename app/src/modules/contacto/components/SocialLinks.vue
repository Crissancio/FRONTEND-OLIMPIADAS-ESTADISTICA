<script setup lang="ts">
import { Mail } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-primary rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
    <div class="absolute top-0 right-0 p-4 opacity-10">
      <Mail class="w-24 h-24" />
    </div>
    <h3 class="font-heading font-bold text-xl mb-2 relative z-10">Síguenos en Redes</h3>
    <p class="text-blue-100 text-sm mb-6 relative z-10">Mantente al tanto de las últimas noticias y actualizaciones.</p>
    <div class="flex gap-3 relative z-10">
      <a href="#" class="w-10 h-10 rounded-lg bg-white/20 hover:bg-white flex items-center justify-center text-white hover:text-primary transition-all">
        <span class="sr-only">Facebook</span>
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
        </svg>
      </a>
      <a href="#" class="w-10 h-10 rounded-lg bg-white/20 hover:bg-white flex items-center justify-center text-white hover:text-primary transition-all">
        <span class="sr-only">Instagram</span>
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      </a>
      <a href="#" class="w-10 h-10 rounded-lg bg-white/20 hover:bg-white flex items-center justify-center text-white hover:text-primary transition-all">
        <span class="sr-only">TikTok</span>
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.525.02c1.31 0 2.583.336 3.708.974a6.67 6.67 0 01-.645 2.14 4.417 4.417 0 01-2.22 2.164v4.582a6.386 6.386 0 11-4.354-6.079V6.36a3.81 3.81 0 101.789 3.42V0h1.722z" />
        </svg>
      </a>
    </div>
  </div>
</template>