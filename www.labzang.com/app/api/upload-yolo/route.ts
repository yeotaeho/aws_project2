import { NextRequest, NextResponse } from 'next/server';

// YOLO 서비스 URL (환경 변수에서 가져오거나 기본값 사용)
const YOLO_SERVICE_URL = process.env.NEXT_PUBLIC_YOLO_SERVICE_URL || 'http://localhost:9030';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: '파일이 없습니다.' },
                { status: 400 }
            );
        }

        // YOLO 서비스로 파일 전송
        const yoloFormData = new FormData();
        files.forEach((file) => {
            yoloFormData.append('files', file);
        });

        const response = await fetch(`${YOLO_SERVICE_URL}/api/upload-yolo`, {
            method: 'POST',
            body: yoloFormData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            return NextResponse.json(
                { error: errorData.error || 'YOLO 서비스에서 오류가 발생했습니다.' },
                { status: response.status }
            );
        }

        const result = await response.json();

        return NextResponse.json({
            success: true,
            message: result.message || `${files.length}개의 파일이 저장되고 디텍션되었습니다.`,
            files: result.files || [],
            detections: result.detections || [],
        });
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        return NextResponse.json(
            { error: '파일 업로드 중 오류가 발생했습니다.', details: String(error) },
            { status: 500 }
        );
    }
}

