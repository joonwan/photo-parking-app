import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/api/client'

// 로컬 스토리지 키
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

// 사용자 정보 타입
export interface User {
  id: number
  email: string
  name: string
  profileImage?: string
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user = ref<User | null>(null)

  // 인증 여부 computed
  const isAuthenticated = computed(() => !!accessToken.value)

  // 로그인: JWT 토큰과 사용자 정보 저장
  function login(loginData: LoginResponse) {
    accessToken.value = loginData.accessToken
    refreshToken.value = loginData.refreshToken
    user.value = loginData.user

    // 로컬 스토리지에 저장
    localStorage.setItem(ACCESS_TOKEN_KEY, loginData.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, loginData.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(loginData.user))
  }

  // 로그아웃: 토큰과 사용자 정보 제거
  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null

    // 로컬 스토리지에서 제거
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // 인증 상태 확인: 로컬 스토리지에서 토큰 복원
  function checkAuth() {
    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedAccessToken && storedUser) {
      accessToken.value = storedAccessToken
      refreshToken.value = storedRefreshToken
      user.value = JSON.parse(storedUser)
    }
  }

  // 토큰 갱신
  async function refreshAccessToken() {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }

      const response = await apiClient.post('/api/auth/refresh', {
        refreshToken: refreshToken.value,
      })

      const newAccessToken = response.data.accessToken
      accessToken.value = newAccessToken
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)

      return newAccessToken
    } catch (error) {
      // 리프레시 토큰도 만료된 경우 로그아웃
      logout()
      throw error
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    refreshAccessToken,
  }
})
