import { createApp } from 'vue'
import { router } from './router'
import './style.css'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'
import { createPinia } from 'pinia'

import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(VCalendar, {})
app.mount('#app')
