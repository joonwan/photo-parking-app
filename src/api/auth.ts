import apiClient from './client'
import type { LoginResponse } from '@/stores/auth'

// 카카오 로그인 요청 타입
export interface KakaoLoginRequest {
  kakaoAccessToken: string
}

// 인증 관련 API
export const authAPI = {
  // 카카오 로그인
  kakaoLogin: async (kakaoAccessToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/kakao/login', {
      kakaoAccessToken,
    })
    return response.data
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout')
  },

  // 토큰 갱신
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>('/api/auth/refresh', {
      refreshToken,
    })
    return response.data
  },

  // 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },
}
