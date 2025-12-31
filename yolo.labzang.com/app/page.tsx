'use client'

import { useState } from 'react'

interface GenerateRequest {
  prompt: string
  negative_prompt?: string
  width?: number
  height?: number
  steps?: number
  guidance_scale?: number
  seed?: number
}

interface GenerateResponse {
  id: string
  image_url: string
  meta_url: string
  meta: any
}

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [width, setWidth] = useState(768)
  const [height, setHeight] = useState(768)
  const [steps, setSteps] = useState(4)
  const [seed, setSeed] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateResponse | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const requestBody: GenerateRequest = {
        prompt: prompt.trim(),
        width,
        height,
        steps,
        seed,
      }

      if (negativePrompt.trim()) {
        requestBody.negative_prompt = negativePrompt.trim()
      }

      console.log('이미지 생성 요청:', requestBody)

      const response = await fetch('http://localhost:8000/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: '이미지 생성에 실패했습니다.' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data: GenerateResponse = await response.json()
      console.log('이미지 생성 완료:', data)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="container">
        <h1>이미지 생성</h1>

        <div className="content-wrapper">
          <div className="form-section">
            <h2>설정</h2>
            <div className="form-group">
              <label htmlFor="prompt">프롬프트 *</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: a cute robot barista, cinematic lighting"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="negative-prompt">네거티브 프롬프트</label>
              <textarea
                id="negative-prompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="예: blurry, low quality"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="width">너비</label>
                <input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min={64}
                  max={1024}
                  step={64}
                />
              </div>

              <div className="form-group">
                <label htmlFor="height">높이</label>
                <input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min={64}
                  max={1024}
                  step={64}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="steps">Steps</label>
                <input
                  id="steps"
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>

              <div className="form-group">
                <label htmlFor="seed">Seed (선택)</label>
                <input
                  id="seed"
                  type="number"
                  value={seed || ''}
                  onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="랜덤"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="generate-button"
            >
              {loading ? '생성 중...' : '이미지 생성'}
            </button>
          </div>

          <div className="image-section">
            <h2>생성된 이미지</h2>
            {loading && (
              <div className="loading">
                <p>이미지를 생성하고 있습니다...</p>
                <p className="loading-note">(보통 15-30초 정도 소요됩니다)</p>
              </div>
            )}
            {!loading && !result && (
              <div className="placeholder">
                <p>이미지가 생성되면 여기에 표시됩니다</p>
              </div>
            )}
            {result && (
              <div className="result-content">
                <div className="image-container">
                  <img
                    src={`http://localhost:8000${result.image_url}`}
                    alt="Generated"
                    className="generated-image"
                  />
                </div>
                <div className="result-info">
                  <p><strong>ID:</strong> {result.id}</p>
                  <a
                    href={`http://localhost:8000${result.image_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="image-link"
                  >
                    새 탭에서 보기
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

