# 보안 마이그레이션: localStorage → 메모리 기반 토큰 저장소

## 변경 개요

Access Token을 localStorage에서 **브라우저 메모리**로 이동하여 XSS 공격으로부터 보호합니다.

## 주요 변경 사항

### 1. 새로운 토큰 저장소 생성
- **파일**: `src/lib/auth/tokenStore.ts`
- **기능**: 메모리 기반 토큰 관리 인터페이스
- **특징**:
  - 타입 안전성 보장
  - 자동 만료 시간 관리
  - 모듈 레벨 변수 사용

### 2. API 클라이언트 수정
- **파일**: `src/lib/api/client.ts`
- **변경**:
  - `getAccessToken()`: localStorage → tokenStore
  - `setTokens()`: localStorage → tokenStore (+ expiresIn 파라미터 추가)
  - `clearTokens()`: localStorage → tokenStore (+ 레거시 정리)

### 3. 컴포넌트 수정

#### `app/page.tsx`
```typescript
// Before
localStorage.setItem('access_token', token);
const token = localStorage.getItem('access_token');

// After
import('@/lib/api/client').then(({ setTokens, getAccessToken }) => {
  setTokens(token, refreshToken, 900);
  const token = getAccessToken();
});
```

#### `app/dashboard/page.tsx`
```typescript
// Before
localStorage.setItem('access_token', tokenFromUrl);
const token = localStorage.getItem('access_token');

// After
const { setTokens, getAccessToken } = await import('@/lib/api/client');
setTokens(tokenFromUrl, undefined, 900);
const token = getAccessToken();
```

#### `src/app/login/callback/page.tsx`
```typescript
// Before
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);

// After
const { setTokens } = await import('@/lib/api/client');
setTokens(token, refreshToken, 900);
```

#### `service/mainservice.ts`
```typescript
// Before
localStorage.setItem('access_token', data.access_token);
localStorage.removeItem('access_token');

// After
const { setTokens, clearTokens } = await import('@/lib/api/client');
setTokens(data.access_token, data.refresh_token, 900);
clearTokens();
```

## 보안 개선 사항

### XSS 공격 방지
| 항목 | Before | After |
|------|--------|-------|
| 저장 위치 | localStorage | 브라우저 메모리 |
| JavaScript 접근 | 가능 | 가능 (하지만 메모리만) |
| XSS 공격 시 | 토큰 탈취 가능 | 페이지 새로고침 시 사라짐 |
| 지속성 | 영구 | 세션 동안만 |

### 자동 만료 관리
- Access Token 만료 시간 자동 체크
- 만료된 토큰은 자동으로 `null` 반환
- 불필요한 API 요청 방지

## 사용자 경험 변화

### 긍정적 변화
1. **보안 강화**: XSS 공격으로부터 안전
2. **자동 로그아웃**: 페이지 새로고침 시 자동 로그아웃 (보안)
3. **만료 관리**: 토큰 만료 자동 감지

### 주의 사항
1. **페이지 새로고침**: 사용자가 다시 로그인해야 함
2. **탭 간 공유 불가**: 여러 탭에서 동시 로그인 불가
3. **브라우저 종료**: 토큰이 사라짐 (보안상 이점)

## 테스트 체크리스트

- [ ] 로그인 후 토큰이 메모리에 저장되는지 확인
- [ ] API 요청 시 Authorization 헤더에 토큰이 포함되는지 확인
- [ ] 페이지 새로고침 후 로그인 화면으로 이동하는지 확인
- [ ] 로그아웃 시 토큰이 메모리에서 삭제되는지 확인
- [ ] 15분 후 토큰이 자동 만료되는지 확인
- [ ] 개발자 도구에서 localStorage에 토큰이 없는지 확인

## 디버깅

### 개발 환경에서 토큰 확인
```javascript
// 브라우저 콘솔에서
window.__tokenStore.getAccessToken()
window.__tokenStore.isAccessTokenExpired()
```

### 토큰 저장 확인
```javascript
// 로그인 후 콘솔에서
console.log('[TokenStore] Access Token:', window.__tokenStore.getAccessToken()?.substring(0, 20) + '...');
```

## 롤백 가이드

만약 문제가 발생하면 다음 파일들을 이전 버전으로 되돌립니다:
1. `src/lib/auth/tokenStore.ts` (삭제)
2. `src/lib/api/client.ts` (localStorage 사용으로 복원)
3. 모든 컴포넌트 파일 (localStorage 직접 사용으로 복원)

## 향후 계획

1. **Refresh Token을 HttpOnly 쿠키로 이동**
2. **자동 토큰 갱신 구현**
3. **Silent refresh 패턴 적용**
4. **CSRF 토큰 추가**

## 참고 문서

- [TOKEN_SECURITY.md](./docs/TOKEN_SECURITY.md) - 상세 보안 가이드
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

