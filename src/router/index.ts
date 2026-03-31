import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../components/admin/AdminLayout.vue'),
      meta: { hideNavbar: true },
      redirect: { name: 'admin-room-management' },
      children: [
        {
          path: 'room-management',
          name: 'admin-room-management',
          component: () => import('../views/admin/AdminPlaceholderView.vue'),
          meta: { pageTitle: 'Room Management' },
        },
        {
          path: 'hotel-information',
          name: 'admin-hotel-information',
          component: () => import('../views/admin/AdminPlaceholderView.vue'),
          meta: { pageTitle: 'Hotel Information' },
        },
        {
          path: 'room-property',
          name: 'admin-room-property',
          component: () => import('../views/admin/AdminPlaceholderView.vue'),
          meta: { pageTitle: 'Room & Property' },
        },
        {
          path: 'analytics',
          name: 'admin-analytics',
          component: () => import('../views/admin/AdminPlaceholderView.vue'),
          meta: { pageTitle: 'Analytics Dashboard' },
        },
        {
          path: 'chatbot-setup',
          name: 'admin-chatbot-setup',
          component: () => import('../views/admin/AdminPlaceholderView.vue'),
          meta: { pageTitle: 'Chatbot Setup' },
        },
      ],
    },
  ],
})

export default router
