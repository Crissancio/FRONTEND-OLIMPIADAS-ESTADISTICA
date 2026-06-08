<script setup lang="ts">
import Card from '@/shared/components/ui/molecules/Card.vue'
</script>

<template>
  <Card class="rounded-2xl shadow-sm border-gray-100 overflow-hidden h-64 md:h-80 p-0 relative">
    <iframe 
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.4238339495046!2d-68.1295342!3d-16.504686999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915f218523686fd7%3A0xfd474f7db2882ff7!2sCarrera%20de%20Estad%C3%ADstica!5e0!3m2!1ses-419!2sbo!4v1780928333431!5m2!1ses-419!2sbo"
      width="100%" 
      height="100%" 
      style="border: 0" 
      allowfullscreen="false" 
      loading="lazy" 
      referrerpolicy="no-referrer-when-downgrade"
      class="absolute inset-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
    ></iframe>
  </Card>
</template>
