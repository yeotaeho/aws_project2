/**
 * Zustand 단일 Store
 * 
 * 모든 슬라이스를 combine하여 하나의 Store로 관리합니다.
 * - devtools: Redux DevTools 지원
 * - persist: localStorage에 상태 저장
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppStore } from './types';
import { createUiSlice } from './slices/uiSlice';
import { createSoccerSlice } from './slices/soccerSlice';
import { createInteractionSlice } from './slices/interactionSlice';
import { createAvatarSlice } from './slices/avatarSlice';
import { createUserSlice } from './slices/userSlice';
import { createTokenSlice } from './slices/tokenSlice';
// 카테고리별 슬라이스 제거됨 (어드민 프론트엔드)

export const useStore = create<AppStore>()(
  devtools(
    persist(
      (...a) => ({
        // 공통 UI 상태 슬라이스
        ui: createUiSlice(...a),
        
        // 사용자 정보 슬라이스
        user: createUserSlice(...a),
        
        // 토큰 관리 슬라이스 (메모리 전용, persist 제외)
        token: createTokenSlice(...a),
        
        // 인터랙션 & 프롬프트 슬라이스
        interaction: createInteractionSlice(...a),
        
        // 아바타 모드 슬라이스
        avatar: createAvatarSlice(...a),
        
        // 카테고리별 슬라이스 제거됨 (어드민 프론트엔드)
        
        // 서비스 슬라이스
        soccer: createSoccerSlice(...a),
        
        // === Common Actions ===
        /**
         * 전체 스토어 초기화
         * 모든 상태를 기본값으로 리셋합니다.
         */
        resetStore: () => {
          const set = a[0];
          const get = a[1];
          
          // 각 슬라이스의 reset 함수 호출
          const state = get();
          state.token.clearTokens();
          state.interaction.clearInteractions();
          state.avatar.resetAvatar();
          state.soccer.clearResults();
          
          // UI 상태 초기화
          set(
            (currentState) => ({
              ui: {
                ...currentState.ui,
                sidebarOpen: true,
                darkMode: false,
                isDragging: false,
              },
              interaction: {
                ...currentState.interaction,
                inputText: '',
                loading: false,
              },
            }),
            false,
            'resetStore'
          );
        },
      }),
      {
        name: 'app-storage', // localStorage key
        partialize: (state) => ({
          // persist할 상태만 선택 (민감한 정보 제외, 큰 데이터 제외)
          ui: {
            sidebarOpen: state.ui.sidebarOpen,
            darkMode: state.ui.darkMode,
            // isDragging은 제외 (임시 상태)
          },
          user: {
            user: state.user?.user || null,
            isLoggedIn: state.user?.isLoggedIn || false,
          },
          // 토큰은 persist에서 제외 (보안: XSS 공격 방지)
          // token은 제외됨 - 메모리에만 저장
          // 카테고리별 상태 제거됨 (어드민 프론트엔드)
          // avatar, soccer는 제외 (임시 상태)
        }),
      }
    ),
    { name: 'AppStore' } // Redux DevTools 이름
  )
);

// 기존 useAppStore와의 호환성을 위한 export
export const useAppStore = useStore;

// 개발 환경에서 디버깅용 (브라우저 콘솔에서 접근 가능)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__tokenStore = {
    getAccessToken: () => useStore.getState().token.getAccessToken(),
    // Refresh Token은 HttpOnly 쿠키에 저장되어 JavaScript로 접근 불가
    clearTokens: () => useStore.getState().token.clearTokens(),
    isAccessTokenExpired: () => useStore.getState().token.isAccessTokenExpired(),
  };
}

