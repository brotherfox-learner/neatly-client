import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
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
      path: '/dev/preview',
      name: 'dev-preview',
      component: () => import('../views/DevPreviewView.vue'),
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
      meta: { hideNavbar: true, requiresAuth: true, requiresAdmin: true },
      redirect: { name: 'admin-customer-booking' },
      children: [
        {
          path: 'customer-booking',
          name: 'admin-customer-booking',
          component: () => import('../views/admin/AdminCustomerBookingView.vue'),
        },
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
    {
      path: '/rooms/:id',
      name: 'room-detail',
      component: () => import('../views/RoomDetailView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchResultView.vue'),
    },
    {
      path: '/booking-history',
      name: 'booking-history',
      component: () => import('../views/BookingHistoryView.vue'),
    },
    {
      path: '/booking-change-date/:id',
      name: 'booking-change-date',
      component: () => import('../views/BookingChangeDateView.vue'),
    },
    {
      path: '/cancel-refund/:id',
      name: 'cancel-refund',
      component: () => import('../views/CancelRefundView.vue'),
    },
    {
      path: '/cancel-booking/:id',
      name: 'cancel-booking',
      component: () => import('../views/CancelBookingView.vue'),
    },
    {
      path: '/change-date-success',
      name: 'change-date-success',
      component: () => import('../views/ChangeDateSuccessView.vue'),
    },
    {
      path: '/change-date-fail',
      name: 'change-date-fail',
      component: () => import('../views/ChangeDateFailView.vue'),
    },
    {
      path: '/cancel-refund-success',
      name: 'cancel-refund-success',
      component: () => import('../views/CancelRefundSuccessView.vue'),
    },
    {
      path: '/cancel-refund-fail',
      name: 'cancel-refund-fail',
      component: () => import('../views/CancelRefundFailView.vue'),
    },
    {
      path: '/cancel-booking-success',
      name: 'cancel-booking-success',
      component: () => import('../views/CancelBookingSuccessView.vue'),
    },
    {
      path: '/cancel-booking-fail',
      name: 'cancel-booking-fail',
      component: () => import('../views/CancelBookingFailView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.initialized) {
    await authStore.initializeFromSession()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  const authPages = to.name === 'login' || to.name === 'register'

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' }
  }

  if (authPages && authStore.isAuthenticated) {
    return authStore.isAdmin ? { name: 'admin-customer-booking' } : { name: 'home' }
  }

  return true
})

export default router
