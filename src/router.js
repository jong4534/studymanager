import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Dashboard from './views/Dashboard.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/dashboard/:name', component: Dashboard }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
