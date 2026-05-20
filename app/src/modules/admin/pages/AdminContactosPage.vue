<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  MessageSquareText,
  Reply,
  Search,
  Send,
  User,
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

interface ContactMessage {
  id: string
  nombre: string
  correo: string
  asunto: string
  mensaje: string
  fecha: string
  estado: 'nuevo' | 'leido' | 'respondido'
}

const messages = ref<ContactMessage[]>([
  {
    id: 'msg-001',
    nombre: 'Mariana Choque',
    correo: 'mariana.choque@colegio.edu.bo',
    asunto: 'Consulta sobre inscripción',
    mensaje: 'Buenas tardes, quisiera saber si todavía es posible corregir los datos de un estudiante ya inscrito en la convocatoria.',
    fecha: '2026-05-15T09:30:00',
    estado: 'nuevo',
  },
  {
    id: 'msg-002',
    nombre: 'Luis Fernández',
    correo: 'luis.fernandez@gmail.com',
    asunto: 'Material de preparación',
    mensaje: '¿Dónde puedo descargar los ejercicios oficiales para la fase de preparación? No encuentro el enlace en la página pública.',
    fecha: '2026-05-14T16:10:00',
    estado: 'nuevo',
  },
  {
    id: 'msg-003',
    nombre: 'Dirección Colegio Ayacucho',
    correo: 'direccion@ayacucho.edu.bo',
    asunto: 'Confirmación de participación',
    mensaje: 'Solicitamos confirmar si nuestra unidad educativa figura correctamente dentro de los colegios habilitados.',
    fecha: '2026-05-12T11:45:00',
    estado: 'respondido',
  },
  {
    id: 'msg-004',
    nombre: 'Ana Beltrán',
    correo: 'ana.beltran@correo.com',
    asunto: 'Problema con correo de estudiante',
    mensaje: 'El sistema indica que el correo ya existe, pero el estudiante no aparece en nuestra lista de inscritos.',
    fecha: '2026-05-09T08:20:00',
    estado: 'nuevo',
  },
  {
    id: 'msg-005',
    nombre: 'Carlos Mamani',
    correo: 'carlos.mamani@ejemplo.com',
    asunto: 'Resultados preliminares',
    mensaje: 'Quisiera saber cuándo se publicarán los resultados preliminares de la primera fase.',
    fecha: '2026-05-03T18:05:00',
    estado: 'respondido',
  },
])

const search = ref('')
const rangeMin = ref(0)
const rangeMax = ref(14)
const selectedId = ref(messages.value[0]?.id ?? '')
const isReplyOpen = ref(false)
const reply = ref({
  asunto: '',
  mensaje: '',
})

const now = new Date('2026-05-15T12:00:00')

const getDaysAgo = (value: string) => {
  const date = new Date(value)
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000)
}

