import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // 인증 (Bearer)
  const auth = req.headers.get('authorization');
  if (auth !== 'Bearer sk_live_b8d81e8adbdc499ebcf6bb3b6fc41827_KEY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 데이터 파싱
  const { title, url, content, date } = await req.json();

  // (TODO: 실제 DB 저장 로직)
  // 일단 받은 데이터 그대로 반환
  return NextResponse.json({
    message: 'Article saved!',
    data: { title, url, content, date },
  });
}
