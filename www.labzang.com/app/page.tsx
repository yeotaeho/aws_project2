'use client';

import { useState } from "react";
import { HeroSection } from "@/components/sections/hero-section";
import { StrengthSection } from "@/components/sections/strength-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProcessSection } from "@/components/sections/process-section";
import { CTASection } from "@/components/sections/cta-section";
import { LoginModal } from "@/components/ui/login-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
