import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 네비게이션 가드: 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // 앱 시작 시 인증 상태 확인
  authStore.checkAuth()

  // 로그인이 필요한 페이지인지 확인
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // 이미 로그인한 사용자가 로그인 페이지에 접근하면 홈으로 리다이렉트
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
