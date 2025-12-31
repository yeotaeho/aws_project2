// 소셜 로그인 핸들러 함수들 (IIFE 패턴)

export const createSocialLoginHandlers = (() => {
    // IIFE 내부: 공통 설정 및 변수 (private 스코프)
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';

    // 공통 로그인 처리 로직 (private 헬퍼 함수)
    async function handleLogin(
        provider: 'google' | 'kakao' | 'naver',
        setIsLoading: (loading: boolean) => void,
        setError: (error: string) => void
    ) {
        try {
            setIsLoading(true);
            setError('');

            // 실제 API 엔드포인트: GET /{provider}/auth-url
            // 예: GET /google/auth-url, GET /kakao/auth-url
            const response = await fetch(`${gatewayUrl}/${provider}/auth-url`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                // 응답 형식: { success: true, auth_url: "..." }
                if (data.success && data.auth_url) {
                    window.location.href = data.auth_url; // 받은 URL로 리다이렉트
                } else {
                    const providerName = provider === 'google' ? '구글' : provider === 'kakao' ? '카카오' : '네이버';
                    setError(`${providerName} 로그인 URL을 받아올 수 없습니다.`);
                    setIsLoading(false);
                }
            } else {
                const errorData = await response.json().catch(() => ({
                    message: `${provider === 'google' ? '구글' : provider === 'kakao' ? '카카오' : '네이버'} 로그인 준비에 실패했습니다.`
                }));
                setError(errorData.message || `${provider === 'google' ? '구글' : provider === 'kakao' ? '카카오' : '네이버'} 로그인 준비에 실패했습니다.`);
                setIsLoading(false);
            }
        } catch (err) {
            console.error(`${provider} 로그인 오류:`, err);
            setError('서버 연결에 실패했습니다.');
            setIsLoading(false);
        }
    }

    // 이메일/비밀번호 로그인 처리 로직 (private 헬퍼 함수)
    // 주의: 현재 백엔드에 /api/auth/login 엔드포인트가 구현되지 않았습니다.
    // 향후 구현 예정이거나 다른 경로를 사용할 수 있습니다.
    async function handleEmailLogin(
        email: string,
        password: string,
        setIsLoading: (loading: boolean) => void,
        setError: (error: string) => void,
        onSuccess: () => void
    ) {
        try {
            setIsLoading(true);
            setError('');

            // TODO: 실제 이메일 로그인 엔드포인트가 구현되면 경로 확인 필요
            const response = await fetch(`${gatewayUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // 토큰이 응답에 포함되어 있다면 저장
                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                }
                onSuccess();
            } else {
                const data = await response.json().catch(() => ({
                    message: '로그인에 실패했습니다.'
                }));
                setError(data.message || '로그인에 실패했습니다.');
            }
        } catch (err) {
            setError('서버 연결에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }

    // 로그아웃 처리 로직 (private 헬퍼 함수)
    // 주의: 현재 백엔드에 /{provider}/logout 엔드포인트가 구현되지 않았습니다.
    // 따라서 로그아웃 요청이 실패해도 정상적으로 처리됩니다 (로컬 토큰 제거).
    async function handleLogout(
        token: string,
        onSuccess: () => void,
        onError?: (error: string) => void
    ) {
        try {
            const providers: ('kakao' | 'naver' | 'google')[] = ['kakao', 'naver', 'google'];
            let logoutSuccess = false;

            // 각 provider에 대해 로그아웃 시도 (하나 성공하면 종료)
            // 실제 API 경로: /{provider}/logout (현재 미구현)
            for (const provider of providers) {
                try {
                    // 실제 API 엔드포인트: POST /{provider}/logout
                    // 예: POST /google/logout, POST /kakao/logout
                    const response = await fetch(`${gatewayUrl}/${provider}/logout`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        console.log(`✅ ${provider} 로그아웃 성공`);
                        logoutSuccess = true;
                        break; // 성공하면 루프 종료
                    }
                } catch (err) {
                    // 해당 provider 로그아웃 실패 시 다음 provider 시도
                    // (현재 로그아웃 엔드포인트가 구현되지 않았으므로 정상적인 동작)
                    console.log(`⚠️ ${provider} 로그아웃 시도 실패, 다음 provider 시도...`);
                    continue;
                }
            }

            // 로그아웃 API가 구현되지 않았으므로 항상 로컬 토큰 제거 후 성공 처리
            // (서버 로그아웃 실패해도 클라이언트에서는 로그아웃 처리)
            console.info('ℹ️ 로그아웃 처리 완료, 로컬 토큰 제거합니다.');
            localStorage.removeItem('access_token');
            onSuccess(); // 로그인 페이지로 이동
        } catch (err) {
            // 예상치 못한 에러 발생 시에도 로컬 토큰 제거 후 성공 처리
            console.warn('⚠️ 로그아웃 처리 중 예상치 못한 오류:', err);
            localStorage.removeItem('access_token');
            // 에러가 발생해도 로그인 페이지로 이동은 유지 (사용자 경험 우선)
            onSuccess(); // 로그인 페이지로 이동
            // onError는 호출하지 않음 (에러 페이지 표시 방지)
        }
    }

    // 팩토리 함수 반환 (public API)
    return (
        setIsGoogleLoading: (loading: boolean) => void,
        setIsKakaoLoading: (loading: boolean) => void,
        setIsNaverLoading: (loading: boolean) => void,
        setIsLoading: (loading: boolean) => void,
        setError: (error: string) => void
    ) => {
        // 구글 로그인 핸들러 (이너 함수 - 함수 선언식)
        function handleGoogleLogin() {
            handleLogin('google', setIsGoogleLoading, setError);
        }

        // 카카오 로그인 핸들러 (이너 함수 - 함수 선언식)
        function handleKakaoLogin() {
            handleLogin('kakao', setIsKakaoLoading, setError);
        }

        // 네이버 로그인 핸들러 (이너 함수 - 함수 선언식)
        function handleNaverLogin() {
            handleLogin('naver', setIsNaverLoading, setError);
        }

        // 이메일/비밀번호 로그인 핸들러 (이너 함수 - 함수 선언식)
        function handleEmailPasswordLogin(email: string, password: string, onSuccess: () => void) {
            handleEmailLogin(email, password, setIsLoading, setError, onSuccess);
        }

        // 로그아웃 핸들러 (이너 함수 - 함수 선언식)
        function handleLogoutRequest(onSuccess: () => void, onError?: (error: string) => void) {
            const token = localStorage.getItem('access_token');
            if (!token) {
                // 토큰이 없으면 바로 성공 처리 (이미 로그아웃된 상태)
                onSuccess();
                return;
            }
            handleLogout(token, onSuccess, onError);
        }

        // 이너 함수들을 객체로 반환
        return {
            handleGoogleLogin,
            handleKakaoLogin,
            handleNaverLogin,
            handleEmailPasswordLogin,
            handleLogout: handleLogoutRequest,
        };
    };
})();
