import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const note = { id: parseInt(id), ...body, updatedAt: new Date().toISOString() };
    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('PostIt PUT Error:', error);
    return NextResponse.json({ error: 'Not güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PostIt DELETE Error:', error);
    return NextResponse.json({ error: 'Not silinemedi' }, { status: 500 });
  }
}
