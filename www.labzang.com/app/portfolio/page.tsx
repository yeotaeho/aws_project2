'use client';

import { useState, useRef, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DraggableItem {
  id: string;
  content: string;
  color: string;
}

export default function PortfolioPage() {
  const [items, setItems] = useState<DraggableItem[]>([
    { id: '1', content: '아이템 1', color: 'bg-blue-500' },
    { id: '2', content: '아이템 2', color: 'bg-green-500' },
    { id: '3', content: '아이템 3', color: 'bg-purple-500' },
    { id: '4', content: '아이템 4', color: 'bg-red-500' },
    { id: '5', content: '아이템 5', color: 'bg-yellow-500' },
  ]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 파일인지 확인
  const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
  };

  // 아이템 드래그 시작
  const handleDragStart = (e: DragEvent<HTMLDivElement>, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', itemId);
  };

  // 드래그 오버
  const handleDragOver = (e: DragEvent<HTMLDivElement>, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem !== itemId) {
      setDraggedOver(itemId);
    }
  };

  // 드래그 리브
  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  // 드롭
  const handleDrop = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedItem && draggedItem !== targetId) {
      const draggedIndex = items.findIndex((item) => item.id === draggedItem);
      const targetIndex = items.findIndex((item) => item.id === targetId);

      const newItems = [...items];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, removed);

      setItems(newItems);
    }

    setDraggedItem(null);
    setDraggedOver(null);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOver(null);
  };

  // 파일 드래그 오버
  const handleFileDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  // 파일 드래그 리브
  const handleFileDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  // 파일 드롭
  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = Array.from(e.dataTransfer.files);
    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);

    // 이미지 파일 미리보기 생성
    files.forEach((file, offset) => {
      if (isImageFile(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const index = uploadedFiles.length + offset;
          setImagePreviews((prev) => ({
            ...prev,
            [index]: e.target?.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = [...uploadedFiles, ...files];
      setUploadedFiles(newFiles);

      // 이미지 파일 미리보기 생성
      files.forEach((file, offset) => {
        if (isImageFile(file)) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const index = uploadedFiles.length + offset;
            setImagePreviews((prev) => ({
              ...prev,
              [index]: e.target?.result as string,
            }));
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  // 파일 삭제
  const handleFileRemove = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews: { [key: number]: string } = {};
      Object.keys(prev).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum < index) {
          newPreviews[keyNum] = prev[keyNum];
        } else if (keyNum > index) {
          newPreviews[keyNum - 1] = prev[keyNum];
        }
      });
      return newPreviews;
    });
  };

  // 추가 버튼 클릭 - 파일을 yolo 폴더에 저장하고 얼굴 디텍션 수행
  const handleAddClick = async () => {
    if (uploadedFiles.length === 0) {
      alert('저장할 파일이 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload-yolo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // 디텍션 결과 요약
        const totalFaces = result.detections?.reduce((sum: number, det: any) =>
          sum + (det.total_objects || 0), 0) || 0;
        const successCount = result.detections?.filter((det: any) => det.success).length || 0;

        let message = result.message || '파일이 성공적으로 저장되었습니다.';
        if (totalFaces > 0) {
          message += `\n총 ${totalFaces}개의 얼굴이 감지되었습니다.`;
        }
        if (successCount < result.detections?.length) {
          message += `\n${result.detections.length - successCount}개의 파일에서 디텍션 실패.`;
        }

        alert(message);

        // 성공 시 파일 목록 초기화
        setUploadedFiles([]);
        setImagePreviews({});
      } else {
        alert(`오류: ${result.error || '파일 저장에 실패했습니다.'}`);
      }
    } catch (error) {
      console.error('파일 저장 오류:', error);
      alert('파일 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← 홈으로
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={handleAddClick}
              disabled={isSaving || uploadedFiles.length === 0}
            >
              {isSaving ? '저장 중...' : '추가'}
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">포트폴리오</h1>
          <p className="text-gray-400">드래그 앤 드롭으로 아이템을 재배치하고 파일을 업로드하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 드래그 앤 드롭 아이템 영역 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">아이템 재배치</h2>
            <p className="text-sm text-gray-400 mb-4">
              아이템을 드래그하여 순서를 변경할 수 있습니다
            </p>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={`
                    p-4 rounded-lg cursor-move transition-all
                    ${item.color} 
                    ${draggedItem === item.id ? 'opacity-50 scale-95' : ''}
                    ${draggedOver === item.id ? 'ring-4 ring-yellow-400 scale-105' : ''}
                    hover:shadow-lg
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{item.content}</span>
                    <svg
                      className="w-5 h-5 text-white opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 파일 드래그 앤 드롭 영역 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">파일 업로드</h2>
            <p className="text-sm text-gray-400 mb-4">
              파일을 드래그하여 업로드하거나 클릭하여 선택하세요
            </p>

            {/* 드롭 존 */}
            <div
              onDragOver={handleFileDragOver}
              onDragLeave={handleFileDragLeave}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-all mb-4
                ${isDraggingFile
                  ? 'border-blue-500 bg-blue-500/10 scale-105'
                  : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-300 font-medium mb-2">
                {isDraggingFile ? '여기에 파일을 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
              </p>
              <p className="text-sm text-gray-500">
                여러 파일을 한 번에 업로드할 수 있습니다
              </p>
            </div>

            {/* 업로드된 파일 썸네일 그리드 */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-xs text-gray-400 mb-3">
                  업로드된 파일 ({uploadedFiles.length})
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                    >
                      {isImageFile(file) && imagePreviews[index] ? (
                        <img
                          src={imagePreviews[index]}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2">
                          <svg
                            className="w-6 h-6 text-gray-400 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-[8px] text-gray-400 text-center truncate w-full px-1">
                            {file.name}
                          </p>
                        </div>
                      )}
                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileRemove(index);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      {/* 파일 정보 오버레이 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[8px] text-white truncate">{file.name}</p>
                        <p className="text-[7px] text-gray-300">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
