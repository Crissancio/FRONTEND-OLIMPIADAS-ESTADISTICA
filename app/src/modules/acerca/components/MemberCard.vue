<script setup lang="ts">
import { ref } from 'vue'
import { User, Mail, ChevronDown, ChevronUp } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

defineProps<{
  name: string
  role: string
  bio: string
  email: string
}>()

const isExpanded = ref(false)
</script>

<template>
  <Card class="rounded-xl shadow-sm border-gray-100 overflow-hidden transition-all hover:shadow-md">
    <CardContent class="p-6">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-14 h-14 bg-info/10 rounded-full flex items-center justify-center text-primary shrink-0">
          <User class="w-6 h-6" />
        </div>
        <div>
          <h4 class="font-heading font-bold text-text-main text-lg leading-tight">{{ name }}</h4>
          <p class="text-sm font-medium text-primary">{{ role }}</p>
        </div>
      </div>
      
      <Button 
        variant="ghost"
        @click="isExpanded = !isExpanded"
        class="w-full flex items-center justify-between text-sm font-semibold text-text-muted hover:text-text-main transition-colors py-2 border-t border-gray-50 rounded-none h-auto"
      >
        {{ isExpanded ? 'Ocultar detalles' : 'Ver más' }}
        <component :is="isExpanded ? ChevronUp : ChevronDown" class="w-4 h-4" />
      </Button>

      <div :class="`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`">
        <div class="overflow-hidden">
          <p class="text-text-muted text-sm leading-relaxed mb-4">
            {{ bio }}
          </p>
          <a 
            :href="`mailto:${email}`"
            class="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/90 font-medium transition-colors"
          >
            <Mail class="w-4 h-4" />
            {{ email }}
          </a>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
