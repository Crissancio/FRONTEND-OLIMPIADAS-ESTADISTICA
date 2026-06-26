<script setup lang="ts">
import { Maximize2, PictureInPicture2, X, ExternalLink, AlertCircle } from 'lucide-vue-next'
import { useTutorialesStore } from '../stores/tutoriales.store'

const store = useTutorialesStore()

function abrirPantallaCompleta() {
  const iframe = document.getElementById('inline-iframe') as HTMLIFrameElement | null
  if (iframe?.requestFullscreen) iframe.requestFullscreen()
}

function abrirEnDrive() {
  if (store.tutorialActivo) {
    window.open(store.tutorialActivo.driveUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div
    v-if="store.tutorialActivo"
    class="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-soft"
  >
    <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
      <div class="min-w-0 flex-1">
        <h3 class="truncate text-sm font-bold text-slate-800">
          {{ store.tutorialActivo.title }}
        </h3>
        <p class="text-[11px] text-slate-400 font-medium mt-0.5">
          {{ store.tutorialActivo.module }}
        </p>
      </div>
      <div class="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          title="Pantalla completa"
          class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600 cursor-pointer"
          @click="abrirPantallaCompleta"
        >
          <Maximize2 class="size-4" />
        </button>
        <button
          type="button"
          :title="store.pipActivo ? 'Volver al reproductor integrado' : 'Imagen en imagen — el video flota mientras navegas'"
          class="rounded-lg p-1.5 transition-colors hover:bg-gray-100 cursor-pointer"
          :class="store.pipActivo ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-600'"
          @click="store.pipActivo ? store.desactivarPip() : store.activarPip()"
        >
          <PictureInPicture2 class="size-4" />
        </button>
        <button
          type="button"
          title="Cerrar reproductor"
          class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600 cursor-pointer"
          @click="store.cerrarReproductor()"
        >
          <X class="size-4" />
        </button>
      </div>
    </div>

    <div v-if="!store.pipActivo">
      <div class="relative w-full bg-slate-900" style="aspect-ratio: 16/9">
        <iframe
          id="inline-iframe"
          :src="store.embedUrl"
          :title="store.tutorialActivo.title"
          class="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen"
          allowfullscreen
        />
      </div>
      <div class="flex items-center gap-2 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
        <AlertCircle class="size-3.5 text-slate-400 shrink-0" />
        <span class="text-xs text-slate-400 font-medium">
          ¿Problemas con el video? Visualízalo en Drive
        </span>
        <button
          type="button"
          class="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 cursor-pointer shrink-0"
          @click="abrirEnDrive"
        >
          <ExternalLink class="size-3.5" />
          Abrir en Drive
        </button>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center bg-gray-50/50 py-14 px-8 text-center"
    >
      <PictureInPicture2 class="size-8 text-primary/40 mb-3" />
      <p class="text-sm font-semibold text-slate-500">Reproduciendo en imagen en imagen</p>
      <p class="mt-1 text-xs text-slate-400">
        El video está flotando. Puedes navegar libremente.
      </p>
      <button
        type="button"
        class="mt-4 rounded-lg px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 cursor-pointer border border-primary/20"
        @click="store.desactivarPip()"
      >
        Volver al reproductor
      </button>
    </div>
  </div>
</template>