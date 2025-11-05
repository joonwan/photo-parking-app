import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// API 베이스 URL (환경 변수에서 가져오기)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: 모든 요청에 JWT 토큰 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    // 토큰이 있으면 Authorization 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const authStore = useAuthStore()

    // 401 에러: 인증 실패 (토큰 만료 또는 유효하지 않음)
    if (error.response?.status === 401) {
      // 토큰 제거 및 로그아웃
      authStore.logout()

      // 로그인 페이지로 리다이렉트
      if (router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login' })
      }
    }

    // 403 에러: 권한 없음
    if (error.response?.status === 403) {
      console.error('접근 권한이 없습니다.')
      // 필요시 에러 페이지로 리다이렉트
    }

    return Promise.reject(error)
  }
)

export default apiClient
