<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Edit, Image as ImageIcon, FileText, Upload, Settings } from 'lucide-vue-next'
import { materialesService } from '@/modules/material/services/material.service'
import type { ConvocatoriaDTO } from '@/modules/convocatorias/types/convocatorias.api'
import type { TipoMaterialPrincipal, MaterialPrincipalPorTipo } from '@/modules/material/types/material.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

import ConfigArchivosModal from './ConfigArchivosModal.vue'
import ConvocatoriaMaterialAdminModal from '@/modules/material/components/ConvocatoriaMaterialAdminModal.vue'

const props = defineProps<{ convocatoria: ConvocatoriaDTO }>()

const isEditingFiles = ref(false)
const modalRef = ref<InstanceType<typeof ConfigArchivosModal> | null>(null)
const adminModalRef = ref<InstanceType<typeof ConvocatoriaMaterialAdminModal> | null>(null)

const afiche = ref<MaterialPrincipalPorTipo | null>(null)
const reglamento = ref<MaterialPrincipalPorTipo | null>(null)
const convocatoriaPdf = ref<MaterialPrincipalPorTipo | null>(null)

const fetchMaterialesPrincipales = async () => {
  try {
    const res = await materialesService.materialPrincipalConvocatoria(props.convocatoria.id_convocatoria)
    
    let lista: MaterialPrincipalPorTipo[] = []
    
    if (Array.isArray(res.data)) {
      lista = res.data
    } else if (res.data && Array.isArray((res.data as any).data)) {
      lista = (res.data as any).data
    }

    afiche.value = lista.find(m => m.tipo_material === 'AFICHE') || null
    reglamento.value = lista.find(m => m.tipo_material === 'REGLAMENTO') || null
    convocatoriaPdf.value = lista.find(m => m.tipo_material === 'CONVOCATORIA') || null
    
  } catch (err) {
    console.error('Error cargando materiales principales:', err)
  }
}

onMounted(() => {
  fetchMaterialesPrincipales()
})

// Ahora pasamos el material actual si es que existe para mostrarlo en el modal
const openModal = (tipo: TipoMaterialPrincipal, materialActual?: MaterialPrincipalPorTipo | null) => {
  if (modalRef.value) {
    modalRef.value.openModal(tipo, materialActual?.enlace_acceso, materialActual?.nombre_material)
  }
}

const openAdminModal = (idMaterial: number) => {
  if (adminModalRef.value) {
    adminModalRef.value.openModal(idMaterial)
  }
}
</script>

