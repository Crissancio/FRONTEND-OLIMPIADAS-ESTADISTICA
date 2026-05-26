<script setup lang="ts">
import { User, Phone } from 'lucide-vue-next'
import type { DirectorResponseDTO } from '../types/directores.api'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

defineProps<{
  director: DirectorResponseDTO
}>()

const emit = defineEmits<{
  (e: 'desvincular', id: number): void
}>()
</script>

<template>
  <Card class="border-gray-200 shadow-sm">
    <CardContent class="p-4">
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User class="h-5 w-5" />
        </div>
        <div class="flex-1 space-y-1">
          <p class="font-bold text-text-main text-sm">
            {{ director.nombres }} {{ director.paterno }} {{ director.materno || '' }}
          </p>
          <div v-if="director.telefono_1 || director.telefono_2" class="flex items-center gap-1 text-xs text-text-muted">
            <Phone class="h-3 w-3" />
            <span>{{ director.telefono_1 }}</span>
            <span v-if="director.telefono_2"> / {{ director.telefono_2 }}</span>
          </div>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <Button variant="outline" size="sm" class="text-xs text-estado-rechazado border-estado-rechazado/30 hover:bg-estado-rechazado-soft" @click="emit('desvincular', director.id_director)">
          Desvincular
        </Button>
      </div>
    </CardContent>
  </Card>
</template>