const dateLabel = (value: string) => {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const normalizeRange = () => {
  if (rangeMin.value > rangeMax.value) {
    const next = rangeMin.value
    rangeMin.value = rangeMax.value
    rangeMax.value = next
  }
}

const filteredMessages = computed(() => {
  const term = search.value.trim().toLowerCase()
  return messages.value.filter((item) => {
    const days = getDaysAgo(item.fecha)
    const matchesRange = days >= rangeMin.value && days <= rangeMax.value
    const matchesSearch = !term
      || item.nombre.toLowerCase().includes(term)
      || item.correo.toLowerCase().includes(term)
      || item.asunto.toLowerCase().includes(term)

    return matchesRange && matchesSearch
  })
})

const selectedMessage = computed(() => {
  if (!selectedId.value) return null
  return filteredMessages.value.find((item) => item.id === selectedId.value) ?? filteredMessages.value[0] ?? null
})

const openMessage = (id: string) => {
  selectedId.value = id
  isReplyOpen.value = false
}

const openReply = () => {
  if (!selectedMessage.value) return
  reply.value = {
    asunto: `Re: ${selectedMessage.value.asunto}`,
    mensaje: '',
  }
  isReplyOpen.value = true
}

const markAsRead = () => {
  if (!selectedMessage.value) return
  messages.value = messages.value.map((item) => item.id === selectedMessage.value?.id ? { ...item, estado: 'leido' } : item)
}

const sendReply = () => {
  if (!selectedMessage.value || !reply.value.asunto.trim() || !reply.value.mensaje.trim()) return
  messages.value = messages.value.map((item) => item.id === selectedMessage.value?.id ? { ...item, estado: 'respondido' } : item)
  isReplyOpen.value = false
}
</script>

<template>
  <div class="flex h-[calc(100vh-8rem)] min-h-[680px] flex-col gap-4">
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Mensajes de contacto</h1>
        <p class="mt-1 text-sm text-text-muted">Revisa consultas recibidas y responde por correo.</p>
      </div>
      <Badge variant="outline" class="w-fit border-accent/30 bg-accent/10 px-3 py-1 text-accent-dark">
        {{ filteredMessages.length }} mensajes
      </Badge>
    </div>

    <Card class="min-h-0 flex-1 overflow-hidden border-gray-200 bg-white shadow-soft">
      <CardContent class="grid h-full grid-cols-1 p-0 lg:grid-cols-[390px_minmax(0,1fr)]">
        <aside class="flex min-h-0 flex-col border-gray-200 lg:border-r" :class="selectedMessage ? 'hidden lg:flex' : 'flex'">
          <div class="space-y-4 border-b border-gray-200 p-4">
            <div class="relative">
              <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
              <input
                v-model="search"
                class="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-9 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Buscar nombre, correo o asunto..."
              />
            </div>

            <div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div class="mb-3 flex items-center justify-between gap-2">
                <span class="inline-flex items-center gap-2 text-sm font-bold text-text-main">
                  <CalendarDays class="h-4 w-4 text-accent" />
                  Rango de tiempo
                </span>
                <span class="text-xs font-semibold text-text-muted">{{ rangeMin }} - {{ rangeMax }} días</span>
              </div>
              <div class="space-y-2">
                <input v-model.number="rangeMin" type="range" min="0" max="30" class="w-full accent-primary" @input="normalizeRange" />
                <input v-model.number="rangeMax" type="range" min="0" max="30" class="w-full accent-primary" @input="normalizeRange" />
              </div>
            </div>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto">
            <button
              v-for="item in filteredMessages"
              :key="item.id"
              type="button"
              class="w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50"
              :class="selectedMessage?.id === item.id ? 'bg-primary/5 lg:border-l-4 lg:border-l-accent' : ''"
              @click="openMessage(item.id)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate font-bold text-text-main">{{ item.nombre }}</p>
                  <p class="mt-0.5 truncate text-sm text-text-muted">{{ item.correo }}</p>
                </div>
                <Badge v-if="item.estado === 'nuevo'" variant="outline" class="border-secondary/20 bg-secondary/10 text-secondary">Nuevo</Badge>
                <Badge v-else-if="item.estado === 'leido'" variant="outline" class="border-primary/20 bg-primary/10 text-primary">Leído</Badge>
              </div>
              <p class="mt-2 truncate text-sm font-semibold text-text-main">{{ item.asunto }}</p>
              <p class="mt-1 text-xs text-text-muted">{{ dateLabel(item.fecha) }}</p>
            </button>

            <div v-if="filteredMessages.length === 0" class="p-8 text-center text-sm text-text-muted">
              Sin mensajes para el filtro.
            </div>
          </div>
        </aside>

        <section class="min-h-0 flex-col bg-background/60" :class="selectedMessage ? 'flex' : 'hidden lg:flex'">
          <template v-if="selectedMessage">
            <div class="border-b border-gray-200 bg-white p-4">
              <div class="flex items-center gap-3">
                <Button variant="ghost" size="sm" class="lg:hidden" @click="selectedId = ''">
                  <ArrowLeft class="h-4 w-4" />
                </Button>
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                  <User class="h-5 w-5" />
                </div>
                <div class="min-w-0">
                  <h2 class="truncate font-heading text-lg font-bold text-text-main">{{ selectedMessage.nombre }}</h2>
                  <p class="truncate text-sm text-text-muted">{{ selectedMessage.correo }}</p>
                </div>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <Card class="border-gray-200 border-l-4 border-l-accent bg-white shadow-soft">
                <CardHeader>
                  <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <CardTitle class="flex items-center gap-2">
                      <MessageSquareText class="h-5 w-5 text-accent" /> ASUNTO: 
                      {{ selectedMessage.asunto }}
                    </CardTitle>
                    <span class="text-xs font-semibold text-text-muted">{{ dateLabel(selectedMessage.fecha) }}</span>
                  </div>
                </CardHeader>
                <CardContent class="space-y-5">
                  <div class="rounded-xl border border-gray-200 bg-white p-4">
                    <p class="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">Mensaje</p>
                    <p class="whitespace-pre-wrap text-sm leading-relaxed text-text-main">{{ selectedMessage.mensaje }}</p>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <Button v-if="selectedMessage.estado === 'nuevo'" variant="outline" class="flex items-center gap-2" @click="markAsRead">
                      <CheckCircle2 class="h-4 w-4" />
                      Marcar como leído
                    </Button>
                    <Button variant="accent" class="flex items-center gap-2" @click="openReply">
                      <Reply class="h-4 w-4" />
                      Responder mensaje
                    </Button>
                  </div>

                  <div v-if="isReplyOpen" class="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div class="mb-4 flex items-center gap-2 text-sm font-bold text-primary">
                      <Mail class="h-4 w-4" />
                      Respuesta a {{ selectedMessage.correo }}
                    </div>
                    <div class="space-y-3">
                      <div>
                        <label class="mb-1 block text-sm font-bold text-text-main">Asunto</label>
                        <input v-model="reply.asunto" class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                      </div>
                      <div>
                        <label class="mb-1 block text-sm font-bold text-text-main">Mensaje</label>
                        <textarea v-model="reply.mensaje" rows="6" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Escribe la respuesta..." />
                      </div>
                      <div class="flex justify-end gap-2">
                        <Button variant="outline" @click="isReplyOpen = false">Cancelar</Button>
                        <Button variant="accent" class="flex items-center gap-2" @click="sendReply">
                          <Send class="h-4 w-4" />
                          Enviar respuesta
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </template>

          <div v-else class="flex h-full items-center justify-center p-8 text-center text-text-muted">
            Selecciona un mensaje.
          </div>
        </section>
      </CardContent>
    </Card>
  </div>
</template>
