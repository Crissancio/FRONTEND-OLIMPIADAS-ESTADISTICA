import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tutorial } from '../data/tutoriales.data'
import { getDriveEmbedUrl } from '../data/tutoriales.data'

export const useTutorialesStore = defineStore('tutoriales', () => {
  const tutorialActivo = ref<Tutorial | null>(null)
  const embedUrl = ref('')

  function seleccionarTutorial(tutorial: Tutorial) {
    if (tutorialActivo.value?.id !== tutorial.id) {
      embedUrl.value = getDriveEmbedUrl(tutorial.driveUrl)
    }
    tutorialActivo.value = tutorial
  }

  function cerrarReproductor() {
    tutorialActivo.value = null
    embedUrl.value = ''
  }

  return {
    tutorialActivo,
    embedUrl,
    seleccionarTutorial,
    cerrarReproductor,
  }
})