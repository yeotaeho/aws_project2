/**
 * 토큰 관리 슬라이스
 * Access Token만 메모리에 저장
 * Refresh Token은 HttpOnly 쿠키에 저장 (백엔드에서 설정)
 * 
 * 보안 주의사항:
 * - persist 미들웨어에서 제외 (localStorage에 저장하지 않음)
 * - 페이지 새로고침 시 Access Token이 사라짐 (의도된 동작)
 * - Refresh Token은 쿠키에서 자동 관리 (JavaScript 접근 불가)
 * - XSS 공격으로부터 보호
 */

import { StateCreator } from 'zustand';
import { AppStore } from '../types';

export interface TokenState {
  accessToken: string | null;
  expiresAt: number | null;
  // Refresh Token은 HttpOnly 쿠키에 저장되므로 Zustand에서 관리하지 않음
}

export interface TokenActions {
  setAccessToken: (token: string, expiresIn?: number) => void;
  getAccessToken: () => string | null;
  clearTokens: () => void;
  isAccessTokenExpired: () => boolean;
}

export type TokenSlice = TokenState & TokenActions;

export const createTokenSlice: StateCreator<
  AppStore,
  [],
  [],
  TokenSlice
> = (set, get) => ({
  // State
  accessToken: null,
  expiresAt: null,
  // Refresh Token은 HttpOnly 쿠키에 저장되므로 Zustand에서 관리하지 않음

  // Actions
  setAccessToken: (token: string, expiresIn: number = 900) => {
    const expiresAt = Date.now() + expiresIn * 1000;
    set((state) => ({
      token: {
        ...state.token,
        accessToken: token,
        expiresAt,
      }
    }));
    console.log('[TokenSlice] Access Token 저장 완료 (메모리)');
    console.log('[TokenSlice] Refresh Token은 HttpOnly 쿠키에 저장됨 (백엔드에서 설정)');
  },

  getAccessToken: () => {
    const state = get();
    // 토큰이 만료되었는지 확인
    if (state.token.expiresAt && Date.now() > state.token.expiresAt) {
      console.warn('[TokenSlice] Access Token이 만료되었습니다.');
      set((state) => ({
        token: {
          ...state.token,
          accessToken: null,
        }
      }));
      return null;
    }
    return state.token.accessToken;
  },

  clearTokens: () => {
    set({
      token: {
        accessToken: null,
        expiresAt: null,
      }
    });
    // Refresh Token 쿠키도 삭제 (백엔드 API 호출 필요)
    if (typeof window !== 'undefined') {
      // 쿠키 삭제를 위해 만료 시간을 과거로 설정
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
    }
    console.log('[TokenSlice] Access Token 삭제 완료 (Refresh Token 쿠키도 삭제됨)');
  },

  isAccessTokenExpired: () => {
    const state = get();
    if (!state.token.expiresAt) return true;
    return Date.now() > state.token.expiresAt;
  },
});

