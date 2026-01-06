/**
 * 메모리 기반 토큰 저장소
 * Access Token은 메모리에만 보관하여 XSS 공격으로부터 보호
 * Refresh Token은 HttpOnly 쿠키에 저장 (서버에서 설정)
 */

interface TokenData {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

interface TokenStore {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setAccessToken: (token: string, expiresIn?: number) => void;
  setRefreshToken: (token: string) => void;
  clearTokens: () => void;
  isAccessTokenExpired: () => boolean;
}

// 메모리에 토큰 저장 (모듈 레벨 변수)
let tokenData: TokenData = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

/**
 * Access Token 가져오기
 */
function getAccessToken(): string | null {
  // 토큰이 만료되었는지 확인
  if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
    console.warn('[TokenStore] Access Token이 만료되었습니다.');
    tokenData.accessToken = null;
    return null;
  }
  return tokenData.accessToken;
}

/**
 * Refresh Token 가져오기
 * 참고: Refresh Token은 HttpOnly 쿠키에 저장하는 것이 더 안전하지만,
 * 현재 구조에서는 메모리에 저장
 */
function getRefreshToken(): string | null {
  return tokenData.refreshToken;
}

/**
 * Access Token 설정
 * @param token - JWT Access Token
 * @param expiresIn - 만료 시간(초), 기본값 15분
 */
function setAccessToken(token: string, expiresIn: number = 900): void {
  tokenData.accessToken = token;
  // 만료 시간 설정 (현재 시간 + expiresIn초)
  tokenData.expiresAt = Date.now() + expiresIn * 1000;
  console.log('[TokenStore] Access Token 저장 완료 (메모리)');
}

/**
 * Refresh Token 설정
 * @param token - JWT Refresh Token
 */
function setRefreshToken(token: string): void {
  tokenData.refreshToken = token;
  console.log('[TokenStore] Refresh Token 저장 완료 (메모리)');
}

/**
 * 모든 토큰 삭제
 */
function clearTokens(): void {
  tokenData = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  };
  console.log('[TokenStore] 모든 토큰 삭제 완료');
}

/**
 * Access Token 만료 여부 확인
 */
function isAccessTokenExpired(): boolean {
  if (!tokenData.expiresAt) return true;
  return Date.now() > tokenData.expiresAt;
}

/**
 * 토큰 저장소 인터페이스
 */
export const tokenStore: TokenStore = {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
  isAccessTokenExpired,
};

// 개발 환경에서 디버깅용
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__tokenStore = tokenStore;
}

