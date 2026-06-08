<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X, CalendarClock, User, ShieldAlert, Activity, FileText } from 'lucide-vue-next'
import type { AuditoriaDTO } from '../types/sistema.api'

const props = defineProps<{
  isOpen: boolean
  log: AuditoriaDTO | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date(dateStr))
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="emit('close')" class="relative z-50">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leave-from="translate-x-0" leave-to="translate-x-full">
              <DialogPanel class="pointer-events-auto w-screen max-w-md">
                <div class="flex h-full flex-col bg-white shadow-2xl" v-if="log">
                  
                  <div class="flex items-center justify-between bg-gray-900 px-6 py-4 text-white">
                    <div>
                      <DialogTitle class="font-heading text-lg font-bold flex items-center gap-2">
                        <ShieldAlert v-if="log.accion === 'LOGIN_FALLIDO'" class="text-red-400 w-5 h-5" />
                        <Activity v-else class="text-emerald-400 w-5 h-5" />
                        Detalle de Auditoría
                      </DialogTitle>
                      <p class="text-xs text-gray-400 mt-1 font-mono">ID Registro: #{{ log.id_auditoria }}</p>
                    </div>
                    <button @click="emit('close')" class="rounded-full p-1.5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                      <X class="h-5 w-5" />
                    </button>
                  </div>

                  <div class="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                      <div class="bg-white p-2.5 rounded-lg border border-gray-100 text-gray-500 shadow-sm shrink-0">
                        <CalendarClock class="w-5 h-5" />
                      </div>
                      <div>
                        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Marca de tiempo</p>
                        <p class="text-sm font-bold text-gray-900">{{ formatDate(log.fecha) }}</p>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Acción Ejecutada</p>
                        <p class="text-sm font-bold text-gray-900">{{ log.accion }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Módulo Afectado</p>
                        <p class="text-sm font-bold text-gray-900">{{ log.modulo }}</p>
                      </div>
                    </div>

                    <div class="border-t border-gray-100 pt-5">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                        <User class="w-3.5 h-3.5" /> Usuario Responsable
                      </p>
                      <div class="bg-white border border-gray-200 rounded-lg p-3">
                        <p class="text-sm font-bold text-gray-900">{{ log.admin_nombre }}</p>
                        <p class="text-[11px] text-gray-500 font-mono mt-1">ID Admin: {{ log.id_administrador }}</p>
                      </div>
                    </div>

                    <div class="border-t border-gray-100 pt-5">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                        <FileText class="w-3.5 h-3.5" /> Descripción de los Hechos
                      </p>
                      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-inner">
                        <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-mono">{{ log.descripcion || 'Sin descripción adicional.' }}</p>
                      </div>
                    </div>

                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>