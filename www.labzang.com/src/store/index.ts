/**
 * Zustand 단일 Store
 * 
 * 모든 슬라이스를 combine하여 하나의 Store로 관리합니다.
 * - devtools: Redux DevTools 지원 (선택적)
 * - persist: 사용하지 않음 (토큰은 메모리에만 저장)
 */

import { create } from 'zustand';
import type { AppStore } from './types';
import { createTokenSlice } from './slices/tokenSlice';

export const useStore = create<AppStore>()((...a) => ({
  // 토큰 관리 슬라이스 (메모리 전용)
  token: createTokenSlice(...a),
}));

// 개발 환경에서 디버깅용 (브라우저 콘솔에서 접근 가능)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__tokenStore = {
    getAccessToken: () => useStore.getState().token.getAccessToken(),
    // Refresh Token은 HttpOnly 쿠키에 저장되어 JavaScript로 접근 불가
    clearTokens: () => useStore.getState().token.clearTokens(),
    isAccessTokenExpired: () => useStore.getState().token.isAccessTokenExpired(),
  };
}

