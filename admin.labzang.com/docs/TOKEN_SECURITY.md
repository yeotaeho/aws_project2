# 토큰 보안 가이드

## 개요

이 프로젝트는 **메모리 기반 토큰 저장소**를 사용하여 XSS(Cross-Site Scripting) 공격으로부터 Access Token을 보호합니다.

## 보안 원칙

### 1. Access Token (짧은 수명: 15분)
- **저장 위치**: 브라우저 메모리 (React state/모듈 변수)
- **특징**:
  - XSS 공격으로부터 안전
  - 페이지 새로고침 시 사라짐
  - localStorage/sessionStorage 사용 안 함
  - 만료 시간 자동 체크

### 2. Refresh Token (긴 수명: 30일)
- **현재 저장 위치**: 브라우저 메모리
- **권장 저장 위치**: HttpOnly 쿠키 (향후 개선 예정)
- **특징**:
  - 서버에서만 접근 가능 (HttpOnly)
  - JavaScript로 접근 불가
  - CSRF 공격 방지 필요

## 구현 상세

### 토큰 저장소 (`src/lib/auth/tokenStore.ts`)

```typescript
interface TokenStore {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setAccessToken: (token: string, expiresIn?: number) => void;
  setRefreshToken: (token: string) => void;
  clearTokens: () => void;
  isAccessTokenExpired: () => boolean;
}
```

**주요 기능**:
- 모듈 레벨 변수로 토큰 저장
- 만료 시간 자동 관리
- 타입 안전성 보장

### API 클라이언트 통합 (`src/lib/api/client.ts`)

```typescript
import { tokenStore } from '../auth/tokenStore';

// Access Token 가져오기
export function getAccessToken(): string | null {
  return tokenStore.getAccessToken();
}

// 토큰 저장
export function setTokens(
  accessToken: string, 
  refreshToken?: string, 
  expiresIn?: number
): void {
  tokenStore.setAccessToken(accessToken, expiresIn);
  if (refreshToken) {
    tokenStore.setRefreshToken(refreshToken);
  }
}

// 토큰 삭제
export function clearTokens(): void {
  tokenStore.clearTokens();
}
```

## 사용 예시

### 1. 로그인 시 토큰 저장

```typescript
import { setTokens } from '@/lib/api/client';

// OAuth 콜백에서
const token = searchParams.get('token');
const refreshToken = searchParams.get('refresh_token');

if (token) {
  setTokens(token, refreshToken, 900); // 15분 (900초)
  router.push('/dashboard');
}
```

### 2. API 요청 시 토큰 사용

```typescript
import { getAccessToken } from '@/lib/api/client';

const token = getAccessToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### 3. 로그아웃 시 토큰 삭제

```typescript
import { clearTokens } from '@/lib/api/client';

function handleLogout() {
  clearTokens();
  router.push('/login');
}
```

## 보안 이점

### XSS 공격 방지
- **문제**: localStorage는 JavaScript로 접근 가능
- **해결**: 메모리 저장으로 XSS 공격 시에도 토큰 탈취 불가

### 자동 만료
- Access Token은 15분 후 자동 만료
- 만료된 토큰은 자동으로 null 반환

### 페이지 새로고침 보호
- 페이지 새로고침 시 Access Token 자동 삭제
- 사용자는 다시 로그인 필요 (보안 강화)

## 주의사항

### 1. 페이지 새로고침
- Access Token이 사라지므로 사용자는 다시 로그인해야 함
- UX 개선을 위해 Refresh Token으로 자동 갱신 구현 권장

### 2. Refresh Token 보안
- 현재는 메모리에 저장되지만, HttpOnly 쿠키로 이동 권장
- 서버에서 쿠키 설정 필요

### 3. 토큰 갱신 플로우
```
1. Access Token 만료 감지
2. Refresh Token으로 새 Access Token 요청
3. 새 Access Token을 메모리에 저장
4. API 요청 재시도
```

## 마이그레이션 가이드

### 기존 localStorage 코드 변경

**Before**:
```typescript
localStorage.setItem('access_token', token);
const token = localStorage.getItem('access_token');
localStorage.removeItem('access_token');
```

**After**:
```typescript
import { setTokens, getAccessToken, clearTokens } from '@/lib/api/client';

setTokens(token, refreshToken, 900);
const token = getAccessToken();
clearTokens();
```

## 향후 개선 사항

1. **Refresh Token을 HttpOnly 쿠키로 이동**
   - 서버에서 쿠키 설정
   - JavaScript 접근 차단

2. **자동 토큰 갱신 구현**
   - Access Token 만료 전 자동 갱신
   - Silent refresh 패턴 적용

3. **CSRF 토큰 추가**
   - 쿠키 사용 시 CSRF 공격 방지
   - Double Submit Cookie 패턴

4. **토큰 암호화**
   - 메모리에 저장 전 암호화
   - 추가 보안 레이어

## 참고 자료

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Token Storage Best Practices](https://auth0.com/docs/secure/security-guidance/data-security/token-storage)

