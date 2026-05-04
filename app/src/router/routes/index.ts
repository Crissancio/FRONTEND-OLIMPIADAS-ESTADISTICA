import { publicRoutes } from './public.routes'
import { adminRoutes } from './admin.routes'

export const routes = [
  ...publicRoutes,
  ...adminRoutes
]
