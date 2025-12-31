import { HeroSection } from "@/components/sections/hero-section";
import { StrengthSection } from "@/components/sections/strength-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProcessSection } from "@/components/sections/process-section";
import { CTASection } from "@/components/sections/cta-section";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen">
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
  );
}
