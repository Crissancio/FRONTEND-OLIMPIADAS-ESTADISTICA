<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Image as ImageIcon, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{
  materiales: Record<string, any>
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentIndex = ref(0)

const slides = computed(() => {
  const list = []
  if (props.materiales['AFICHE']) list.push({ title: 'Afiche', ...props.materiales['AFICHE'] })
  if (props.materiales['REGLAMENTO']) list.push({ title: 'Reglamento', ...props.materiales['REGLAMENTO'] })
  if (props.materiales['CONVOCATORIA']) list.push({ title: 'Convocatoria', ...props.materiales['CONVOCATORIA'] })
  return list
})

const currentSlide = computed(() => slides.value[currentIndex.value])

const prevSlide = () => {
  currentIndex.value = currentIndex.value === 0 ? slides.value.length - 1 : currentIndex.value - 1
}

const nextSlide = () => {
  currentIndex.value = currentIndex.value === slides.value.length - 1 ? 0 : currentIndex.value + 1
}

watch([currentSlide, canvasRef], () => {
  if (!canvasRef.value || slides.value.length === 0) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const url = currentSlide.value?.enlace_acceso
  if (!url) return

  const isPdf = url.toLowerCase().endsWith('.pdf')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  if (isPdf) {
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(currentSlide.value.title, canvasRef.value.width / 2, canvasRef.value.height / 2 - 10)
    ctx.font = '14px sans-serif'
    ctx.fillText('Vista previa no disponible', canvasRef.value.width / 2, canvasRef.value.height / 2 + 15)
  } else {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const hRatio = canvasRef.value!.width / img.width
      const vRatio = canvasRef.value!.height / img.height
      const ratio  = Math.max(hRatio, vRatio)
      const cx = (canvasRef.value!.width - img.width * ratio) / 2
      const cy = (canvasRef.value!.height - img.height * ratio) / 2  
      ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio)
    }
    img.src = url
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full shrink-0 rounded-xl bg-gray-50 flex flex-col overflow-hidden h-[480px] border border-gray-200 relative group">
    
    <canvas 
      v-show="slides.length > 0" 
      ref="canvasRef" 
      width="400" 
      height="450" 
      class="w-full h-[calc(100%-56px)] object-cover"
    ></canvas>
    
    <div v-if="slides.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 p-6 text-center">
      <ImageIcon class="h-10 w-10 opacity-50" />
      <span class="text-sm font-medium">Sin materiales visuales</span>
      <p class="text-xs text-text-muted">No se ha cargado afiche, reglamento ni convocatoria principal.</p>
    </div>

    <template v-if="slides.length > 1">
      <button @click="prevSlide" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <button @click="nextSlide" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
        <ChevronRight class="w-5 h-5" />
      </button>
    </template>

    <div v-if="slides.length > 0" class="h-14 bg-white border-t border-gray-200 flex items-center justify-between px-4 mt-auto">
      <div class="flex items-center gap-1.5">
        <button 
          v-for="(_, index) in slides" 
          :key="index"
          @click="currentIndex = index"
          class="h-2 rounded-full transition-all duration-300"
          :class="currentIndex === index ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'"
        ></button>
      </div>
      
      <a :href="currentSlide?.enlace_acceso" target="_blank" class="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-secondary-dark transition-colors">
        Abrir <ExternalLink class="w-3.5 h-3.5" />
      </a>
    </div>
  </div>
</template>