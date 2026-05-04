<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Lock, Mail, ArrowRight, BarChart4, AlertCircle, ArrowLeft, Loader2 
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = () => {
  error.value = ''
  isLoading.value = true
  
  // Mock authentication
  setTimeout(() => {
    if (email.value === 'admin@umsa.bo' && password.value === 'admin123') {
      sessionStorage.setItem('adminAuth', 'true')
      router.push('/admin')
    } else {
      error.value = 'Credenciales incorrectas. Intenta con admin@umsa.bo / admin123'
      isLoading.value = false
    }
  }, 800)
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col justify-center items-center p-4">
    <!-- Botón Volver a Inicio -->
    <div class="w-full max-w-md mb-4">
      <Button
        as="router-link"
        to="/"
        variant="ghost"
        class="text-text-muted hover:text-primary hover:bg-white/60 rounded-xl font-semibold transition-all flex items-center gap-2"
      >
        <ArrowLeft class="w-4 h-4" />
        Volver a Inicio
      </Button>
    </div>

    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-soft shadow-primary/20">
          <BarChart4 class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-heading font-black text-text-main mb-2">Panel de Administración</h1>
        <p class="text-text-muted font-medium">Olimpiadas de Estadística UMSA</p>
      </div>

      <Card class="rounded-xl shadow-soft border-gray-100 overflow-hidden bg-white">
        <CardContent class="p-8">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div v-if="error" class="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle class="w-5 h-5 shrink-0" />
              <span class="font-medium">{{ error }}</span>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-text-main">Correo Electrónico</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail class="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  v-model="email"
                  type="email" 
                  class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-text-main placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors focus-visible:border-primary transition-colors" 
                  placeholder="admin@umsa.bo"
                  required
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-semibold text-text-main">Contraseña</label>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock class="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  v-model="password"
                  type="password" 
                  class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-text-main placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors focus-visible:border-primary transition-colors" 
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit"
              size="lg"
              :disabled="isLoading"
              class="w-full bg-accent hover:bg-accent/90 text-white px-8 py-6 rounded-xl font-bold transition-all shadow-soft flex items-center justify-center gap-2 h-auto"
            >
              <template v-if="isLoading">
                <Loader2 class="w-5 h-5 animate-spin" />
              </template>
              <template v-else>
                Ingresar al Panel
                <ArrowRight class="w-5 h-5" />
              </template>
            </Button>
          </form>
        </CardContent>
        <div class="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p class="text-xs text-text-muted font-medium">
            Solo personal autorizado. <br/>
            Sugerencia: admin@umsa.bo / admin123
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>
