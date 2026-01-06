/**
 * 전체 스토어 타입 정의
 */

// 슬라이스 타입 import
import { TokenSlice } from "./slices/tokenSlice";

// 전체 스토어 타입 (모든 슬라이스 통합)
export interface AppStore {
  // 토큰 관리 슬라이스 (메모리 전용, persist 제외)
  token: TokenSlice;
}

