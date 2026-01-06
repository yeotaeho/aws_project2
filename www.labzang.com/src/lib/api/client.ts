/**
 * 공통 API 클라이언트
 * 
 * JWT 토큰 관리 및 API 요청 헬퍼 함수
 */

import { useStore } from '@/store';

/**
 * 메모리에서 JWT Access Token 가져오기
 * XSS 공격으로부터 보호하기 위해 Zustand 메모리 저장소 사용
 * persist 미들웨어에서 제외되어 localStorage에 저장되지 않음
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return useStore.getState().token.getAccessToken();
}

/**
 * Refresh Token은 HttpOnly 쿠키에 저장되므로 JavaScript로 접근 불가
 * 백엔드 API 호출 시 자동으로 쿠키에 포함됨 (credentials: 'include' 필요)
 */
export function getRefreshToken(): string | null {
  // HttpOnly 쿠키는 JavaScript로 접근할 수 없음
  // 이 함수는 호환성을 위해 유지하지만 항상 null 반환
  console.warn('[API Client] Refresh Token은 HttpOnly 쿠키에 저장되어 JavaScript로 접근할 수 없습니다.');
  return null;
}

/**
 * JWT Access Token을 Zustand 메모리에 저장
 * Access Token: 메모리에만 저장 (페이지 새로고침 시 사라짐)
 * Refresh Token: HttpOnly 쿠키에 저장 (백엔드에서 설정, JavaScript 접근 불가)
 * 
 * 주의: persist 미들웨어에서 제외되어 localStorage에 저장되지 않음
 * 
 * @param accessToken - JWT Access Token
 * @param refreshToken - 무시됨 (HttpOnly 쿠키에 저장되므로)
 * @param expiresIn - Access Token 만료 시간(초), 기본값 900초(15분)
 */
export function setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
  if (typeof window === 'undefined') return;
  
  const tokenSlice = useStore.getState().token;
  tokenSlice.setAccessToken(accessToken, expiresIn);
  // Refresh Token은 HttpOnly 쿠키에 저장되므로 Zustand에서 관리하지 않음
  if (refreshToken) {
    console.log('[API Client] Refresh Token은 HttpOnly 쿠키에 저장됨 (백엔드에서 설정)');
  }
  
  console.log('[API Client] Access Token Zustand 메모리 저장 완료');
}

/**
 * JWT 토큰 삭제 (Zustand 메모리에서 제거)
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  
  useStore.getState().token.clearTokens();
  
  // 기존 localStorage에 남아있을 수 있는 토큰도 삭제 (마이그레이션)
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_provider');
  } catch (e) {
    // localStorage 접근 실패 시 무시
  }
  
  console.log('[API Client] 토큰 삭제 완료');
}

