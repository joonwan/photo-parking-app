<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="app-title">Photo Parking</h1>
      <p class="app-subtitle">번호판 자동 인식으로 스마트한 주차 관리</p>

      <button
        class="kakao-login-btn"
        @click="handleKakaoLogin"
        :disabled="isLoading"
      >
        <svg v-if="!isLoading" class="kakao-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.8-.6 2.7-.7 3.1-.1.5.2.5.4.4.2-.1 3.1-2.1 3.6-2.5.6.1 1.3.2 2 .2 5.5 0 10-3.6 10-8S17.5 3 12 3z"/>
        </svg>
        <span v-if="isLoading" class="spinner"></span>
        {{ isLoading ? '로그인 중...' : '카카오로 로그인하기' }}
      </button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api/auth'

declare global {
  interface Window {
    Kakao: any
  }
}

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)
const errorMessage = ref('')

// 카카오 SDK 초기화
onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://developers.kakao.com/sdk/js/kakao.js'
  script.onload = () => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoAppKey = import.meta.env.VITE_KAKAO_APP_KEY
      if (kakaoAppKey && kakaoAppKey !== 'your_kakao_javascript_key_here') {
        window.Kakao.init(kakaoAppKey)
        console.log('카카오 SDK 초기화 완료')
      } else {
        console.warn('카카오 앱 키가 설정되지 않았습니다. .env 파일을 확인하세요.')
      }
    }
  }
  document.head.appendChild(script)
})

const handleKakaoLogin = () => {
  if (!window.Kakao || !window.Kakao.isInitialized()) {
    errorMessage.value = '카카오 SDK가 초기화되지 않았습니다.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  window.Kakao.Auth.login({
    success: async (authObj: any) => {
      try {
        // 카카오 액세스 토큰 로깅
        console.log('✅ 카카오 로그인 성공!')
        console.log('📝 카카오 액세스 토큰:', authObj.access_token)
        console.log('📋 전체 인증 객체:', authObj)

        // 카카오 액세스 토큰을 서버로 전송하여 JWT 발급
        const loginResponse = await authAPI.kakaoLogin(authObj.access_token)

        // 로그인 성공: 토큰과 사용자 정보 저장
        authStore.login(loginResponse)

        // 홈 페이지로 리다이렉트
        router.push({ name: 'home' })
      } catch (error: any) {
        console.error('로그인 실패:', error)
        errorMessage.value = error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.'
      } finally {
        isLoading.value = false
      }
    },
    fail: (err: any) => {
      console.error('카카오 로그인 실패:', err)
      errorMessage.value = '카카오 로그인에 실패했습니다.'
      isLoading.value = false
    },
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #ffffff;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 0;
  padding: 80px 60px;
  text-align: center;
  max-width: 440px;
  width: 100%;
}

.app-title {
  font-size: 2.8rem;
  font-weight: 300;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  letter-spacing: -1px;
}

.app-subtitle {
  font-size: 0.95rem;
  color: #666666;
  margin: 0 0 60px 0;
  font-weight: 300;
  letter-spacing: -0.3px;
}

.kakao-login-btn {
  width: 100%;
  padding: 18px 24px;
  background-color: #FEE500;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: -0.3px;
}

.kakao-login-btn:hover {
  background-color: #FDD835;
  transform: translateY(-1px);
}

.kakao-login-btn:active {
  transform: translateY(0);
}

.kakao-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.kakao-icon {
  width: 20px;
  height: 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 24px;
  color: #d32f2f;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: -0.2px;
}

@media (max-width: 480px) {
  .login-card {
    padding: 60px 30px;
  }

  .app-title {
    font-size: 2.2rem;
  }

  .app-subtitle {
    font-size: 0.9rem;
    margin-bottom: 50px;
  }
}
</style>