<template>
  <Card class="border-gray-200 bg-white shadow-soft">
    <CardHeader class="border-b border-gray-100 pb-4">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="flex items-center gap-2 text-text-main">
            <FileText class="h-5 w-5 text-primary" /> Archivos Principales
          </CardTitle>
          <p class="text-xs text-text-muted mt-1">Anexos fundamentales visibles en la plataforma para los aspirantes.</p>
        </div>
        <Button :variant="isEditingFiles ? 'default' : 'outline'" size="sm" @click="isEditingFiles = !isEditingFiles">
          <Edit class="h-4 w-4 mr-2" /> {{ isEditingFiles ? 'Finalizar Edición' : 'Editar Archivos' }}
        </Button>
      </div>
    </CardHeader>
    
    <CardContent class="pt-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        
        <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ImageIcon class="h-5 w-5" />
              </div>
              <div class="flex-1 min-w-0">
                <p v-if="afiche" class="font-bold text-sm text-text-main truncate" :title="afiche.nombre_material">
                  {{ afiche.nombre_material }}
                </p>
                <p v-else class="font-bold text-sm text-text-main">Afiche Promocional</p>
                
                <p v-if="afiche" class="text-[10px] font-semibold text-primary mt-0.5 uppercase">
                  {{ afiche.tipo_material }}
                </p>
                <p v-else class="text-[10px] text-text-muted mt-0.5">.JPG, .PNG</p>
              </div>
            </div>
            <Badge v-if="afiche" variant="success" >Cargado</Badge>
            <Badge v-else variant="outline" >Falta</Badge>
          </div>
          <div class="mt-4 flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button v-if="afiche" variant="outline" size="sm" class="flex-1 text-xs" @click="openAdminModal(afiche.id_material)">
              <Settings class="mr-1.5 h-3.5 w-3.5" /> Editar
            </Button>
            <Button v-if="isEditingFiles" variant="accent" size="sm" class="flex-1 text-xs" @click="openModal('AFICHE', afiche)">
              <Upload class="mr-1.5 h-3.5 w-3.5" /> {{ afiche ? 'Reemplazar' : 'Subir' }}
            </Button>
          </div>
        </div>

        <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText class="h-5 w-5" />
              </div>
              <div class="flex-1 min-w-0">
                <p v-if="reglamento" class="font-bold text-sm text-text-main truncate" :title="reglamento.nombre_material">
                  {{ reglamento.nombre_material }}
                </p>
                <p v-else class="font-bold text-sm text-text-main">Reglamento Oficial</p>
                
                <p v-if="reglamento" class="text-[10px] font-semibold text-primary mt-0.5 uppercase">
                  {{ reglamento.tipo_material }}
                </p>
                <p v-else class="text-[10px] text-text-muted mt-0.5">.PDF, .DOCX</p>
              </div>
            </div>
            <Badge v-if="reglamento" variant="success" >Cargado</Badge>
            <Badge v-else variant="outline" >Falta</Badge>
          </div>
          <div class="mt-4 flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button v-if="reglamento" variant="outline" size="sm" class="flex-1 text-xs" @click="openAdminModal(reglamento.id_material)">
              <Settings class="mr-1.5 h-3.5 w-3.5" /> Editar
            </Button>
            <Button v-if="isEditingFiles" variant="accent" size="sm" class="flex-1 text-xs" @click="openModal('REGLAMENTO', reglamento)">
              <Upload class="mr-1.5 h-3.5 w-3.5" /> {{ reglamento ? 'Reemplazar' : 'Subir' }}
            </Button>
          </div>
        </div>

        <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText class="h-5 w-5" />
              </div>
              <div class="flex-1 min-w-0">
                <p v-if="convocatoriaPdf" class="font-bold text-sm text-text-main truncate" :title="convocatoriaPdf.nombre_material">
                  {{ convocatoriaPdf.nombre_material }}
                </p>
                <p v-else class="font-bold text-sm text-text-main">Convocatoria Base</p>
                
                <p v-if="convocatoriaPdf" class="text-[10px] font-semibold text-primary mt-0.5 uppercase">
                  {{ convocatoriaPdf.tipo_material }}
                </p>
                <p v-else class="text-[10px] text-text-muted mt-0.5">.PDF, .DOCX</p>
              </div>
            </div>
            <Badge v-if="convocatoriaPdf" variant="success" >Cargado</Badge>
            <Badge v-else variant="outline" >Falta</Badge>
          </div>
          <div class="mt-4 flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button v-if="convocatoriaPdf" variant="outline" size="sm" class="flex-1 text-xs" @click="openAdminModal(convocatoriaPdf.id_material)">
              <Settings class="mr-1.5 h-3.5 w-3.5" /> Editar
            </Button>
            <Button v-if="isEditingFiles" variant="accent" size="sm" class="flex-1 text-xs" @click="openModal('CONVOCATORIA', convocatoriaPdf)">
              <Upload class="mr-1.5 h-3.5 w-3.5" /> {{ convocatoriaPdf ? 'Reemplazar' : 'Subir' }}
            </Button>
          </div>
        </div>

      </div>
    </CardContent>

    <ConfigArchivosModal 
      ref="modalRef" 
      :convocatoria-id="convocatoria.id_convocatoria" 
      :convocatoria-nombre="convocatoria.nombre_convocatoria"
      :convocatoria-gestion="convocatoria.gestion"
      @refresh="fetchMaterialesPrincipales"
    />

    <ConvocatoriaMaterialAdminModal 
      ref="adminModalRef" 
      @refresh="fetchMaterialesPrincipales"
    />
  </Card>
</template>