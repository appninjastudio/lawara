import { NextRequest, NextResponse } from 'next/server';

const MOCK_NOTES = [
  { id: 1, userId: 1, title: 'Ahmet Yılmaz - Ödeme Takibi', content: 'Yarın aranacak, taksit ödemesi hatırlatılacak.', color: 'yellow', caseId: '2024/1234', pinned: true, createdAt: '2024-12-15T10:00:00Z' },
  { id: 2, userId: 1, title: 'UYAP Güncelleme', content: 'Yeni dosyalar UYAP\'tan çekilecek.', color: 'blue', caseId: null, pinned: false, createdAt: '2024-12-14T09:00:00Z' },
  { id: 3, userId: 1, title: 'Haciz Randevusu', content: 'Ali Öztürk dosyası için haciz randevusu alınacak.', color: 'red', caseId: '2024/1237', pinned: true, createdAt: '2024-12-13T14:00:00Z' },
];

export async function GET() {
  try {
    return NextResponse.json({ data: MOCK_NOTES });
  } catch (error) {
    console.error('PostIt GET Error:', error);
    return NextResponse.json({ error: 'Notlar getirilemedi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Başlık zorunludur' }, { status: 400 });
    }
    const note = {
      id: Date.now(),
      userId: 1,
      title: body.title.trim(),
      content: body.content?.trim() || '',
      color: body.color || 'yellow',
      caseId: body.caseId?.trim() || null,
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('PostIt POST Error:', error);
    return NextResponse.json({ error: 'Not oluşturulamadı' }, { status: 500 });
  }
}
