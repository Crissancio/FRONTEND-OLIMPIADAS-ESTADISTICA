<script setup lang="ts">
import type { ConvocatoriaDTO } from '@/modules/convocatorias/types/convocatorias.api'

import ConfigGeneralForm from './configuracion/ConfigGeneralForm.vue'
import ConfigArchivosPrincipales from './configuracion/ConfigArchivosPrincipales.vue'
import ConfigDangerZone from './configuracion/ConfigDangerZone.vue'

defineProps<{ convocatoria: ConvocatoriaDTO }>()

const emit = defineEmits(['refreshConvocatoria'])

const triggerRefresh = () => {
  emit('refreshConvocatoria')
}
</script>

<template>
  <div class="space-y-6">
    <ConfigGeneralForm 
      :convocatoria="convocatoria" 
      @refresh="triggerRefresh" 
    />
    
    <ConfigArchivosPrincipales 
      :convocatoria="convocatoria" 
    />
    
    <ConfigDangerZone 
      :convocatoria="convocatoria" 
      @refresh="triggerRefresh" 
    />
  </div>
</template>