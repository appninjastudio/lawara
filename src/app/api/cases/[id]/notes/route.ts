import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Not içeriği zorunludur' }, { status: 400 });
    }

    const note = {
      id: Date.now(),
      caseId: parseInt(id),
      userId: 1,
      content: body.content.trim(),
      type: body.type || 'note',
      createdAt: new Date().toISOString(),
      user: { id: 1, name: 'Talip Furkan Doğan' },
    };

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Note POST Error:', error);
    return NextResponse.json({ error: 'Not eklenemedi' }, { status: 500 });
  }
}
