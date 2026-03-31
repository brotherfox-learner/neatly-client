import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" }
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/dev/backend',
      name: 'backend-connection',
      component: () => import('../views/BackendConnectionView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/payment-basic',
      name: 'payment',
      component: () => import('../views/PaymentBasicInfo.vue'),
    },
    {
      path: '/payment-request',
      name: 'payment request',
      component: () => import('../views/PaymentSpecialRequest.vue'),
    },
    {
      path: '/payment-Method',
      name: 'payment method',
      component: () => import('../views/PaymentMethod.vue'),
    },
    {
      path: '/payment-success',
      name: 'payment sucess',
      component: () => import('../views/PaymentSuccess.vue'),
    },
    {
      path: '/payment-fail',
      name: 'payment fail',
      component: () => import('../views/PaymentFail.vue'),
      path: '/rooms/:id',
      name: 'room-detail',
      component: () => import('../views/RoomDetailView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchResultView.vue'),
    },
  ],
})

export default router
