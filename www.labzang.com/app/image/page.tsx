'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('프롬프트를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    // TODO: 실제 이미지 생성 API 연동
    // 현재는 플레이스홀더로 처리
    setTimeout(() => {
      setGeneratedImage(null);
      setIsLoading(false);
      alert('이미지 생성 기능은 곧 구현될 예정입니다.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/" className="inline-block mb-4">
            <Button variant="ghost" size="sm">
              ← 홈으로
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">이미지 생성</h1>
          <p className="text-gray-400">AI를 활용하여 원하는 이미지를 생성해보세요</p>
        </div>

        {/* 입력 영역 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              이미지 설명 (프롬프트)
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 고양이가 우주를 여행하는 모습, 사이버펑크 스타일의 도시 풍경..."
              className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                size="lg"
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    생성 중...
                  </span>
                ) : (
                  '이미지 생성'
                )}
              </Button>
            </div>
          </div>

          {/* 생성된 이미지 영역 */}
          {generatedImage && (
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">생성된 이미지</h2>
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="max-w-full max-h-[600px] rounded-lg"
                />
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          {!generatedImage && !isLoading && (
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="text-center text-gray-400">
                <svg
                  className="mx-auto h-24 w-24 mb-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg">위에 이미지 설명을 입력하고 생성 버튼을 눌러주세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


