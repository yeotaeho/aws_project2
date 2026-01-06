'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HeroSection } from "@/components/sections/hero-section";
import { StrengthSection } from "@/components/sections/strength-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProcessSection } from "@/components/sections/process-section";
import { CTASection } from "@/components/sections/cta-section";
import { LoginModal } from "@/components/ui/login-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function HomeContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL에서 토큰 받아서 Zustand에 저장
  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');

    console.log('[Home] URL 파라미터 확인:', { token: token ? '있음' : '없음', error });

    if (error) {
      console.error('로그인 오류:', error);
      // 에러 메시지 표시 가능
    } else if (token) {
      console.log('[Home] 토큰 수신, Zustand에 저장 중...');
      // Access Token만 Zustand 메모리에 저장 (XSS 공격 방지)
      // Refresh Token은 백엔드에서 HttpOnly 쿠키로 설정됨 (자동 관리)
      import('@/lib/api/client').then(({ setTokens }) => {
        setTokens(token, refreshToken || undefined, 900); // 15분
        console.log('[Home] Access Token 메모리 저장 완료');
        console.log('[Home] 채팅 페이지로 리다이렉트 시작: https://chat.yeotaeho.kr/');
        // 로그인 성공 후 채팅 페이지로 리다이렉트
        window.location.href = 'https://chat.yeotaeho.kr/';
      }).catch((err) => {
        console.error('[Home] 토큰 저장 실패:', err);
      });
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen">
      {/* 왼쪽 상단 로그인 버튼 */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          size="lg"
          onClick={() => setIsLoginModalOpen(true)}
          className="shadow-lg"
        >
          로그인
        </Button>
      </div>

      {/* 오른쪽 상단 메뉴 버튼들 */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Link href="/portfolio">
          <Button size="lg" variant="outline">포트폴리오</Button>
        </Link>
        <Link href="/image">
          <Button size="lg">이미지 생성</Button>
        </Link>
      </div>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <HeroSection />
      <StrengthSection />
      <ServicesSection />
      <ProcessSection />
      <CTASection />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <div className="fixed top-4 left-4 z-50">
          <Button size="lg" className="shadow-lg">로그인</Button>
        </div>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Link href="/portfolio">
            <Button size="lg" variant="outline">포트폴리오</Button>
          </Link>
          <Link href="/image">
            <Button size="lg">이미지 생성</Button>
          </Link>
        </div>
        <HeroSection />
        <StrengthSection />
        <ServicesSection />
        <ProcessSection />
        <CTASection />
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
